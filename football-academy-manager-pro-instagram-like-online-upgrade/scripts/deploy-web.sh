#!/usr/bin/env bash
set -e

echo "==> Football Academy Manager - Deploy Web Online"

if [ ! -f .env ]; then
  echo "Chưa có .env. Đang copy từ .env.production.example..."
  cp .env.production.example .env
  echo "Hãy sửa .env trước khi chạy lại: nano .env"
  exit 1
fi

if [ ! -f Caddyfile ]; then
  echo "Chưa có Caddyfile. Đang copy từ Caddyfile.example..."
  cp Caddyfile.example Caddyfile
  echo "Hãy sửa domain trong Caddyfile trước khi chạy lại: nano Caddyfile"
  exit 1
fi

docker compose -f docker-compose.web.yml up -d --build

echo "==> Đã chạy xong. Kiểm tra: docker compose -f docker-compose.web.yml ps"
echo "==> Health: curl -I https://DOMAIN_CUA_ANH/api/health"
