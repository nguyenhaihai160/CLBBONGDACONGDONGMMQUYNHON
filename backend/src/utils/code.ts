export function buildStudentCode(count: number) {
  const year = new Date().getFullYear();
  return `FA${year}${String(count + 1).padStart(4, '0')}`;
}

export function normalizeDateOnly(input: string | Date) {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function buildPaymentQrPayload(input: {
  bankBin: string;
  bankAccount: string;
  bankAccountName: string;
  amount: number;
  content: string;
}) {
  // Đây là payload demo. Khi triển khai thật, thay bằng chuẩn VietQR/đối tác thanh toán.
  return JSON.stringify({
    bankBin: input.bankBin,
    account: input.bankAccount,
    name: input.bankAccountName,
    amount: input.amount,
    content: input.content,
  });
}
