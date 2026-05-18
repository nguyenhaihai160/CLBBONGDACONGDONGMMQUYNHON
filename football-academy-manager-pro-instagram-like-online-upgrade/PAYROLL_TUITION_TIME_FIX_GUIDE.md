# V1.3 — Sửa chấm công/lương HLV và tùy chỉnh thời gian thu học phí

## Nội dung đã sửa

### 1. Chấm công & lương HLV
- Sửa lỗi schema Prisma dư dấu `}` làm phần chấm công/lương HLV dễ lỗi khi deploy.
- Chấm công HLV ổn định hơn với 3 trạng thái:
  - Có dạy
  - Vắng
  - Xin phép
- Nếu trạng thái là Vắng/Xin phép, hệ thống tự đưa số buổi về `0` và tổng lương về `0`.
- Nếu chấm lại cùng HLV + lớp + ngày, hệ thống cập nhật bản cũ, không tạo trùng.
- Hỗ trợ dạy thay: Admin có thể chọn HLV khác lớp, hệ thống tự thêm ghi chú dạy thay nếu cần.
- Giao diện hiển thị tạm tính lương trước khi lưu.

### 2. Tùy chỉnh thời gian thu học phí của học viên
Trong trang Học viên, Admin có thể tùy chỉnh:
- Học phí riêng/tháng.
- Ngày thu học phí hằng tháng, ví dụ ngày 5, ngày 10, ngày 15.
- Chu kỳ thu học phí: 1 tháng, 2 tháng, 3 tháng, 6 tháng, 12 tháng.
- Ngày bắt đầu thu.
- Ngày thu tiếp theo.

### 3. Quản lý học phí
Trong trang Học phí:
- Khi chọn học viên, hệ thống tự gợi ý ngày hẹn thu theo cấu hình của học viên.
- Có thể sửa ngày hẹn thu riêng cho từng khoản thu.
- Có thêm khoảng thời gian tính phí: từ ngày / đến ngày.
- Khi xác nhận học phí tháng đã đóng đủ, hệ thống tự cập nhật ngày thu tiếp theo theo chu kỳ của học viên.

## Cách cập nhật lên Render

1. Giải nén ZIP mới.
2. Copy toàn bộ file trong bản mới đè vào thư mục project cũ.
3. GitHub Desktop → Commit to main.
4. Push origin.
5. Render → Manual Deploy → Clear build cache & deploy.

Bản này có thay đổi database schema. Dockerfile đã có lệnh:

```bash
pnpm exec prisma db push --accept-data-loss
```

nên Render sẽ tự cập nhật database khi deploy.
