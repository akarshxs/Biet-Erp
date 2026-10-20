import { useState, useEffect } from 'react';
import { CalendarOff, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LeavePage({ user }: { user: any }) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('erp_leaves');
    if (saved) setLeaves(JSON.parse(saved));
    else {
      setLeaves([
        { id: '1', user: 'Aarav (Student)', type: 'Medical', from: '2023-11-01', to: '2023-11-03', status: 'Pending' },
        { id: '2', user: 'Priya (Teacher)', type: 'Personal', from: '2023-11-10', to: '2023-11-10', status: 'Approved' },
      ]);
    }
  }, []);

  const isApprover = ['owner', 'admin', 'principal', 'hod', 'teacher'].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><CalendarOff className="w-6 h-6" /> Leave Management</h1>
          <p className="text-sm text-slate-400">Apply and track leaves</p>
        </div>
        {!isApprover && (
          <Button onClick={() => setShowAdd(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Apply for Leave
          </Button>
        )}
      </div>

      {!isApprover && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-sm text-slate-400">Total Allowed</p>
            <p className="text-2xl font-bold text-white mt-1">15</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-sm text-slate-400">Used</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">3</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-sm text-slate-400">Remaining</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">12</p>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-slate-800">
            <tr>
              {isApprover && <th className="px-6 py-3">Applicant</th>}
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">From - To</th>
              <th className="px-6 py-3">Status</th>
              {isApprover && <th className="px-6 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {leaves.map(l => (
              <tr key={l.id} className="hover:bg-slate-800/30">
                {isApprover && <td className="px-6 py-4 text-white font-medium">{l.user}</td>}
                <td className="px-6 py-4 text-slate-300">{l.type}</td>
                <td className="px-6 py-4 text-slate-400">{l.from} to {l.to}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : l.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                    {l.status}
                  </span>
                </td>
                {isApprover && (
                  <td className="px-6 py-4">
                    {l.status === 'Pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-400 hover:bg-emerald-500/20"><CheckCircle className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20"><XCircle className="w-4 h-4" /></Button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-slate-950 border-slate-800">
          <DialogHeader><DialogTitle className="text-white">Apply for Leave</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label className="text-slate-300">From Date</Label>
                 <Input type="date" className="bg-slate-900 border-slate-800 text-white" />
               </div>
               <div>
                 <Label className="text-slate-300">To Date</Label>
                 <Input type="date" className="bg-slate-900 border-slate-800 text-white" />
               </div>
             </div>
             <div>
               <Label className="text-slate-300">Type</Label>
               <select className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-800 text-white">
                 <option>Medical</option><option>Personal</option><option>Family Emergency</option>
               </select>
             </div>
             <div>
               <Label className="text-slate-300">Reason</Label>
               <Input className="bg-slate-900 border-slate-800 text-white" />
             </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-slate-400">Cancel</Button>
            <Button onClick={() => setShowAdd(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}