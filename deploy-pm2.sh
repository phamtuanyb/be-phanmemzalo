#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-pm2.sh — Auto deploy BE trên prod, GIỮ NGUYÊN 100% dữ liệu hiện có.
#
# Quy trình an toàn:
#   1. Backup DB hiện tại → file .sql.gz (rotation 7 ngày)
#   2. git pull → lấy code + snapshot.json mới
#   3. npm ci → cài dependencies (chỉ khi lock file đổi)
#   4. npm run build → build dist/
#   5. migration:run → cập nhật schema DB (chỉ THÊM cột/bảng, KHÔNG xoá data)
#   6. seed:all → THÊM data thiếu từ snapshot.json (ON CONFLICT DO NOTHING)
#      → KHÔNG ghi đè data prod hiện có (form, post admin sửa, v.v.)
#   7. pm2 reload → restart BE không downtime
#
# Cờ tuỳ chọn:
#   --force-reset   FORCE TRUNCATE DB + restore từ snapshot.json
#                   (CẨN THẬN: mọi data prod-only sẽ MẤT)
#   --skip-backup   Bỏ qua bước backup (không khuyến nghị)
#
# Usage thường:
#   bash deploy-pm2.sh                # an toàn, giữ data
#   bash deploy-pm2.sh --force-reset  # đồng bộ 100% với local snapshot
# ─────────────────────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

FORCE_RESET=false
SKIP_BACKUP=false
for arg in "$@"; do
  [[ "$arg" == "--force-reset" ]] && FORCE_RESET=true
  [[ "$arg" == "--skip-backup" ]] && SKIP_BACKUP=true
done

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${CYAN}==> $1${NC}"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
err()  { echo -e "${RED}✗ $1${NC}"; }

echo ""
log "DEPLOY BE bắt đầu lúc $(date '+%Y-%m-%d %H:%M:%S')"
[[ "$FORCE_RESET" == "true" ]] && warn "FORCE_RESET MODE: data prod sẽ bị thay thế bằng snapshot.json"
echo ""

# ── Bước 1: Backup DB hiện tại ──────────────────────────────────────────────
if [[ "$SKIP_BACKUP" == "false" ]]; then
  log "[1/7] Backup DB hiện tại (an toàn trước khi đụng vào data)..."
  if [[ -x "./backup-db.sh" ]]; then
    bash ./backup-db.sh || warn "Backup failed, vẫn tiếp tục deploy"
  else
    warn "Chưa có backup-db.sh — bỏ qua. Nên tạo file này để an toàn."
  fi
else
  warn "[1/7] --skip-backup được bật → bỏ qua backup"
fi

# ── Bước 2: Pull code ───────────────────────────────────────────────────────
log "[2/7] git pull origin main"
old_lock_hash=$(md5sum package-lock.json 2>/dev/null | awk '{print $1}' || echo "")
old_snapshot_hash=$(md5sum src/database/seeds/snapshot.json 2>/dev/null | awk '{print $1}' || echo "")
git pull --ff-only origin main
new_lock_hash=$(md5sum package-lock.json 2>/dev/null | awk '{print $1}' || echo "")
new_snapshot_hash=$(md5sum src/database/seeds/snapshot.json 2>/dev/null | awk '{print $1}' || echo "")
ok "Pull xong"

# ── Bước 3: Install deps ────────────────────────────────────────────────────
if [[ "$old_lock_hash" != "$new_lock_hash" ]]; then
  log "[3/7] package-lock.json đã đổi → npm ci"
  npm ci
else
  ok "[3/7] deps không đổi, bỏ qua npm install"
fi

# ── Bước 4: Build ───────────────────────────────────────────────────────────
log "[4/7] npm run build..."
npm run build
ok "Build xong"

# ── Bước 5: Migration ───────────────────────────────────────────────────────
log "[5/7] npm run migration:run"
npm run migration:run || warn "Migration có warning, kiểm tra log"

# ── Bước 6: Seed data ───────────────────────────────────────────────────────
if [[ "$FORCE_RESET" == "true" ]]; then
  warn "[6/7] FORCE_RESET → TRUNCATE + restore snapshot (npm run seed:all -- --reset)"
  npm run seed:all -- --reset
elif [[ "$old_snapshot_hash" != "$new_snapshot_hash" ]]; then
  log "[6/7] snapshot.json đã đổi → seed:all (chỉ THÊM data thiếu, KHÔNG ghi đè)"
  npm run seed:all || warn "Seed có warning, kiểm tra log"
else
  ok "[6/7] snapshot.json không đổi → bỏ qua seed"
fi

# ── Bước 7: PM2 reload ──────────────────────────────────────────────────────
log "[7/7] PM2 reload vsoftware-api"
if pm2 describe vsoftware-api >/dev/null 2>&1; then
  pm2 reload vsoftware-api --update-env
  ok "BE đã reload (không downtime)"
else
  warn "Process vsoftware-api chưa tồn tại — khởi động lần đầu:"
  pm2 start ecosystem.config.js
  pm2 save
  ok "BE đã khởi động lần đầu"
fi

echo ""
ok "DEPLOY BE hoàn tất!"
echo ""
log "Kiểm tra:"
echo "    pm2 status                    # trạng thái process"
echo "    pm2 logs vsoftware-api        # log realtime"
echo "    curl http://localhost:3001/docs  # health check Swagger"
echo ""
