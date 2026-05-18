FROM node:20-bookworm-slim

WORKDIR /app

ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_PROGRESS=false
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl libssl3 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g npm@10

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --include=dev --no-audit --no-fund --legacy-peer-deps

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci --include=dev --no-audit --no-fund --legacy-peer-deps

COPY backend ./backend
COPY frontend ./frontend

RUN cd backend && ./node_modules/.bin/prisma generate && npm run build
RUN cd frontend && npm run build

ENV NODE_ENV=production
ENV PORT=10000
ENV FRONTEND_DIST_PATH=/app/frontend/dist

EXPOSE 10000

CMD ["sh", "-c", "cd /app/backend && ./node_modules/.bin/prisma db push --accept-data-loss && (npm run prisma:seed || echo 'Seed warning - continuing') && node dist/server.js"]
