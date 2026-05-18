# V1.1 Payroll & Tuition Upgrade

Bản nâng cấp này thêm 2 nhóm chức năng:

## 1. Học phí riêng theo tháng cho từng học viên

- Vào **Học viên** → bấm sửa học viên.
- Nhập **Học phí riêng / tháng**.
- Nếu để `0`, hệ thống lấy học phí theo lớp.
- Khi qua **Học phí** và chọn học viên, số tiền tháng sẽ tự lấy theo học phí riêng nếu có.
- Admin vẫn có thể sửa số tiền ở từng khoản thu tháng nếu tháng đó có giảm/trừ/ưu đãi.

## 2. Chấm công & lương HLV

- Vào menu **Lương HLV**.
- Chọn HLV, lớp, ngày, trạng thái, số buổi và lương/buổi.
- Ví dụ: 1 buổi x 100.000đ = 100.000đ.
- Nếu chấm lại cùng HLV + lớp + ngày, hệ thống tự cập nhật bản cũ.
- Trang này có tổng lương theo tháng và bảng tổng lương từng HLV.

## 3. Cập nhật lương mặc định của HLV

- Vào **Tài khoản**.
- Với tài khoản HLV, nhập **Lương/buổi**.
- Mức này sẽ tự điền khi chấm công HLV.

## 4. Khi deploy lên Render

Bản này có thay đổi database schema. Docker command hiện đã có:

```bash
pnpm exec prisma db push --accept-data-loss
```

Vì vậy khi deploy lại trên Render, hệ thống sẽ tự đẩy schema mới lên database.

Nếu Render không nhận DATABASE_URL ở build time, kiểm tra trong Web Service → Environment có:

```env
DATABASE_URL=Internal Database URL của PostgreSQL Render
PORT=10000
NODE_ENV=production
JWT_SECRET=...
```

Sau đó chọn:

```text
Manual Deploy → Clear build cache & deploy
```
