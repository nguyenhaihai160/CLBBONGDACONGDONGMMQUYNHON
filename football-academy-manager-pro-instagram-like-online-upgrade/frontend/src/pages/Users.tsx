import { FormEvent, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ email: '', password: 'Coach@123', fullName: '', phone: '', role: 'COACH', coachSalaryPerSession: 100000 });
  const [message, setMessage] = useState('');

  async function load() { const res = await api.get('/users'); setUsers(res.data); }
  useEffect(() => { load(); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/users', form);
      setForm({ email: '', password: 'Coach@123', fullName: '', phone: '', role: 'COACH', coachSalaryPerSession: 100000 });
      setMessage('Đã tạo tài khoản mới.');
      load();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Không thể tạo tài khoản.');
    }
  }

  async function toggleStatus(u: any) {
    const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/users/${u.id}/status`, { status: nextStatus });
      setMessage(nextStatus === 'ACTIVE' ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.');
      load();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Không thể đổi trạng thái tài khoản.');
    }
  }


  async function updateCoachSalary(u: any, value: number) {
    try {
      await api.patch(`/users/${u.id}/coach-salary`, { coachSalaryPerSession: value });
      setMessage(`Đã cập nhật lương/buổi cho ${u.fullName}.`);
      load();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Không thể cập nhật lương HLV.');
    }
  }

  async function deleteUser(u: any) {
    const label = u.role === 'COACH' ? 'huấn luyện viên' : 'tài khoản';
    const ok = window.confirm(`Xóa ${label} ${u.fullName}? Các lớp đang gán HLV này sẽ chuyển sang trạng thái chưa gán.`);
    if (!ok) return;
    try {
      await api.delete(`/users/${u.id}`);
      setMessage(`Đã xóa ${label} ${u.fullName}.`);
      load();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Không thể xóa tài khoản.');
    }
  }

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black">Phân quyền tài khoản</h1><p className="text-slate-500">Admin tạo tài khoản, khóa/mở khóa và xóa huấn luyện viên khi không còn sử dụng.</p></div>
      {message && <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{message}</div>}
      <form onSubmit={submit} className="card grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <input className="input" placeholder="Họ tên" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
        <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input className="input" placeholder="SĐT" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <input className="input" placeholder="Mật khẩu" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="COACH">HLV</option><option value="ADMIN">Admin</option></select>
        <input className="input" type="number" min={0} placeholder="Lương/buổi" value={form.coachSalaryPerSession} onChange={e => setForm({ ...form, coachSalaryPerSession: Number(e.target.value) })} />
        <button className="btn-primary">Tạo tài khoản</button>
      </form>
      <div className="grid gap-3">
        {users.map(u => (
          <div key={u.id} className="card flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <b>{u.fullName}</b>
              <p className="text-sm text-slate-500">{u.email} · {u.phone || 'Chưa có SĐT'}</p>
              <p className="mt-1 text-xs text-slate-400">Đang phụ trách {u._count?.coachClasses || 0} lớp</p>
              {u.role === 'COACH' && <p className="mt-1 text-xs font-bold text-green-700">Lương mặc định: {Number(u.coachSalaryPerSession || 0).toLocaleString('vi-VN')}đ/buổi</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold">{u.role === 'ADMIN' ? 'Admin' : 'HLV'}</span>
              {u.role === 'COACH' && (
                <input
                  className="input w-36"
                  type="number"
                  min={0}
                  defaultValue={Number(u.coachSalaryPerSession || 100000)}
                  onBlur={(e) => updateCoachSalary(u, Number(e.target.value || 0))}
                  title="Lương HLV / buổi"
                />
              )}
              <button className="btn-soft" disabled={u.id === currentUser?.id} onClick={() => toggleStatus(u)}>{u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}</button>
              {u.id !== currentUser?.id && u.role === 'COACH' && <button className="rounded-xl bg-red-50 px-4 py-2 font-semibold text-red-700 hover:bg-red-100" onClick={() => deleteUser(u)}><Trash2 className="inline" size={16} /> Xóa HLV</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
