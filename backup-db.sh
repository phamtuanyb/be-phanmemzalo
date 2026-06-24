#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# backup-db.sh — Tự động dump database PostgreSQL ra file SQL nén.
#
# Tính năng:
#   - Đọc cấu hình DB từ file .env trong thư mục hiện tại
#   - Dump ra backups/dump-YYYYMMDD-HHMMSS.sql.gz
#   - Tự xoá backup cũ hơn 7 ngày (giữ rotation)
#   - In ra dung lượng file backup mới tạo
#
# Usage thủ công:
#   bash backup-db.sh
#
# Usage tự động — chạy mỗi 5 giờ (cài 1 lệnh):
#   bash setup-backup-cron.sh
#
# Hoặc thủ công cron mỗi 5h:
#   crontab -e
#   # thêm dòng:
#   0 */5 * * * cd /home/vsoftware.vn-api && bash backup-db.sh >> logs/backup.log 2>&1
# ─────────────────────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Load .env ───────────────────────────────────────────────────────────────
if [[ -f ".env" ]]; then
  # Export biến từ .env (bỏ qua dòng comment và rỗng)
  set -a
  source <(grep -v '^#' .env | grep -v '^\s*$')
  set +a
else
  echo "✗ Không tìm thấy file .env trong $SCRIPT_DIR" >&2
  exit 1
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_DATABASE="${DB_DATABASE:-news_db}"

# ── Tạo folder backups ──────────────────────────────────────────────────────
BACKUP_DIR="$SCRIPT_DIR/backups"
mkdir -p "$BACKUP_DIR"

# ── Tạo file backup ─────────────────────────────────────────────────────────
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
BACKUP_FILE="$BACKUP_DIR/dump-${TIMESTAMP}.sql.gz"

echo "==> Backup DB '$DB_DATABASE' (host=$DB_HOST:$DB_PORT, user=$DB_USERNAME)"
echo "==> Output: $BACKUP_FILE"

# Truyền password qua biến PGPASSWORD (an toàn hơn -W)
export PGPASSWORD="$DB_PASSWORD"

pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USERNAME" \
  -d "$DB_DATABASE" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  | gzip > "$BACKUP_FILE"

unset PGPASSWORD

# ── Kiểm tra & in dung lượng ────────────────────────────────────────────────
if [[ -f "$BACKUP_FILE" ]]; then
  SIZE=$(du -h "$BACKUP_FILE" | awk '{print $1}')
  echo "✓ Backup thành công: $BACKUP_FILE ($SIZE)"
else
  echo "✗ Backup thất bại" >&2
  exit 1
fi

# ── Rotation: xoá backup cũ hơn 7 ngày ──────────────────────────────────────
DELETED=$(find "$BACKUP_DIR" -name 'dump-*.sql.gz' -type f -mtime +7 -print -delete | wc -l)
if [[ "$DELETED" -gt 0 ]]; then
  echo "✓ Đã xoá $DELETED file backup cũ hơn 7 ngày"
fi

# ── Tổng kết ────────────────────────────────────────────────────────────────
TOTAL=$(find "$BACKUP_DIR" -name 'dump-*.sql.gz' -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | awk '{print $1}')
echo "==> Tổng: $TOTAL file backup, dung lượng folder: $TOTAL_SIZE"
echo ""
echo "Restore khi cần:"
echo "  gunzip < $BACKUP_FILE | psql -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE"
