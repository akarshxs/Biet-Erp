import { CalendarDays } from 'lucide-react';

export default function TimetablePage({ user }: { user: any }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Timetable</h1>
        <p className="text-sm text-slate-400">Weekly class schedule.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800/60 rounded-xl overflow-x-auto shadow-sm flex-1">
        <table className="w-full min-w-[800px] text-sm text-center border-collapse">
          <thead className="text-xs uppercase bg-slate-950/50 text-slate-400">
            <tr>
              <th className="p-4 border-b border-r border-slate-800/60 w-24">Time</th>
              {days.map(d => (
                <th key={d} className="p-4 border-b border-slate-800/60 font-semibold">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {times.map((t, i) => (
              <tr key={t} className="hover:bg-slate-800/20 transition-colors">
                <td className="p-4 border-r border-slate-800/60 font-medium text-slate-400 whitespace-nowrap bg-slate-950/30">
                  {t}
                </td>
                {days.map(d => {
                  // Mock lunch break
                  if (t === '01:00 PM') {
                    if (d === 'Monday') return <td key={d} colSpan={5} className="p-4 bg-slate-950/50 text-slate-500 tracking-[0.2em] font-medium border-l border-slate-800/60">LUNCH BREAK</td>;
                    return null;
                  }
                  
                  // Mock random classes
                  const hasClass = Math.random() > 0.4;
                  if (!hasClass) return <td key={d} className="p-4 border-l border-slate-800/60 text-slate-600">—</td>;
                  
                  const subjects = ['Data Structures', 'DBMS', 'Computer Networks', 'Operating Systems'];
                  const subject = subjects[Math.floor(Math.random() * subjects.length)];
                  
                  return (
                    <td key={d} className="p-2 border-l border-slate-800/60">
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 h-full flex flex-col items-center justify-center gap-1 hover:bg-indigo-500/20 transition-colors cursor-pointer">
                        <span className="font-bold text-indigo-400 text-xs leading-tight">{subject}</span>
                        <span className="text-[10px] text-slate-400">Room {300 + Math.floor(Math.random() * 20)}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
