# Fix Report - GitHub Ready

## Đã sửa / bổ sung

1. Thêm `package.json` ở thư mục gốc để tránh lỗi `npm ERR! enoent Could not read package.json` khi chạy lệnh từ root.
2. Thêm `.gitignore` để không đưa `node_modules`, `.env`, file build, log và dữ liệu local lên GitHub.
3. Thêm `.dockerignore` để Docker build nhẹ hơn và tránh copy file thừa.
4. Cập nhật `backend/package.json`:
   - `build` tự chạy `prisma generate` trước khi `tsc`.
   - Thêm `db:push`, `db:seed`, `start:migrate` cho Docker production.
5. Cập nhật Dockerfile:
   - Dùng `npm ci` để build ổn định theo `package-lock.json`.
   - Bỏ `--accept-data-loss` khỏi `prisma db push` để tránh rủi ro mất dữ liệu ngoài ý muốn.
6. Cập nhật `docker-compose.yml` để đọc thông tin PostgreSQL từ `.env` có fallback mặc định.
7. Cập nhật luồng demo account:
   - Seed không tự reset mật khẩu demo mỗi lần restart.
   - Endpoint debug/reset demo có thể tắt ở production bằng `ENABLE_DEMO_TOOLS=false`.
8. Cập nhật màn hình Login:
   - Health check vẫn báo backend hoạt động kể cả khi debug endpoint bị tắt.
9. Thêm GitHub Actions CI tại `.github/workflows/ci.yml`.
10. Thêm `GITHUB_READY_CHECKLIST.md` hướng dẫn kiểm tra và push GitHub.

## Đã kiểm tra trong môi trường hiện tại

- Frontend TypeScript + Vite build: PASS.
- Root script `npm run dev -- --host 0.0.0.0`: PASS, không còn lỗi thiếu `package.json` ở root.

## Chưa thể xác minh 100% trong sandbox

- Backend build cần Prisma tải engine từ `binaries.prisma.sh`. Môi trường sandbox hiện không truy cập được host này nên `prisma generate` dừng ở bước tải engine.
- Khi chạy trên máy có internet, Docker/GitHub Actions sẽ thực hiện `npm ci` + `prisma generate` bình thường.

## Lệnh nên chạy trên máy anh trước khi push

```bash
copy .env.example .env
npm run setup
npm run build:backend
npm run build:frontend
```

Hoặc kiểm tra đầy đủ bằng Docker:

```bash
docker compose up --build
```

Sau đó mở:

```txt
http://localhost:5173
http://localhost:5173/api/health
```
