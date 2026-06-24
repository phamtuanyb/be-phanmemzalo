#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-backup-cron.sh — Tự động cài cron job backup DB mỗi 5 giờ.
#
# Chạy lệnh này 1 lần duy nhất trên server prod:
#   bash setup-backup-cron.sh
#
# Sau đó server sẽ tự backup mỗi 5h: vào 0:00, 5:00, 10:00, 15:00, 20:00.
# Log backup ghi vào ./logs/backup.log
#
# Để xem các cron đang chạy:
#   crontab -l
#
# Để gỡ bỏ:
#   bash setup-backup-cron.sh --remove
# ─────────────────────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-db.sh"
LOG_FILE="$SCRIPT_DIR/logs/backup.log"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

REMOVE=false
[[ "$1" == "--remove" ]] && REMOVE=true

# ── Cron expression: mỗi 5h, đúng phút 0 ────────────────────────────────────
CRON_SCHEDULE='0 */5 * * *'
CRON_CMD="cd $SCRIPT_DIR && bash backup-db.sh >> $LOG_FILE 2>&1"
CRON_TAG="# VSOFTWARE_BACKUP"
CRON_LINE="$CRON_SCHEDULE $CRON_CMD $CRON_TAG"

# ── Đảm bảo folder logs tồn tại ─────────────────────────────────────────────
mkdir -p "$SCRIPT_DIR/logs"

# ── Đọc crontab hiện tại, loại bỏ dòng có tag VSOFTWARE_BACKUP ──────────────
CURRENT_CRON=$(crontab -l 2>/dev/null | grep -v "$CRON_TAG" || true)

if [[ "$REMOVE" == "true" ]]; then
  echo -e "${CYAN}==> Gỡ bỏ cron backup DB...${NC}"
  echo "$CURRENT_CRON" | crontab -
  echo -e "${GREEN}✓ Đã gỡ cron backup. Backup tự động đã DỪNG.${NC}"
  exit 0
fi

# ── Kiểm tra backup-db.sh tồn tại và executable ──────────────────────────────
if [[ ! -f "$BACKUP_SCRIPT" ]]; then
  echo -e "${RED}✗ Không tìm thấy backup-db.sh trong $SCRIPT_DIR${NC}" >&2
  exit 1
fi
chmod +x "$BACKUP_SCRIPT"

# ── Cài cron mới ────────────────────────────────────────────────────────────
echo -e "${CYAN}==> Cài cron backup DB mỗi 5 giờ...${NC}"

NEW_CRON="$CURRENT_CRON
$CRON_LINE"

# Loại bỏ dòng trống đầu nếu có
NEW_CRON=$(echo "$NEW_CRON" | sed '/^$/d; 1{/^[[:space:]]*$/d}')

echo "$NEW_CRON" | crontab -

echo -e "${GREEN}✓ Đã cài thành công!${NC}"
echo ""
echo "Lịch chạy: mỗi 5h (00:00, 05:00, 10:00, 15:00, 20:00)"
echo "Lệnh chạy: $CRON_CMD"
echo "Log lưu  : $LOG_FILE"
echo ""
echo "Kiểm tra cron đã cài:"
echo "  crontab -l"
echo ""
echo "Xem log backup gần nhất (sau khi chạy lần đầu):"
echo "  tail -50 $LOG_FILE"
echo ""
echo "Test ngay (không đợi cron trigger):"
echo "  bash $BACKUP_SCRIPT"
