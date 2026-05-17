import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

export function Payments() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    studentId: '',
    amount: 900000,
    paidAmount: 0,
    feeType: 'MONTHLY',
    packageSessions: 12,
    month: new Date().toISOString().slice(0, 7),
  });

  async function load() {
    const [studentRes, paymentRes] = await Promise.all([api.get('/students'), api.get('/payments')]);
    setStudents(studentRes.data);
    setPayments(paymentRes.data);
  }

  useEffect(() => { load(); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    const payload: any = {
      ...form,
      amount: Number(form.amount),
      paidAmount: Number(form.paidAmount),
      feeType: form.feeType,
      month: form.feeType === 'MONTHLY' ? form.month : undefined,
      packageSessions: form.feeType === 'PACKAGE' ? Number(form.packageSessions) : undefined,
    };

    try {
      await api.post('/payments', payload);
      setForm({ ...form, studentId: '', paidAmount: 0 });
      setMessage('Đã tạo khoản học phí. Nếu đã đóng đủ, Admin có thể xác nhận để cộng buổi học cho gói buổi.');
      load();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Không tạo được khoản học phí.');
    }
  }

  async function confirm(id: string) {
    await api.patch(`/payments/${id}/confirm`, {});
    setMessage('Đã xác nhận thanh toán. Nếu là gói buổi, hệ thống đã tự cộng số buổi cho học viên.');
    load();
  }

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black">Quản lý học phí</h1><p className="text-slate-500">Tạo khoản thu theo tháng hoặc gói buổi, QR chuyển khoản, xác nhận thanh toán và theo dõi công nợ.</p></div>
      {message && <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{message}</div>}
      <form onSubmit={submit} className="card grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <select className="input xl:col-span-2" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required>
          <option value="">Chọn học viên</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.studentCode} - {s.fullName}</option>)}
        </select>
        <select className="input" value={form.feeType} onChange={e => setForm({ ...form, feeType: e.target.value })}>
          <option value="MONTHLY">Theo tháng</option>
          <option value="PACKAGE">Gói buổi</option>
        </select>
        <input className="input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} placeholder="Số tiền" />
        <input className="input" type="number" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: Number(e.target.value) })} placeholder="Đã đóng" />
        {form.feeType === 'PACKAGE' ? (
          <input className="input" type="number" min={1} value={form.packageSessions} onChange={e => setForm({ ...form, packageSessions: Number(e.target.value) })} placeholder="Số buổi" />
        ) : (
          <input className="input" type="month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} />
        )}
        <button className="btn-primary xl:col-span-6">Tạo học phí</button>
      </form>
      <div className="grid gap-3">
        {payments.map(p => (
          <div key={p.id} className="card grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.4fr_auto] lg:items-center">
            <div><h3 className="font-bold">{p.student?.fullName}</h3><p className="text-sm text-slate-500">{p.student?.studentCode} · {p.student?.class?.name || 'Chưa phân lớp'}</p></div>
            <div><p className="text-xs text-slate-400">Loại phí</p><b>{p.feeType === 'PACKAGE' ? `Gói ${p.packageSessions || 0} buổi` : `Tháng ${p.month || ''}`}</b></div>
            <div><p className="text-xs text-slate-400">Số tiền</p><b>{money(p.amount)}</b></div>
            <div><p className="text-xs text-slate-400">Còn nợ</p><b>{money(p.debtAmount)}</b></div>
            <div><p className="text-xs text-slate-400">Trạng thái</p><PaymentStatus value={p.status} sessionsApplied={p.sessionsApplied} /></div>
            {user?.role === 'ADMIN' && p.status !== 'PAID' && <button className="btn-primary" onClick={() => confirm(p.id)}>Xác nhận</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentStatus({ value, sessionsApplied }: { value: string; sessionsApplied?: boolean }) {
  const map: Record<string, string> = { PAID: 'Đã đóng', PENDING: 'Chưa đóng', PARTIAL: 'Còn nợ', OVERDUE: 'Quá hạn' };
  return (
    <div className="space-y-1">
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${value === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{map[value] || value}</span>
      {sessionsApplied && <p className="text-xs font-semibold text-green-700">Đã cộng buổi</p>}
    </div>
  );
}
