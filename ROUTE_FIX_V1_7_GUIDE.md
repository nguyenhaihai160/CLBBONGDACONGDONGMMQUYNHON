# V1.7 Route Fix - Coach Attendance & Revenue Detail

Bản này sửa lỗi Render trả 404 cho các API:

- `GET /api/coach-attendance?month=YYYY-MM`
- `POST /api/coach-attendance`
- `GET /api/reports/revenue-detail?month=YYYY-MM`

## Cách kiểm tra sau khi deploy

Mở link sau trên trình duyệt, thay domain bằng domain Render của bạn:

```text
https://clbmmquynhon.onrender.com/api/_route-check
```

Nếu thấy JSON có `version: v1.7-route-fix` nghĩa là backend đã nhận đúng bản mới.

## Nếu vẫn lỗi

1. GitHub phải có file `backend/src/app.ts` mới nhất.
2. Render phải deploy bằng `Clear build cache & deploy`.
3. Sau deploy, mở `/api/_route-check` để xác nhận đúng version.
