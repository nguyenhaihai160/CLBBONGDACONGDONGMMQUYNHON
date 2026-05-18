# Bản đã tối ưu chạy local / iPhone

## Cách chạy khuyên dùng

Mở PowerShell tại thư mục gốc project rồi chạy:

```bash
docker compose up -d --build
```

Sau khi chạy xong, mở:

```text
http://localhost:5173
http://localhost:5173/api/health
```

Trên iPhone/Android cùng WiFi, mở:

```text
http://IP_MAY_TINH:5173
```

Ví dụ:

```text
http://192.168.1.2:5173
```

## Tài khoản demo

```text
Admin: admin@demo.com / Admin@123
HLV: coach@demo.com / Coach@123
```

## Nếu báo thiếu package.json

Bản này đã thêm `package.json` ở thư mục gốc. Anh có thể chạy:

```bash
npm run dev
npm run docker:up
npm run docker:logs
```

## Nếu điện thoại mở được nhưng trắng màn hình

1. Mở trang đăng nhập.
2. Bấm **Xóa cache app** nếu thấy lỗi.
3. Trên iPhone, vào Safari > xoá dữ liệu website của địa chỉ IP đó nếu vẫn trắng.
4. Kiểm tra máy tính và điện thoại có cùng WiFi không.
5. Kiểm tra Windows Firewall có cho phép Docker/Desktop hoặc Node.js truy cập mạng Private không.

## Nếu Docker lỗi port 5173 đã dùng

Dừng container cũ:

```bash
docker compose down
```

Hoặc reset toàn bộ dữ liệu local:

```bash
npm run docker:reset
```

## Những phần đã tối ưu trong bản này

- Thêm `package.json` root để chạy lệnh không bị ENOENT.
- Thêm `.env` local để Docker Compose không lỗi thiếu file môi trường.
- Đổi Docker build sang `npm ci` để ổn định hơn `npm install`.
- Thêm `.dockerignore` để build Docker nhẹ hơn, tránh copy `node_modules`, `dist`, log, zip.
- Thêm file `.bat` cho Windows để chạy nhanh.
- Thêm màn hình báo lỗi React thay vì trắng màn hình khi frontend crash.
