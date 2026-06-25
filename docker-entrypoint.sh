#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Entrypoint cho container BE:
#   1. Đợi Postgres sẵn sàng
#   2. Chạy migration:run
#   3. Seed: CHỈ khi FORCE_RESEED=1 (thủ công, ghi đè data). Mặc định KHÔNG seed.
#      Migration đã lo khung tối thiểu (admin + danh mục/menu/footer) nên deploy
#      thường chỉ đẩy CODE, không đụng dữ liệu hiện có.
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

# ── Seed dữ liệu ─────────────────────────────────────────────────────────────
# KHÔNG tự động nạp snapshot nữa. Migration đã cung cấp khung tối thiểu (admin
# root@vsoftware.vn, 6 danh mục + menu + footer mặc định). Nhờ vậy:
#   - Deploy thường: chỉ code + migration, KHÔNG đẩy data, KHÔNG đụng DB hiện có.
#   - Deploy môi trường mới (DB trống): lên site tối thiểu từ migration, 0 bài viết.
#   - QUAN TRỌNG: dù bài viết về 0, restart container KHÔNG còn tự TRUNCATE/nạp lại
#     snapshot → data thật của bạn an toàn.
# Muốn nạp lại TOÀN BỘ snapshot (GHI ĐÈ data) → chạy với biến môi trường FORCE_RESEED=1.
if [ "$FORCE_RESEED" = "1" ]; then
  echo "==> [entrypoint] FORCE_RESEED=1 → TRUNCATE + restore từ snapshot.json (THỦ CÔNG, GHI ĐÈ DATA!)"
  npm run seed:all -- --reset || echo "WARN seed --reset failed, tiếp tục start"
else
  echo "==> [entrypoint] Bỏ qua seed — chỉ migration + code. Dữ liệu hiện có giữ nguyên."
fi

echo "==> [entrypoint] Starting NestJS..."
exec node dist/main
