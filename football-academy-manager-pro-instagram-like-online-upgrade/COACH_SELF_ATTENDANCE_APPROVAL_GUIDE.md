# Nâng cấp V1.4 — HLV tự chấm công và Admin xác nhận

## Luồng mới

1. HLV đăng nhập bằng tài khoản COACH.
2. HLV vào menu **Tự chấm công**.
3. HLV chọn lớp được Admin phân công, ngày dạy, trạng thái, số buổi và gửi.
4. Bản ghi sẽ ở trạng thái **Chờ Admin duyệt**.
5. Admin vào **Lương HLV** để duyệt hoặc từ chối.
6. Chỉ bản ghi **Đã duyệt** mới được cộng vào tổng lương tháng.

## Quy tắc tính lương

- Có dạy: tính `số buổi × lương/buổi`.
- Vắng / Xin phép: số buổi = 0, lương = 0.
- HLV tự gửi: trạng thái mặc định là `PENDING`.
- Admin chấm trực tiếp: trạng thái mặc định là `APPROVED`.
- Admin từ chối: tổng tiền về 0 và lưu lý do từ chối.

## Thay đổi database

Bảng `CoachAttendance` có thêm:

- `approvalStatus`: PENDING / APPROVED / REJECTED
- `reviewedById`
- `reviewedAt`
- `rejectedReason`

Render sẽ tự cập nhật qua lệnh Prisma `db push` trong Dockerfile.

## Cách cập nhật

1. Giải nén bản v1.4.
2. Copy toàn bộ file trong bản mới.
3. Dán đè vào project cũ đang kết nối GitHub.
4. GitHub Desktop → Commit to main.
5. Push origin.
6. Render → Manual Deploy → Clear build cache & deploy.

## Kiểm tra sau khi deploy

- Đăng nhập HLV → thấy menu **Tự chấm công**.
- HLV gửi chấm công → trạng thái **Chờ Admin duyệt**.
- Đăng nhập Admin → vào **Lương HLV** → thấy danh sách chờ duyệt.
- Admin bấm **Duyệt & tính lương** → tổng lương tháng tăng lên.
- Admin bấm **Từ chối** → bản ghi không cộng lương và hiện lý do từ chối cho HLV.
