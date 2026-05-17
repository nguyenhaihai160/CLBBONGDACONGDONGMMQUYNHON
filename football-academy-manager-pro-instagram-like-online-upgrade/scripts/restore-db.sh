#!/usr/bin/env bash
set -e

if [ -z "$1" ]; then
  echo "Cách dùng: ./scripts/restore-db.sh backups/file.sql"
  exit 1
fi

FILE="$1"
if [ ! -f "$FILE" ]; then
  echo "Không tìm thấy file: $FILE"
  exit 1
fi

DB_CONTAINER=$(docker compose -f docker-compose.web.yml ps -q db)
if [ -z "$DB_CONTAINER" ]; then
  echo "Không tìm thấy container db. Hãy chạy app trước."
  exit 1
fi

source .env
POSTGRES_USER=${POSTGRES_USER:-football}
POSTGRES_DB=${POSTGRES_DB:-football_academy}

echo "CẢNH BÁO: restore có thể ghi đè dữ liệu hiện tại. Bấm Ctrl+C để hủy, Enter để tiếp tục."
read -r _

docker exec -i "$DB_CONTAINER" psql -U "$POSTGRES_USER" "$POSTGRES_DB" < "$FILE"
echo "Đã restore database từ: $FILE"
