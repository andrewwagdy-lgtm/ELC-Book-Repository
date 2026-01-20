
import React, { useMemo } from 'react';
import { CheckoutRecord, Book } from '../types';
import { History, CheckCircle2, AlertCircle, Calendar, ArrowRightLeft } from 'lucide-react';

interface AdminDashboardProps {
  records: CheckoutRecord[];
  books: Book[];
  onReturn: (bookId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ records, books, onReturn }) => {
  const activeRecords = useMemo(() => records.filter(r => r.status === 'Active'), [records]);
  const pastRecords = useMemo(() => records.filter(r => r.status === 'Returned'), [records]);

  const stats = {
    totalActive: activeRecords.length,
    overdue: activeRecords.filter(r => new Date(r.dueDate) < new Date()).length,
    totalReturns: pastRecords.length
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Staff Loan Records</h1>
        <p className="text-slate-500">Track professional development resources borrowed by ELC faculty.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<ArrowRightLeft className="text-blue-500" />} label="Faculty Loans" value={stats.totalActive} sub="Currently out" />
        <StatCard icon={<AlertCircle className="text-amber-500" />} label="Late Returns" value={stats.overdue} sub="Requires reminder" trend={stats.overdue > 0 ? "attention" : "clear"} />
        <StatCard icon={<CheckCircle2 className="text-emerald-500" />} label="Total Returns" value={stats.totalReturns} sub="Returned to ELC" />
      </div>

      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Calendar size={18} /></div>
            <h2 className="text-xl font-bold text-slate-800">Current Assignments</h2>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest">
                    <th className="px-6 py-4 font-bold">Book Title & ISBN</th>
                    <th className="px-6 py-4 font-bold">Teacher / Faculty</th>
                    <th className="px-6 py-4 font-bold text-center">Due Date</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeRecords.map(record => {
                    const book = books.find(b => b.id === record.bookId);
                    const isOverdue = new Date(record.dueDate) < new Date();
                    return (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{book?.title}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{book?.isbn}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-800">{record.teacherName}</p>
                          <p className="text-xs text-slate-500">ID: {record.teacherId}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-medium ${isOverdue ? 'text-red-500' : 'text-slate-600'}`}>
                            {record.dueDate}
                            {isOverdue && <p className="text-[9px] bg-red-50 text-red-600 px-1 rounded uppercase font-black mt-0.5">Late</p>}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => onReturn(record.bookId)} className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors">Return</button>
                        </td>
                      </tr>
                    );
                  })}
                  {activeRecords.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No faculty loans at this time.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600"><History size={18} /></div>
            <h2 className="text-xl font-bold text-slate-800">Activity Log</h2>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {pastRecords.slice().reverse().map(record => {
                    const book = books.find(b => b.id === record.bookId);
                    return (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors opacity-75">
                        <td className="px-6 py-4 text-sm text-slate-700">
                          <span className="font-bold">{book?.title}</span> was returned by <span className="font-semibold">{record.teacherName}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 text-right font-mono">
                          {record.checkoutDate}
                        </td>
                      </tr>
                    );
                  })}
                  {pastRecords.length === 0 && <tr><td className="px-6 py-8 text-center text-slate-400 italic">No historical records found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number, sub: string, trend?: 'attention' | 'clear' }> = ({ icon, label, value, sub, trend }) => (
  <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4 ${trend === 'attention' ? 'ring-2 ring-red-100' : ''}`}>
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shrink-0">{icon}</div>
    <div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <h4 className="text-3xl font-black text-slate-800 my-1">{value}</h4>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  </div>
);

export default AdminDashboard;
