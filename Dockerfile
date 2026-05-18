FROM node:20-bookworm-slim

WORKDIR /app

ARG DATABASE_URL="postgresql://render:render@localhost:5432/render"
ENV DATABASE_URL=${DATABASE_URL}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV PORT=10000
ENV FRONTEND_DIST_PATH=/app/frontend/dist

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl libssl3 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY backend/package*.json ./backend/
RUN cd backend && pnpm install --frozen-lockfile=false --prod=false

COPY frontend/package*.json ./frontend/
RUN cd frontend && pnpm install --frozen-lockfile=false --prod=false

COPY backend ./backend
COPY frontend ./frontend

RUN cd backend && pnpm exec prisma generate && pnpm run build
RUN cd frontend && pnpm run build

EXPOSE 10000

CMD ["sh", "-c", "cd /app/backend && pnpm exec prisma db push --accept-data-loss && (pnpm run prisma:seed || echo 'Seed warning - continuing') && node dist/server.js"]
