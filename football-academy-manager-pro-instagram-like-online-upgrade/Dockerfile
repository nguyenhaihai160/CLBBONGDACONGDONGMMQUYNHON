# Production-like single-port image.
# Backend serves both React build and /api, so iPhone only needs http://IP_MAY_TINH:5173.
FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl libssl3 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY backend ./backend
COPY frontend ./frontend

RUN cd backend && npm run build
RUN cd frontend && npm run build

ENV NODE_ENV=production
ENV PORT=5173
ENV FRONTEND_DIST_PATH=/app/frontend/dist

EXPOSE 5173

CMD ["sh", "-c", "cd /app/backend && npm run start:migrate"]
