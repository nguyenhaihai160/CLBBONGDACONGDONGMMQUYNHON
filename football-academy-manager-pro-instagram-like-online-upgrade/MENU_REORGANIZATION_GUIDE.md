# V1.5 - Sắp xếp lại menu logic hơn

## Mục tiêu

Bản này sắp xếp lại menu theo đúng luồng vận hành thực tế của một CLB bóng đá:

1. Tổng quan
2. Vận hành lớp học
3. Tài chính
4. Huấn luyện viên
5. Hệ thống

## Menu Admin mới

### 1. Tổng quan
- Bảng điều khiển
- Báo cáo doanh thu

### 2. Vận hành lớp học
- Học viên
- Lớp học
- Lịch tập
- Điểm danh học viên
- Thẻ học viên

### 3. Tài chính
- Thu học phí
- Kho đồng phục

### 4. Huấn luyện viên
- Duyệt chấm công & lương
- Lớp của HLV
- Tài khoản & HLV

### 5. Hệ thống
- Zalo OA
- Cấu hình CLB

## Menu Huấn luyện viên mới

### 1. Công việc hôm nay
- Bảng điều khiển
- Lớp của tôi
- Tự chấm công
- Lịch tập

### 2. Theo dõi học viên
- Điểm danh học viên
- Danh sách học viên

## Mobile menu

### Admin
- Tổng quan
- Học viên
- Học phí
- Lương
- Nút Thêm

### HLV
- Home
- Lớp
- Chấm công
- Lịch
- Nút Thêm

## File đã chỉnh

- `frontend/src/components/Layout.tsx`

## Ghi chú

Bản này chỉ sắp xếp lại giao diện menu và tác vụ nhanh. Không thay đổi database schema, không thay đổi API, không ảnh hưởng dữ liệu hiện tại.
