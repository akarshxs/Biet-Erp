import { useState } from 'react';
import { GraduationCap, FileCheck, CheckCircle, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SCHOLARSHIPS = [
  { id: 1, name: 'SC/ST Post-Matric Scholarship', type: 'Govt', eligibility: 'SC/ST students', amount: '₹50,000/yr', seats: 'Unlimited' },
  { id: 2, name: 'OBC Scholarship', type: 'Govt', eligibility: 'OBC students', amount: '₹25,000/yr', seats: 'Unlimited' },
  { id: 3, name: 'Merit Scholarship', type: 'College', eligibility: '>85% in PUC', amount: '₹20,000/yr', seats: '20' },
  { id: 4, name: 'Sports Excellence', type: 'College', eligibility: 'State/National level', amount: '₹15,000/yr', seats: '10' },
  { id: 5, name: 'Free Education (Fallen Soldiers)', type: 'Chairman', eligibility: 'Children of fallen soldiers', amount: 'Full Fee', seats: '5' },
];

export default function ScholarshipsPage({ user }: { user: any }) {
  const [tab, setTab] = useState('Available');
  const isAdmin = ['owner', 'admin'].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><GraduationCap className="w-6 h-6" /> Scholarships</h1>
          <p className="text-sm text-slate-400">View and apply for scholarships</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-800">
        <button onClick={() => setTab('Available')} className={`pb-2 text-sm font-medium ${tab === 'Available' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}>Available Programs</button>
        {isAdmin ? (
          <button onClick={() => setTab('Applications')} className={`pb-2 text-sm font-medium ${tab === 'Applications' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}>Applications</button>
        ) : (
          <button onClick={() => setTab('My Applications')} className={`pb-2 text-sm font-medium ${tab === 'My Applications' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}>My Applications</button>
        )}
      </div>

      {tab === 'Available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCHOLARSHIPS.map(s => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/30 transition-colors flex flex-col h-full">
              <div className="mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.type === 'Govt' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {s.type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.name}</h3>
              <div className="space-y-2 text-sm mt-auto mb-4">
                <div className="flex justify-between"><span className="text-slate-400">Eligibility:</span><span className="text-white">{s.eligibility}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Amount:</span><span className="text-white font-medium">{s.amount}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Seats:</span><span className="text-slate-300">{s.seats}</span></div>
              </div>
              {!isAdmin && (
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-auto">Apply Now</Button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'Applications' && isAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-slate-800">
              <tr><th className="px-6 py-3">Applicant</th><th className="px-6 py-3">Scholarship</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="px-6 py-4"><div><p className="text-white font-medium">Rahul K</p><p className="text-xs text-slate-500">CSE • 1SK21CS001</p></div></td>
                <td className="px-6 py-4 text-slate-300">Merit Scholarship</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded">Pending</span></td>
                <td className="px-6 py-4"><div className="flex gap-2"><Button size="sm" className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30">Approve</Button></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === 'My Applications' && !isAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
          <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-white font-medium">No applications found</p>
        </div>
      )}
    </div>
  );
}