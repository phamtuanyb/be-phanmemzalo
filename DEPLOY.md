# Hướng dẫn deploy bằng Docker

Cách deploy này đảm bảo **prod = local 100%**: cùng image = cùng code + cùng dependencies + cùng cấu trúc DB + cùng dữ liệu seed.

## Yêu cầu

- Docker + Docker Compose v2+ (kiểm tra: `docker --version` và `docker compose version`)

## Lần đầu setup

### Bước 1 — Tạo file `.env`

```bash
cp .env.example .env
```

Mở `.env` chỉnh các biến quan trọng:

**Trên prod:**
- `JWT_SECRET` và `JWT_REFRESH_SECRET` → đổi sang chuỗi ngẫu nhiên (vd `openssl rand -hex 32`)
- `DB_PASSWORD` → đổi password mạnh
- `PUBLIC_URL` → `https://api.vsoftware.vn`
- `CORS_ORIGINS` → `https://vsoftware.vn`
- `NEXT_PUBLIC_API_URL` → `https://api.vsoftware.vn`
- `NEXT_PUBLIC_SITE_URL` → `https://vsoftware.vn`
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

Truy cập:
- FE: http://localhost:3000
- BE: http://localhost:3001/docs
- Admin: http://localhost:3000/admin

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
- Code FE (`fe-vsoftware/`)
- `package.json`

```bash
docker compose build frontend
docker compose up -d frontend
```

## Quản lý dữ liệu

### Cập nhật snapshot từ local rồi đẩy lên prod

```bash
# Local
cd be-vsoftware
npm run dump:all              # sinh snapshot.json mới
cd ..
git add be-vsoftware/src/database/seeds/snapshot.json
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
.
├── docker-compose.yml          # Orchestrator chính
├── .env.example                # Template config (copy → .env)
├── .env                        # Config thật (KHÔNG commit)
├── be-vsoftware/
│   ├── Dockerfile              # Multi-stage build BE
│   ├── docker-entrypoint.sh    # Tự run migration + seed lần đầu
│   ├── .dockerignore
│   └── uploads/                # Volume mount, ảnh sống ngoài container
├── fe-vsoftware/
│   ├── Dockerfile              # Multi-stage build FE
│   ├── .dockerignore
│   └── next.config.mjs         # output: 'standalone' cho Docker
└── DEPLOY.md                   # File này
```

## Volumes

| Tên | Dùng cho | Có sống khi `down`? |
|---|---|---|
| `vsoftware_postgres_data` | DB Postgres | ✅ Có |
| `./be-vsoftware/uploads` | Ảnh upload | ✅ Có (bind mount) |

⚠️ `docker compose down -v` sẽ xoá `postgres_data`. Ảnh upload an toàn vì là bind mount.

## Trouble­shooting

**FE gọi sai API URL** → Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env`, rebuild FE.

**BE 500 khi save settings** → `docker compose logs backend` xem error. Có thể migration chưa chạy.

**Mất ảnh** → Folder `be-vsoftware/uploads/` còn không. Nếu rỗng thì restore từ backup hoặc git.

**Container không khởi động** → `docker compose ps` xem trạng thái, `docker compose logs <service>` xem nguyên nhân.
