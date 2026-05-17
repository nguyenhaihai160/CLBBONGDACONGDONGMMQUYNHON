#!/usr/bin/env bash
set -e

mkdir -p backups
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
FILE="backups/football_academy_$DATE.sql"

DB_CONTAINER=$(docker compose -f docker-compose.web.yml ps -q db)
if [ -z "$DB_CONTAINER" ]; then
  echo "Không tìm thấy container db. Hãy chạy app trước."
  exit 1
fi

source .env
POSTGRES_USER=${POSTGRES_USER:-football}
POSTGRES_DB=${POSTGRES_DB:-football_academy}

docker exec "$DB_CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$FILE"
echo "Đã backup database: $FILE"
