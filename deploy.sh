#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Script deploy trên PROD server (Linux).
#
# Quy trình:
#   1. Pull repo BE (thư mục hiện tại) → lấy code/snapshot/uploads mới
#   2. Pull repo FE (../fe-vsoftware) → lấy code FE mới
#   3. Phát hiện snapshot.json đã đổi → bật FORCE_RESEED=1 (đảm bảo data = local)
#   4. docker compose up -d --build → rebuild + restart toàn bộ stack
#
# Cấu trúc thư mục yêu cầu:
#   /srv/vsoftware/
#   ├── be-vsoftware/      (clone từ git)
#   └── fe-vsoftware/      (clone từ git, ngang cấp)
#
# Usage (chạy từ thư mục be-vsoftware/):
#   bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

BE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FE_DIR="$(cd "$BE_DIR/.." && pwd)/fe-vsoftware"

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
log "Deploy bắt đầu lúc $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# ── Bước 1: Pull BE ─────────────────────────────────────────────────────────
log "[1/4] Pull BE (be-vsoftware)..."
cd "$BE_DIR"

SNAPSHOT_FILE="src/database/seeds/snapshot.json"
old_snapshot_hash=""
if [[ -f "$SNAPSHOT_FILE" ]]; then
  old_snapshot_hash=$(md5sum "$SNAPSHOT_FILE" | awk '{print $1}')
fi

git pull --ff-only origin main
ok "BE đã pull"

new_snapshot_hash=""
if [[ -f "$SNAPSHOT_FILE" ]]; then
  new_snapshot_hash=$(md5sum "$SNAPSHOT_FILE" | awk '{print $1}')
fi

# ── Bước 2: Pull FE (clone nếu chưa có) ─────────────────────────────────────
log "[2/4] Pull FE (fe-vsoftware)..."
if [[ -d "$FE_DIR/.git" ]]; then
  cd "$FE_DIR"
  git pull --ff-only origin main
  ok "FE đã pull"
else
  warn "FE_DIR ($FE_DIR) chưa có repo. Bỏ qua FE pull."
  warn "Lần đầu setup: cd .. && git clone <FE_REPO_URL> fe-vsoftware"
fi

# ── Bước 3: Quyết định FORCE_RESEED ────────────────────────────────────────
cd "$BE_DIR"
FORCE_RESEED=0
if [[ "$old_snapshot_hash" != "$new_snapshot_hash" ]]; then
  FORCE_RESEED=1
  log "[3/4] snapshot.json đã đổi → sẽ TRUNCATE DB và restore từ snapshot"
else
  ok "[3/4] snapshot.json không đổi → giữ data hiện tại"
fi

# ── Bước 4: Docker compose up ────────────────────────────────────────────────
log "[4/4] docker compose up -d --build (có thể mất 3-8 phút lần đầu)..."

# Nếu có .env, export FORCE_RESEED tạm thời để docker compose đọc được
export FORCE_RESEED

docker compose up -d --build

echo ""
ok "Deploy hoàn tất!"
echo ""
log "Kiểm tra trạng thái:"
docker compose ps
echo ""
log "Xem log realtime: docker compose logs -f"
echo ""

# Sau khi container khởi động, reset biến để lần restart sau không vô tình re-seed
if [[ "$FORCE_RESEED" == "1" ]]; then
  warn "FORCE_RESEED=1 đã được dùng ở lần này. Lần restart tiếp theo sẽ tự là 0."
  warn "Để chắc chắn, sau khi confirm prod OK, bạn có thể restart lại để clear:"
  warn "    docker compose restart backend"
fi
