# Hướng dẫn deploy VPS với PM2 (cho người không chuyên)

File này hướng dẫn deploy Vsoftware lên server VPS chạy Linux (Ubuntu/Debian) bằng PM2.
**Toàn bộ command đều copy-paste được, không cần biết code.**

---

## 📋 Tóm tắt nhanh

| Khi nào | Lệnh gõ |
|---|---|
| Lần đầu setup server | Làm hết phần [Bước 1-5](#bước-1--cài-môi-trường-trên-vps) (làm 1 lần duy nhất) |
| Update website (mỗi lần local sửa xong) | `bash deploy-pm2.sh` (BE) + `bash deploy-pm2.sh` (FE) |
| Backup DB tự động | `bash setup-backup-cron.sh` (cài 1 lần) |
| Khôi phục website khi lỗi | `gunzip < backups/dump-XXX.sql.gz \| psql ...` |

---

## ✅ Yêu cầu trước khi bắt đầu

- VPS chạy Ubuntu 20.04+ hoặc Debian 11+
- Domain `vsoftware.vn` đã trỏ về IP server
- Bạn có quyền SSH vào server (qua key hoặc password)
- Đã `git push` code mới lên git (xong qua `.\sync.ps1` trên máy bạn)

---

## Bước 1 — Cài môi trường trên VPS

SSH vào server, rồi chạy từng nhóm lệnh bên dưới (copy nguyên cả khối, paste vào terminal):

### 1.1 — Cài Node.js 20, npm, git, build-essential

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Node.js 20 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential

# Kiểm tra version
node -v   # phải in v20.x.x
npm -v    # phải in 10.x.x
```

### 1.2 — Cài PostgreSQL 16

```bash
sudo apt install -y postgresql postgresql-contrib

# Tạo user và database
sudo -u postgres psql <<EOF
CREATE USER vsoftware WITH PASSWORD 'doi_password_manh_o_day';
CREATE DATABASE news_db OWNER vsoftware;
GRANT ALL PRIVILEGES ON DATABASE news_db TO vsoftware;
EOF
```

**⚠️ Đổi `doi_password_manh_o_day` thành password mạnh.** Lưu lại password này, sẽ dùng ở [Bước 3](#bước-3--cấu-hình-env).

### 1.3 — Cài PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Cài auto-start cho PM2 khi reboot server
pm2 startup
# PM2 sẽ in ra 1 dòng lệnh — copy nguyên dòng đó và chạy theo hướng dẫn
```

### 1.4 — Cài nginx (reverse proxy + HTTPS)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

---

## Bước 2 — Clone code từ git

```bash
# Tạo folder gốc
sudo mkdir -p /srv/vsoftware
sudo chown -R $USER:$USER /srv/vsoftware
cd /srv/vsoftware

# Clone BE
git clone https://github.com/VitechGroup/api-vsoftware.git be-vsoftware

# Clone FE (đổi URL nếu khác)
git clone <FE_REPO_URL> fe-vsoftware
```

Sau bước này, cấu trúc sẽ là:
```
/srv/vsoftware/
├── be-vsoftware/
└── fe-vsoftware/
```

---

## Bước 3 — Cấu hình .env

### 3.1 — BE `.env`

```bash
cd /srv/vsoftware/be-vsoftware
cp .env.example .env
nano .env
```

Sửa các giá trị sau (các cái còn lại giữ nguyên):

```ini
DB_USERNAME=vsoftware
DB_PASSWORD=doi_password_manh_o_day    # password đã set ở bước 1.2
DB_DATABASE=news_db
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET=<sinh chuỗi random dài 64 ký tự — dùng: openssl rand -hex 32>
JWT_REFRESH_SECRET=<sinh chuỗi random khác — dùng: openssl rand -hex 32>

PUBLIC_URL=https://api.vsoftware.vn
CORS_ORIGINS=https://vsoftware.vn

# SMTP (nếu muốn nhận email form khách gửi)
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password-google
SMTP_FROM_ADDRESS=your-email@gmail.com
CONTACT_RECEIVE_EMAIL=ban@vsoftware.vn
```

Lưu file: `Ctrl+O` → `Enter` → `Ctrl+X`.

### 3.2 — FE `.env.production`

```bash
cd /srv/vsoftware/fe-vsoftware
nano .env.production
```

Nội dung:

```ini
NEXT_PUBLIC_API_URL=https://api.vsoftware.vn
NEXT_PUBLIC_SITE_URL=https://vsoftware.vn
NEXT_PUBLIC_SITE_NAME=Vsoftware
```

Lưu file (Ctrl+O, Enter, Ctrl+X).

---

## Bước 4 — Build & khởi động lần đầu

### 4.1 — BE

```bash
cd /srv/vsoftware/be-vsoftware
chmod +x deploy-pm2.sh backup-db.sh setup-backup-cron.sh
bash deploy-pm2.sh
```

Script sẽ tự động:
1. Backup DB (rỗng ban đầu)
2. `npm ci` cài dependencies
3. `npm run build` build dist/
4. `npm run migration:run` tạo schema
5. `npm run seed:all` import dữ liệu từ snapshot.json
6. `pm2 start ecosystem.config.js` khởi động BE

Kiểm tra:
```bash
pm2 status               # phải thấy vsoftware-api status: online
curl http://localhost:3001/docs    # phải trả về HTML Swagger
```

### 4.2 — FE

```bash
cd /srv/vsoftware/fe-vsoftware
chmod +x deploy-pm2.sh
bash deploy-pm2.sh
```

Kiểm tra:
```bash
pm2 status               # phải có cả vsoftware-fe và vsoftware-api status: online
curl http://localhost:3000   # phải trả về HTML
```

### 4.3 — Save PM2 state

```bash
pm2 save
```

Sau lệnh này, PM2 sẽ nhớ và tự khởi động lại các process nếu server reboot.

---

## Bước 5 — Cấu hình nginx + HTTPS

### 5.1 — Tạo file nginx config

```bash
sudo nano /etc/nginx/sites-available/vsoftware
```

Paste nội dung sau:

```nginx
# Frontend
server {
    listen 80;
    server_name vsoftware.vn www.vsoftware.vn;

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.vsoftware.vn;

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Lưu file. Bật config:

```bash
sudo ln -s /etc/nginx/sites-available/vsoftware /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default      # bỏ config mặc định
sudo nginx -t                                  # phải in: syntax is ok, test is successful
sudo systemctl reload nginx
```

### 5.2 — Cài HTTPS với Let's Encrypt

```bash
sudo certbot --nginx -d vsoftware.vn -d www.vsoftware.vn -d api.vsoftware.vn
```

Certbot sẽ hỏi vài câu (email, agree terms, redirect HTTP→HTTPS — chọn YES).

**Kiểm tra:** mở browser, truy cập `https://vsoftware.vn` → phải thấy website chạy với 🔒 HTTPS.

---

## Bước 6 — Cài backup DB tự động (mỗi 5h)

```bash
cd /srv/vsoftware/be-vsoftware
bash setup-backup-cron.sh
```

Xong! Server sẽ tự backup DB mỗi 5h vào folder `backups/`, giữ 7 ngày gần nhất.

Kiểm tra cron:
```bash
crontab -l    # phải thấy 1 dòng: 0 */5 * * * cd ... backup-db.sh
```

---

## 🔄 Quy trình UPDATE website (sau khi setup xong)

Khi anh sửa code/data ở local rồi `.\sync.ps1` xong, lên server gõ:

### Update BE
```bash
cd /srv/vsoftware/be-vsoftware
bash deploy-pm2.sh
```

### Update FE
```bash
cd /srv/vsoftware/fe-vsoftware
bash deploy-pm2.sh
```

Mỗi script chạy xong sẽ thông báo "DEPLOY ... hoàn tất!". Website live trong ~10-30 giây.

**Lưu ý quan trọng:** `deploy-pm2.sh` BE **GIỮ NGUYÊN data prod** — chỉ thêm record mới từ snapshot, không ghi đè data anh sửa qua admin prod. Nếu muốn force ghi đè 100%:

```bash
bash deploy-pm2.sh --force-reset   # CẨN THẬN: mất data prod-only
```

---

## 📊 Các lệnh giám sát hàng ngày

```bash
pm2 status                       # xem 2 process có online không
pm2 logs vsoftware-api           # log BE realtime
pm2 logs vsoftware-fe            # log FE realtime
pm2 monit                        # dashboard RAM/CPU
pm2 restart vsoftware-api        # restart BE (có downtime nhẹ)
pm2 reload vsoftware-api         # reload BE (không downtime)
```

```bash
tail -100 logs/backup.log        # log backup gần nhất
ls -lh backups/                  # danh sách backup
df -h                            # còn bao nhiêu disk
free -h                          # còn bao nhiêu RAM
```

---

## 🚨 Trouble­shooting

### Website hiện 500 sau khi deploy
```bash
pm2 logs vsoftware-api --lines 100      # xem error BE
pm2 logs vsoftware-fe --lines 100       # xem error FE
```

Nếu thấy lỗi DB connection → check `.env` đúng password chưa.
Nếu thấy lỗi build → có thể code mới bị lỗi syntax, rollback bằng `git reset --hard HEAD~1`.

### Mất dữ liệu sau deploy
Restore từ backup gần nhất:
```bash
cd /srv/vsoftware/be-vsoftware/backups
ls -lt | head     # tìm file gần nhất
gunzip < dump-XXX.sql.gz | psql -h localhost -U vsoftware -d news_db
pm2 restart vsoftware-api
```

### Nginx báo 502 Bad Gateway
→ BE hoặc FE đang down. Check:
```bash
pm2 status
pm2 restart all
```

### Cron backup không chạy
```bash
crontab -l                  # cron đã cài chưa?
tail -50 logs/backup.log    # log có lỗi gì không
sudo systemctl status cron  # cron service chạy chưa
```

---

## 🔐 Bảo mật cơ bản

```bash
# Bật firewall, chỉ mở 22 (SSH), 80, 443 (web)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Tự renew SSL (certbot tự setup cron, kiểm tra):
sudo systemctl status certbot.timer
```

---

## 📞 Khi cần giúp

Nếu gặp lỗi không hiểu, chụp màn hình terminal + nói với assistant để được hướng dẫn cụ thể.
