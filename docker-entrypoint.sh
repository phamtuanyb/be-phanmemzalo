#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Entrypoint cho container BE:
#   1. Đợi Postgres sẵn sàng
#   2. Chạy migration:run
#   3. Seed dữ liệu:
#      - Nếu FORCE_RESEED=1  → seed:all --reset (TRUNCATE + restore từ snapshot)
#      - Nếu DB rỗng         → seed:all (tự nhận data lần đầu)
#      - Nếu đã có data      → bỏ qua
#   4. Khởi động NestJS
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "==> [entrypoint] Waiting for postgres at $DB_HOST:$DB_PORT..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done
echo "==> [entrypoint] Postgres OK"

echo "==> [entrypoint] Running migrations..."
npm run migration:run

# Đếm số POSTS — migration chỉ seed categories (6) + menu tối giản, KHÔNG seed posts.
# Nên posts=0 nghĩa là chưa restore snapshot lần nào → cần seed lần đầu.
# (Dùng posts thay vì categories vì migration luôn tạo 6 categories → check categories sẽ sai.)
POST_COUNT=$(node -e "
const { Client } = require('pg');
const c = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
c.connect()
  .then(() => c.query('SELECT COUNT(*) FROM posts'))
  .then(r => { console.log(r.rows[0].count); c.end(); })
  .catch(() => { console.log('0'); c.end(); });
" 2>/dev/null || echo "0")

if [ "$FORCE_RESEED" = "1" ]; then
  echo "==> [entrypoint] FORCE_RESEED=1 → TRUNCATE + restore từ snapshot.json"
  npm run seed:all -- --reset || echo "WARN seed --reset failed, tiếp tục start"
elif [ "$POST_COUNT" -lt "1" ]; then
  # --reset để xoá data tối giản migration vừa seed (categories/menu/footer cũ) → restore SẠCH từ snapshot.
  echo "==> [entrypoint] Chưa có snapshot (posts=$POST_COUNT) → restore lần đầu từ snapshot.json (--reset)"
  npm run seed:all -- --reset || echo "WARN seed failed, tiếp tục start"
else
  echo "==> [entrypoint] DB đã có data (posts=$POST_COUNT, FORCE_RESEED=$FORCE_RESEED) → giữ nguyên"
fi

echo "==> [entrypoint] Starting NestJS..."
exec node dist/main
