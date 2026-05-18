import { useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, Download, ReceiptText, RefreshCcw, WalletCards } from 'lucide-react';
import { api } from '../api/client';
import { StatCard } from '../components/StatCard';

type RevenueRow = {
  month: string;
  label: string;
  tuitionRevenue: number;
  uniformRevenue: number;
  totalRevenue: number;
  paidPayments: number;
  paidUniformOrders: number;
};

type RevenueReport = {
  months: number;
  rows: RevenueRow[];
  summary: {
    totalRevenue: number;
    totalTuitionRevenue: number;
    totalUniformRevenue: number;
    totalDebt: number;
    debtStudents: number;
    bestMonth?: RevenueRow;
  };
};

type RevenueTransaction = {
  id: string;
  type: 'TUITION' | 'UNIFORM';
  date: string;
  studentCode: string;
  studentName: string;
  className: string;
  description: string;
  amount: number;
  confirmedBy?: string;
};

type RevenueDetail = {
  month: string;
  label: string;
  summary: {
    tuitionRevenue: number;
    uniformRevenue: number;
    totalRevenue: number;
    paidPayments: number;
    paidUniformOrders: number;
    totalTransactions: number;
  };
  classBreakdown: Array<{ className: string; tuitionRevenue: number; paidPayments: number }>;
  transactions: RevenueTransaction[];
};

const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
const todayMonth = () => new Date().toISOString().slice(0, 7);
const dateText = (value: string) => value ? new Date(value).toLocaleDateString('vi-VN') : '';

export function Reports() {
  const [months, setMonths] = useState(12);
  const [selectedMonth, setSelectedMonth] = useState(todayMonth());
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [detail, setDetail] = useState<RevenueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get(`/reports/revenue-monthly?months=${months}`);
      setReport(res.data);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Không tải được báo cáo doanh thu.');
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail() {
    setDetailLoading(true);
    setMessage('');
    try {
      const res = await api.get(`/reports/revenue-detail?month=${selectedMonth}`);
      setDetail(res.data);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Không tải được chi tiết doanh thu tháng.');
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => { load(); }, [months]);
  useEffect(() => { loadDetail(); }, [selectedMonth]);

  const maxRevenue = useMemo(() => Math.max(1, ...(report?.rows || []).map(row => row.totalRevenue)), [report]);
  const maxClassRevenue = useMemo(() => Math.max(1, ...(detail?.classBreakdown || []).map(row => row.tuitionRevenue)), [detail]);

  function exportOverviewExcel() {
    if (!report) return;
    const rows = report.rows.map(row => `
      <tr>
        <td>${row.label}</td>
        <td>${row.tuitionRevenue}</td>
        <td>${row.uniformRevenue}</td>
        <td>${row.totalRevenue}</td>
        <td>${row.paidPayments}</td>
        <td>${row.paidUniformOrders}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <h2>Báo cáo doanh thu theo tháng</h2>
          <table border="1">
            <tr><th colspan="2">Tổng doanh thu</th><td colspan="4">${report.summary.totalRevenue}</td></tr>
            <tr><th colspan="2">Doanh thu học phí</th><td colspan="4">${report.summary.totalTuitionRevenue}</td></tr>
            <tr><th colspan="2">Doanh thu đồng phục</th><td colspan="4">${report.summary.totalUniformRevenue}</td></tr>
            <tr><th colspan="2">Công nợ hiện tại</th><td colspan="4">${report.summary.totalDebt}</td></tr>
            <tr><th colspan="2">Học viên còn nợ</th><td colspan="4">${report.summary.debtStudents}</td></tr>
          </table>
          <br />
          <table border="1">
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Doanh thu học phí</th>
                <th>Doanh thu đồng phục</th>
                <th>Tổng doanh thu</th>
                <th>Số khoản học phí đã thu</th>
                <th>Số đơn đồng phục đã thu</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    downloadExcel(html, `bao-cao-doanh-thu-${new Date().toISOString().slice(0, 10)}.xls`);
  }

  function exportMonthExcel() {
    if (!detail) return;
    const classRows = detail.classBreakdown.map(row => `
      <tr><td>${row.className}</td><td>${row.tuitionRevenue}</td><td>${row.paidPayments}</td></tr>
    `).join('');
    const transactionRows = detail.transactions.map(row => `
      <tr>
        <td>${dateText(row.date)}</td>
        <td>${row.type === 'TUITION' ? 'Học phí' : 'Đồng phục'}</td>
        <td>${row.studentCode}</td>
        <td>${row.studentName}</td>
        <td>${row.className}</td>
        <td>${row.description}</td>
        <td>${row.amount}</td>
        <td>${row.confirmedBy || ''}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <h2>Chi tiết doanh thu ${detail.label}</h2>
          <table border="1">
            <tr><th>Tổng doanh thu</th><td>${detail.summary.totalRevenue}</td></tr>
            <tr><th>Học phí</th><td>${detail.summary.tuitionRevenue}</td></tr>
            <tr><th>Đồng phục</th><td>${detail.summary.uniformRevenue}</td></tr>
            <tr><th>Số giao dịch</th><td>${detail.summary.totalTransactions}</td></tr>
          </table>
          <br />
          <h3>Doanh thu học phí theo lớp</h3>
          <table border="1"><thead><tr><th>Lớp</th><th>Doanh thu học phí</th><th>Số khoản thu</th></tr></thead><tbody>${classRows}</tbody></table>
          <br />
          <h3>Danh sách khoản thu</h3>
          <table border="1">
            <thead><tr><th>Ngày</th><th>Loại</th><th>Mã HV</th><th>Học viên</th><th>Lớp</th><th>Nội dung</th><th>Số tiền</th><th>Người xác nhận</th></tr></thead>
            <tbody>${transactionRows}</tbody>
          </table>
        </body>
      </html>
    `;
    downloadExcel(html, `chi-tiet-doanh-thu-${detail.month}.xls`);
  }

  function downloadExcel(html: string, filename: string) {
    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (loading && !report) return <div>Đang tải báo cáo...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900"><BarChart3 /> Báo cáo doanh thu</h1>
          <p className="text-slate-500">Xem tổng doanh thu nhiều tháng, chọn từng tháng để xem chi tiết từng khoản thu.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select className="input w-full sm:w-44" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            <option value={6}>6 tháng gần nhất</option>
            <option value={12}>12 tháng gần nhất</option>
            <option value={24}>24 tháng gần nhất</option>
            <option value={36}>36 tháng gần nhất</option>
          </select>
          <button className="btn-soft flex items-center justify-center gap-2" onClick={() => { load(); loadDetail(); }}><RefreshCcw size={17} /> Tải lại</button>
          <button className="btn-primary flex items-center justify-center gap-2" onClick={exportOverviewExcel} disabled={!report}><Download size={17} /> Xuất tổng quan</button>
        </div>
      </div>

      {message && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{message}</div>}

      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Tổng doanh thu" value={money(report.summary.totalRevenue)} icon={WalletCards} hint={`${report.months} tháng`} />
            <StatCard title="Học phí" value={money(report.summary.totalTuitionRevenue)} icon={WalletCards} hint="Khoản học phí đã xác nhận" />
            <StatCard title="Đồng phục" value={money(report.summary.totalUniformRevenue)} icon={WalletCards} hint="Đơn đồng phục đã thanh toán" />
            <StatCard title="Công nợ hiện tại" value={money(report.summary.totalDebt)} icon={WalletCards} hint={`${report.summary.debtStudents} học viên còn nợ`} />
          </div>

          <div className="card">
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-lg font-black">Biểu đồ doanh thu theo tháng</h2>
                <p className="text-sm text-slate-500">Bấm vào từng tháng để xem chi tiết khoản thu bên dưới.</p>
              </div>
              {report.summary.bestMonth && (
                <div className="rounded-2xl bg-green-50 px-4 py-2 text-sm font-bold text-green-800">
                  Cao nhất: {report.summary.bestMonth.label} · {money(report.summary.bestMonth.totalRevenue)}
                </div>
              )}
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-[780px] items-end gap-3 rounded-2xl bg-slate-50 p-4">
                {report.rows.map((row) => {
                  const height = Math.max(8, Math.round((row.totalRevenue / maxRevenue) * 220));
                  const active = selectedMonth === row.month;
                  return (
                    <button key={row.month} type="button" onClick={() => setSelectedMonth(row.month)} className={`flex flex-1 flex-col items-center gap-2 rounded-2xl p-1 transition ${active ? 'bg-green-100 ring-2 ring-green-600' : 'hover:bg-white'}`}>
                      <div className="flex h-60 w-full items-end justify-center rounded-xl bg-white px-2 py-2 shadow-sm">
                        <div
                          className="w-full rounded-t-xl bg-pitch transition-all"
                          style={{ height }}
                          title={`${row.label}: ${money(row.totalRevenue)}`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-slate-800">{money(row.totalRevenue)}</p>
                        <p className="text-[11px] text-slate-500">{row.label.replace('Tháng ', 'T')}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="border-b px-4 py-3">
              <h2 className="font-black">Tổng hợp doanh thu theo tháng</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Tháng</th>
                    <th className="px-4 py-3">Học phí</th>
                    <th className="px-4 py-3">Đồng phục</th>
                    <th className="px-4 py-3">Tổng</th>
                    <th className="px-4 py-3">Khoản học phí</th>
                    <th className="px-4 py-3">Đơn đồng phục</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.rows.map(row => (
                    <tr key={row.month} onClick={() => setSelectedMonth(row.month)} className={`cursor-pointer hover:bg-slate-50 ${selectedMonth === row.month ? 'bg-green-50' : ''}`}>
                      <td className="px-4 py-3 font-bold">{row.label}</td>
                      <td className="px-4 py-3">{money(row.tuitionRevenue)}</td>
                      <td className="px-4 py-3">{money(row.uniformRevenue)}</td>
                      <td className="px-4 py-3 font-black text-green-700">{money(row.totalRevenue)}</td>
                      <td className="px-4 py-3">{row.paidPayments}</td>
                      <td className="px-4 py-3">{row.paidUniformOrders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <section className="space-y-4 rounded-[2rem] border border-green-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-green-700"><CalendarDays size={16} /> Chi tiết từng tháng</p>
            <h2 className="text-xl font-black text-slate-950">Doanh thu {detail?.label || selectedMonth}</h2>
            <p className="text-sm text-slate-500">Chọn tháng để xem từng khoản học phí, đồng phục, doanh thu theo lớp và xuất Excel riêng.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="input" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
            <button className="btn-primary flex items-center justify-center gap-2" onClick={exportMonthExcel} disabled={!detail}><Download size={17} /> Xuất tháng này</button>
          </div>
        </div>

        {detailLoading && <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">Đang tải chi tiết tháng...</div>}

        {detail && !detailLoading && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Doanh thu tháng" value={money(detail.summary.totalRevenue)} icon={WalletCards} hint={detail.label} />
              <StatCard title="Học phí tháng" value={money(detail.summary.tuitionRevenue)} icon={ReceiptText} hint={`${detail.summary.paidPayments} khoản đã thu`} />
              <StatCard title="Đồng phục tháng" value={money(detail.summary.uniformRevenue)} icon={ReceiptText} hint={`${detail.summary.paidUniformOrders} đơn đã thu`} />
              <StatCard title="Tổng giao dịch" value={detail.summary.totalTransactions} icon={ReceiptText} hint="Học phí + đồng phục" />
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-4">
                <h3 className="mb-3 font-black">Học phí theo lớp</h3>
                <div className="space-y-3">
                  {detail.classBreakdown.length === 0 && <p className="text-sm text-slate-500">Tháng này chưa có khoản học phí đã xác nhận.</p>}
                  {detail.classBreakdown.map((row) => {
                    const width = Math.max(4, Math.round((row.tuitionRevenue / maxClassRevenue) * 100));
                    return (
                      <div key={row.className}>
                        <div className="mb-1 flex justify-between gap-3 text-sm">
                          <b className="truncate">{row.className}</b>
                          <span>{money(row.tuitionRevenue)} · {row.paidPayments} khoản</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-pitch" style={{ width: `${width}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-100 bg-white p-0 shadow-sm">
                <div className="border-b px-4 py-3">
                  <h3 className="font-black">Danh sách khoản thu trong tháng</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Ngày</th>
                        <th className="px-4 py-3">Loại</th>
                        <th className="px-4 py-3">Học viên</th>
                        <th className="px-4 py-3">Lớp</th>
                        <th className="px-4 py-3">Nội dung</th>
                        <th className="px-4 py-3">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {detail.transactions.length === 0 && (
                        <tr><td className="px-4 py-6 text-center text-slate-500" colSpan={6}>Chưa có khoản thu trong tháng này.</td></tr>
                      )}
                      {detail.transactions.map(row => (
                        <tr key={`${row.type}-${row.id}`} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold">{dateText(row.date)}</td>
                          <td className="px-4 py-3"><RevenueType value={row.type} /></td>
                          <td className="px-4 py-3"><b>{row.studentName}</b><p className="text-xs text-slate-500">{row.studentCode}</p></td>
                          <td className="px-4 py-3">{row.className}</td>
                          <td className="px-4 py-3">{row.description}</td>
                          <td className="px-4 py-3 font-black text-green-700">{money(row.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function RevenueType({ value }: { value: RevenueTransaction['type'] }) {
  const label = value === 'TUITION' ? 'Học phí' : 'Đồng phục';
  const cls = value === 'TUITION' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${cls}`}>{label}</span>;
}
