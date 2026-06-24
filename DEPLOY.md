# Hướng dẫn deploy bằng Docker

Cách deploy này đảm bảo **prod = local 100%**: cùng image = cùng code + cùng dependencies + cùng cấu trúc DB + cùng dữ liệu seed.

## Yêu cầu

- Docker + Docker Compose v2+ (kiểm tra: `docker --version` và `docker compose version`)

## Lần đầu setup

### Bước 0 — Clone 2 repo thành thư mục NGANG CẤP

`docker-compose.yml` nằm trong `be-phanmemzalo/` và build FE từ `../fe-phanmemzalo`,
nên 2 repo PHẢI ở cùng 1 thư mục cha:

```bash
mkdir -p /srv/phanmemzalo && cd /srv/phanmemzalo
git clone https://github.com/phamtuanyb/be-phanmemzalo.git
git clone https://github.com/phamtuanyb/fe-phanmemzalo.git
cd be-phanmemzalo          # mọi lệnh docker compose chạy từ đây
```

### Bước 1 — Tạo file `.env`

```bash
cp .env.production.example .env   # đã điền sẵn domain phanmemzalo.com
```

Mở `.env` chỉnh các biến quan trọng:

**Trên prod** (hoặc dùng sẵn `cp .env.production.example .env` — đã điền sẵn domain):
- `JWT_SECRET` và `JWT_REFRESH_SECRET` → đổi sang chuỗi ngẫu nhiên (vd `openssl rand -hex 32`)
- `DB_PASSWORD` → đổi password mạnh
- `PUBLIC_URL` → `https://api.phanmemzalo.com`
- `CORS_ORIGINS` → `https://phanmemzalo.com,https://www.phanmemzalo.com`
- `NEXT_PUBLIC_API_URL` → `https://api.phanmemzalo.com`
- `NEXT_PUBLIC_SITE_URL` → `https://phanmemzalo.com`
- SMTP_* nếu muốn nhận form qua email

### Bước 2 — Build và start

```bash
docker compose up -d --build
```

Lần đầu chạy sẽ:
1. Pull image Postgres 16
2. Build BE image (~3-5 phút)
3. Build FE image (~5-8 phút)
4. Start container theo thứ tự postgres → backend → frontend
5. **Tự động chạy migration + seed dữ liệu từ `snapshot.json`** (vì DB rỗng)

### Bước 3 — Kiểm tra

```bash
docker compose ps                  # cả 3 service phải Up
docker compose logs -f backend     # xem log BE
curl http://localhost:3001/api/health  # nếu có health endpoint
```

Truy cập (nội bộ server):
- FE: http://localhost:3000
- BE: http://localhost:3001/docs
- Admin: http://localhost:3000/admin

### Bước 4 — Nginx reverse proxy + SSL (để chạy qua domain HTTPS)

Container chỉ chạy ở `localhost:3000/3001`. Để phục vụ `phanmemzalo.com` qua HTTPS,
dùng file [`nginx/phanmemzalo.conf`](nginx/phanmemzalo.conf):

```bash
# DNS: trỏ phanmemzalo.com, www.phanmemzalo.com, api.phanmemzalo.com → IP server
sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp nginx/phanmemzalo.conf /etc/nginx/sites-available/phanmemzalo.conf
sudo ln -s /etc/nginx/sites-available/phanmemzalo.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo ufw allow 'Nginx Full'
# Cấp SSL + tự bật HTTPS:
sudo certbot --nginx -d phanmemzalo.com -d www.phanmemzalo.com -d api.phanmemzalo.com
```

Sau bước này: web chạy ở **https://phanmemzalo.com**, API ở **https://api.phanmemzalo.com**.

### Bước 5 — Việc cần làm sau khi lên
1. Đổi mật khẩu admin (`root@vsoftware.vn` / `admin@example.com`)
2. Bật Telegram trong `/admin/telegram` (Bot Token + Chat ID)
3. Kiểm tra form `/lien-he` + popup "Dùng thử" gửi được mail/Telegram

## Các lệnh thường dùng

| Mục đích | Lệnh |
|---|---|
| Start tất cả | `docker compose up -d` |
| Stop tất cả (giữ data) | `docker compose down` |
| **Stop + xoá DB** ⚠️ | `docker compose down -v` |
| Xem log realtime | `docker compose logs -f` |
| Xem log 1 service | `docker compose logs -f backend` |
| Restart 1 service | `docker compose restart backend` |
| Rebuild khi đổi code | `docker compose up -d --build` |
| Vào shell container | `docker compose exec backend sh` |
| Reset toàn bộ data | `docker compose down -v && docker compose up -d` |

## Cập nhật code lên prod

```bash
git pull
docker compose up -d --build
```

Compose tự động build lại image nào có thay đổi, restart container, giữ nguyên DB và uploads.

## Khi nào cần rebuild FE

**FE phải rebuild khi đổi:**
- Bất kỳ biến `NEXT_PUBLIC_*` nào trong `.env`
- Code FE (`fe-phanmemzalo/`)
- `package.json`

```bash
docker compose build frontend
docker compose up -d frontend
```

## Quản lý dữ liệu

### Cập nhật snapshot từ local rồi đẩy lên prod

```bash
# Local
cd be-phanmemzalo
npm run dump:all              # sinh snapshot.json mới
cd ..
git add be-phanmemzalo/src/database/seeds/snapshot.json
git commit -m "data: update snapshot"
git push

# Prod
git pull
# Snapshot mới chỉ tự seed khi DB rỗng. Nếu muốn FORCE restore:
docker compose exec backend npm run seed:all -- --reset
```

### Backup DB

```bash
docker compose exec postgres pg_dump -U postgres news_db > backup-$(date +%Y%m%d).sql
```

### Restore DB từ backup

```bash
docker compose exec -T postgres psql -U postgres news_db < backup-20260603.sql
```

## Cấu trúc files

```
/srv/phanmemzalo/                  # thư mục cha (2 repo ngang cấp)
├── be-phanmemzalo/                # ← chạy `docker compose` Ở ĐÂY
│   ├── docker-compose.yml         # Orchestrator (build FE từ ../fe-phanmemzalo)
│   ├── .env.production.example    # Template config (copy → .env)
│   ├── .env                       # Config thật (KHÔNG commit)
│   ├── Dockerfile                 # Multi-stage build BE
│   ├── docker-entrypoint.sh       # Tự run migration + seed lần đầu
│   ├── nginx/phanmemzalo.conf     # Cấu hình Nginx reverse proxy + SSL
│   ├── uploads/                   # Bind mount, ảnh sống ngoài container
│   └── DEPLOY.md                  # File này
└── fe-phanmemzalo/                # repo FE (sibling — build context của frontend)
    ├── Dockerfile                 # Multi-stage build FE
    └── next.config.mjs            # output: 'standalone' cho Docker
```

## Volumes

| Tên | Dùng cho | Có sống khi `down`? |
|---|---|---|
| `phanmemzalo_postgres_data` | DB Postgres | ✅ Có |
| `./be-phanmemzalo/uploads` | Ảnh upload | ✅ Có (bind mount) |

⚠️ `docker compose down -v` sẽ xoá `postgres_data`. Ảnh upload an toàn vì là bind mount.

## Trouble­shooting

**FE gọi sai API URL** → Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env`, rebuild FE.

**BE 500 khi save settings** → `docker compose logs backend` xem error. Có thể migration chưa chạy.

**Mất ảnh** → Folder `be-phanmemzalo/uploads/` còn không. Nếu rỗng thì restore từ backup hoặc git.

**Container không khởi động** → `docker compose ps` xem trạng thái, `docker compose logs <service>` xem nguyên nhân.
