# GitHub Ready Checklist

## 1. Trước khi upload lên GitHub

Không upload các file nhạy cảm:

- `.env`
- `node_modules/`
- `backend/dist/`
- `frontend/dist/`
- file backup database

Project đã có sẵn `.gitignore` và `.dockerignore` để chặn các file này.

## 2. Lệnh kiểm tra nhanh trên máy

Từ thư mục gốc project:

```bash
npm run setup
npm run build:frontend
```

Backend cần Prisma tải engine khi `npm run build:backend`, nên cần có mạng internet:

```bash
copy .env.example .env
npm run build:backend
```

## 3. Chạy bằng Docker local

```bash
copy .env.example .env
docker compose up --build
```

Mở:

```txt
http://localhost:5173
http://localhost:5173/api/health
```

Trên iPhone cùng Wi-Fi:

```txt
http://IP_MAY_TINH:5173
http://IP_MAY_TINH:5173/api/health
```

## 4. Tài khoản demo

```txt
Admin: admin@demo.com / Admin@123
HLV: coach@demo.com / Coach@123
```

Khi deploy thật, nên đổi mật khẩu demo hoặc tạo tài khoản admin mới rồi tắt demo tools:

```env
ENABLE_DEMO_TOOLS=false
```

## 5. Đẩy lên GitHub

```bash
git init
git add .
git commit -m "Initial football academy manager pro"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

## 6. Ghi chú bảo mật

- Đổi `JWT_SECRET` trước khi online.
- Không commit `.env`.
- Production nên dùng domain HTTPS.
- `prisma db push` phù hợp bản demo/MVP. Khi hệ thống có dữ liệu thật, nên chuyển sang Prisma Migrate để quản lý migration an toàn hơn.
