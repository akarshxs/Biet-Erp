import { ShieldAlert, Terminal } from 'lucide-react';

export default function LogsPage({ user }: { user: any }) {
  const logs = [
    { id: 1, action: 'USER_LOGIN', user: 'admin@nexus.edu', ip: '192.168.1.45', time: '2 mins ago', status: 'success' },
    { id: 2, action: 'FEE_PAYMENT', user: 'student1@nexus.edu', ip: '10.0.0.12', time: '15 mins ago', status: 'success' },
    { id: 3, action: 'UNAUTHORIZED_ACCESS', user: 'unknown', ip: '145.23.4.1', time: '1 hour ago', status: 'danger' },
    { id: 4, action: 'GRADE_UPDATE', user: 'prof.smith@nexus.edu', ip: '192.168.1.102', time: '2 hours ago', status: 'success' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Audit Logs</h1>
          <p className="text-sm text-slate-400">System security and activity monitoring.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 font-mono">
          <Terminal className="w-4 h-4 text-emerald-400" />
          System Normal
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm font-mono text-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-950/80 text-slate-500 border-b border-slate-800/60">
            <tr>
              <th className="px-6 py-3 font-normal">Timestamp</th>
              <th className="px-6 py-3 font-normal">Action</th>
              <th className="px-6 py-3 font-normal">User/Origin</th>
              <th className="px-6 py-3 font-normal">IP Address</th>
              <th className="px-6 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-3 text-slate-500">{l.time}</td>
                <td className="px-6 py-3 text-white">{l.action}</td>
                <td className="px-6 py-3 text-indigo-400">{l.user}</td>
                <td className="px-6 py-3 text-slate-400">{l.ip}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-1.5
                    ${l.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${l.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
