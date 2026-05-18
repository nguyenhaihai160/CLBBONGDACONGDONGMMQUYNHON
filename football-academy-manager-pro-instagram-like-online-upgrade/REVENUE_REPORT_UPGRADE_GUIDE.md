# Nâng cấp V1.2 - Báo cáo doanh thu theo tháng

## Tính năng mới

### 1. Báo cáo tổng quan nhiều tháng
- Xem 6 / 12 / 24 / 36 tháng gần nhất.
- Tách doanh thu học phí và doanh thu đồng phục.
- Hiển thị tổng doanh thu, học phí, đồng phục, công nợ hiện tại.
- Biểu đồ cột theo tháng.
- Bấm vào từng tháng để xem chi tiết tháng đó.
- Xuất Excel tổng quan.

### 2. Xem chi tiết doanh thu từng tháng
- Chọn tháng bằng ô `type=month`.
- Xem tổng doanh thu tháng.
- Xem doanh thu học phí tháng.
- Xem doanh thu đồng phục tháng.
- Xem số giao dịch trong tháng.
- Xem doanh thu học phí theo từng lớp.
- Xem danh sách từng khoản thu: ngày, loại thu, học viên, lớp, nội dung, số tiền.
- Xuất Excel riêng cho tháng đang chọn.

## API mới

### GET /api/reports/revenue-detail?month=YYYY-MM

Ví dụ:

```text
/api/reports/revenue-detail?month=2026-05
```

Trả về:

```json
{
  "month": "2026-05",
  "label": "Tháng 5/2026",
  "summary": {
    "tuitionRevenue": 0,
    "uniformRevenue": 0,
    "totalRevenue": 0,
    "paidPayments": 0,
    "paidUniformOrders": 0,
    "totalTransactions": 0
  },
  "classBreakdown": [],
  "transactions": []
}
```

## Cách cập nhật lên Render

1. Upload code mới lên GitHub.
2. Commit với nội dung: `add monthly revenue report`.
3. Vào Render.
4. Chọn Web Service app.
5. Manual Deploy.
6. Chọn `Clear build cache & deploy`.

## Lưu ý

- Doanh thu được tính theo ngày xác nhận thanh toán:
  - Học phí: `Payment.confirmedAt`
  - Đồng phục: `UniformOrder.paidAt`
- Chỉ tính các khoản có trạng thái đã thanh toán:
  - Học phí: `PAID`
  - Đồng phục: `PAID`
- Module này không thay đổi schema database, nên không cần migration mới.
