# V1.6 - Sửa chấm công HLV

## Lỗi đã xử lý

Bản trước chỉ cho HLV tự chấm công khi HLV đã được Admin gán trực tiếp vào lớp. Nếu Admin chưa gán lớp hoặc HLV dạy thay, HLV sẽ không gửi chấm công được.

## Nâng cấp trong bản này

1. HLV có thể tự gửi chấm công cho tất cả lớp đang hoạt động.
2. Lớp được gán cho HLV sẽ được ưu tiên hiển thị và ghi rõ "Lớp của tôi".
3. Lớp chưa được gán sẽ hiển thị "Dạy thay/chờ Admin kiểm tra".
4. Tất cả bản HLV tự gửi đều ở trạng thái `PENDING`.
5. Chỉ khi Admin duyệt trong mục **Duyệt chấm công & lương** thì mới cộng vào lương.
6. Nếu HLV chấm công lớp chưa được phân công, hệ thống tự thêm ghi chú để Admin dễ kiểm tra.

## Cách test

1. Đăng nhập HLV.
2. Vào **Tự chấm công**.
3. Chọn lớp, ngày dạy, trạng thái, số buổi.
4. Bấm gửi.
5. Đăng nhập Admin.
6. Vào **Duyệt chấm công & lương**.
7. Duyệt bản ghi chờ duyệt.
8. Kiểm tra tổng lương tháng.

## Lưu ý

Nếu không có lớp nào hiển thị, Admin cần tạo ít nhất 1 lớp ở mục **Lớp học**.
