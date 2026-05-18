import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../api/client';

const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
const today = new Date().toISOString().slice(0, 10);
const thisMonth = new Date().toISOString().slice(0, 7);

const statusLabels: Record<string, string> = {
  PRESENT: 'Có dạy',
  ABSENT: 'Vắng',
  EXCUSED: 'Xin phép',
};

export function CoachPayroll() {
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [totals, setTotals] = useState({ presentSessions: 0, totalSalary: 0, recordCount: 0 });
  const [month, setMonth] = useState(thisMonth);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    coachId: '',
    classId: '',
    date: today,
    status: 'PRESENT',
    sessions: 1,
    salaryPerSession: 100000,
    note: '',
  });

  const coaches = useMemo(() => users.filter(u => u.role === 'COACH'), [users]);

  async function loadBase() {
    const [userRes, classRes] = await Promise.all([api.get('/users'), api.get('/classes')]);
    const coachList = userRes.data.filter((u: any) => u.role === 'COACH');
    setUsers(userRes.data);
    setClasses(classRes.data);
    if (!form.coachId && coachList[0]) {
      setForm((prev) => ({ ...prev, coachId: coachList[0].id, salaryPerSession: Number(coachList[0].coachSalaryPerSession || 100000) }));
    }
  }

  async function loadPayroll(nextMonth = month) {
    const res = await api.get('/coach-attendance', { params: { month: nextMonth } });
    setRecords(res.data.records || []);
    setSummary(res.data.summary || []);
    setTotals(res.data.totals || { presentSessions: 0, totalSalary: 0, recordCount: 0 });
  }

  useEffect(() => { loadBase(); }, []);
  useEffect(() => { loadPayroll(month); }, [month]);

  function changeCoach(coachId: string) {
    const coach = coaches.find(c => c.id === coachId);
    const ownedClass = classes.find(c => c.coachId === coachId);
    setForm({
      ...form,
      coachId,
      classId: ownedClass?.id || form.classId,
      salaryPerSession: Number(coach?.coachSalaryPerSession || form.salaryPerSession || 100000),
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/coach-attendance', {
        ...form,
        sessions: Number(form.sessions) || 1,
        salaryPerSession: Number(form.salaryPerSession) || 0,
        note: form.note || null,
      });
      setMessage('Đã chấm công HLV và cập nhật lương tháng. Nếu chấm lại cùng HLV/lớp/ngày, hệ thống sẽ tự cập nhật bản cũ.');
      await loadPayroll(month);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Không thể chấm công HLV.');
    }
  }

  async function remove(record: any) {
    const ok = window.confirm(`Xóa chấm công của ${record.coach?.fullName} ngày ${new Date(record.date).toLocaleDateString('vi-VN')}?`);
    if (!ok) return;
    try {
      await api.delete(`/coach-attendance/${record.id}`);
      setMessage('Đã xóa bản chấm công HLV.');
      await loadPayroll(month);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Không thể xóa bản chấm công.');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-black">Chấm công & lương HLV</h1>
          <p className="text-slate-500">Admin chấm công theo buổi, nhập lương/buổi và hệ thống tự tính tổng lương theo tháng.</p>
        </div>
        <input className="input w-full lg:w-52" type="month" value={month} onChange={e => setMonth(e.target.value)} />
      </div>

      {message && <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{message}</div>}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-500">Tổng buổi có dạy</p><b className="text-2xl">{totals.presentSessions}</b></div>
        <div className="card"><p className="text-sm text-slate-500">Tổng lương tháng</p><b className="text-2xl text-green-700">{money(totals.totalSalary)}</b></div>
        <div className="card"><p className="text-sm text-slate-500">Số bản chấm công</p><b className="text-2xl">{totals.recordCount}</b></div>
      </div>

      <form onSubmit={submit} className="card space-y-4">
        <h2 className="text-lg font-black">Chấm công nhanh</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          <label className="space-y-1 xl:col-span-2">
            <span className="text-sm font-bold text-slate-700">Huấn luyện viên</span>
            <select className="input" value={form.coachId} onChange={e => changeCoach(e.target.value)} required>
              <option value="">Chọn HLV</option>
              {coaches.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </label>
          <label className="space-y-1 xl:col-span-2">
            <span className="text-sm font-bold text-slate-700">Lớp dạy</span>
            <select className="input" value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} required>
              <option value="">Chọn lớp</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.coach?.fullName ? `· ${c.coach.fullName}` : ''}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-bold text-slate-700">Ngày</span>
            <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-bold text-slate-700">Trạng thái</span>
            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="PRESENT">Có dạy</option>
              <option value="ABSENT">Vắng</option>
              <option value="EXCUSED">Xin phép</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-bold text-slate-700">Số buổi</span>
            <input className="input" type="number" min={1} value={form.sessions} onChange={e => setForm({ ...form, sessions: Number(e.target.value) })} />
          </label>
          <label className="space-y-1 xl:col-span-2">
            <span className="text-sm font-bold text-slate-700">Lương / buổi</span>
            <input className="input" type="number" min={0} value={form.salaryPerSession} onChange={e => setForm({ ...form, salaryPerSession: Number(e.target.value) })} />
          </label>
          <label className="space-y-1 xl:col-span-4">
            <span className="text-sm font-bold text-slate-700">Ghi chú</span>
            <input className="input" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Ví dụ: dạy thay, lớp bù, buổi kỹ thuật..." />
          </label>
        </div>
        <button className="btn-primary">Lưu chấm công HLV</button>
      </form>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card space-y-3">
          <h2 className="text-lg font-black">Tổng lương theo HLV</h2>
          {summary.map(item => (
            <div key={item.coachId} className="rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <b>{item.coachName}</b>
                <b className="text-green-700">{money(item.totalSalary)}</b>
              </div>
              <p className="text-sm text-slate-500">Có dạy: {item.presentSessions} buổi · Vắng: {item.absentCount} · Xin phép: {item.excusedCount}</p>
            </div>
          ))}
          {summary.length === 0 && <p className="text-sm text-slate-500">Chưa có dữ liệu chấm công trong tháng này.</p>}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-black">Lịch sử chấm công</h2>
          {records.map(record => (
            <div key={record.id} className="card flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-black text-green-700">{new Date(record.date).toLocaleDateString('vi-VN')}</p>
                <h3 className="font-bold">{record.coach?.fullName}</h3>
                <p className="text-sm text-slate-500">{record.class?.name} · {statusLabels[record.status] || record.status} · {record.sessions} buổi x {money(record.salaryPerSession)}</p>
                {record.note && <p className="text-xs text-slate-400">{record.note}</p>}
              </div>
              <div className="flex items-center gap-2">
                <b className="text-green-700">{money(record.totalAmount)}</b>
                <button className="rounded-xl bg-red-50 p-2 text-red-700 hover:bg-red-100" onClick={() => remove(record)}><Trash2 size={17} /></button>
              </div>
            </div>
          ))}
          {records.length === 0 && <div className="card text-center text-slate-500">Chưa có lịch sử chấm công HLV.</div>}
        </div>
      </div>
    </div>
  );
}
