import { useListFees } from '@workspace/api-client-react';
import { DollarSign, AlertTriangle, Receipt, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeesPage({ user }: { user: any }) {
  const { data: fees = [], isLoading } = useListFees();

  if (isLoading) {
    return <div className="flex justify-center h-64 items-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const totalFees = fees.reduce((s: number, f: any) => s + f.amount, 0);
  const totalPaid = fees.reduce((s: number, f: any) => s + f.paidAmount, 0);
  const totalPending = totalFees - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Fees & Payments</h1>
          <p className="text-sm text-slate-400">Track and manage financial obligations.</p>
        </div>
        {['owner', 'admin'].includes(user.role) && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> New Invoice
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Receipt className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-slate-400">Total Billed</p>
          </div>
          <p className="text-3xl font-bold text-white font-mono tracking-tight">${(totalFees / 1000).toFixed(1)}k</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-slate-400">Collected</p>
          </div>
          <p className="text-3xl font-bold text-white font-mono tracking-tight">${(totalPaid / 1000).toFixed(1)}k</p>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalFees > 0 ? (totalPaid/totalFees)*100 : 0}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-slate-400">Outstanding</p>
          </div>
          <p className="text-3xl font-bold text-white font-mono tracking-tight">${(totalPending / 1000).toFixed(1)}k</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-slate-800/60">
            <tr>
              <th className="px-6 py-4 font-semibold">Student</th>
              <th className="px-6 py-4 font-semibold">Fee Type</th>
              <th className="px-6 py-4 font-semibold">Due Date</th>
              <th className="px-6 py-4 font-semibold text-right">Amount</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {fees.map((f: any) => {
              const isOverdue = new Date(f.dueDate) < new Date() && f.status !== 'paid';
              return (
                <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{f.studentName}</td>
                  <td className="px-6 py-4 text-slate-400 capitalize">{f.feeType} Semester Fee</td>
                  <td className="px-6 py-4">
                    <span className={isOverdue ? 'text-red-400 font-medium flex items-center gap-1.5' : 'text-slate-400'}>
                      {isOverdue && <AlertTriangle className="w-3 h-3" />}
                      {new Date(f.dueDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white">
                    ${f.amount.toLocaleString()}
                    {f.paidAmount > 0 && f.status !== 'paid' && (
                      <div className="text-[10px] text-slate-500 -mt-1">${f.paidAmount.toLocaleString()} paid</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider
                      ${f.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        f.status === 'partial' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {f.status !== 'paid' && user.role === 'student' ? (
                      <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700">Pay Now</Button>
                    ) : (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-white">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {fees.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No invoices found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
