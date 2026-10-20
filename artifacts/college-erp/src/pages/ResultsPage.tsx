import { useListResults, useGetStudentSgpa, getGetStudentSgpaQueryKey } from '@workspace/api-client-react';
import { Award, TrendingUp, BookOpen, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ResultsPage({ user }: { user: any }) {
  const { data: results = [], isLoading: resultsLoading } = useListResults();
  const { data: sgpaData, isLoading: sgpaLoading } = useGetStudentSgpa(user.id, {
    query: { enabled: user.role === 'student', queryKey: getGetStudentSgpaQueryKey(user.id) }
  });

  if (resultsLoading || sgpaLoading) {
    return <div className="flex justify-center h-64 items-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (user.role === 'student' && sgpaData) {
    const latestSgpa = sgpaData.sgpaList?.length ? sgpaData.sgpaList[sgpaData.sgpaList.length - 1]?.sgpa : 0;
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Academic Performance</h1>
          <p className="text-sm text-slate-400">Track your grades and semester progress.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-indigo-500/20"><Award className="w-12 h-12" /></div>
            <p className="text-sm font-medium text-slate-400 mb-2">Cumulative GPA</p>
            <p className="text-4xl font-bold text-white tracking-tighter">{sgpaData.cgpa?.toFixed(2) || '—'}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-emerald-500/20"><TrendingUp className="w-12 h-12" /></div>
            <p className="text-sm font-medium text-slate-400 mb-2">Latest SGPA</p>
            <p className="text-4xl font-bold text-white tracking-tighter">{latestSgpa?.toFixed(2) || '—'}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-amber-500/20"><BookOpen className="w-12 h-12" /></div>
            <p className="text-sm font-medium text-slate-400 mb-2">Semesters Completed</p>
            <p className="text-4xl font-bold text-white tracking-tighter">{sgpaData.totalSemesters || 0}</p>
          </div>
        </div>

        {sgpaData.sgpaList && sgpaData.sgpaList.length > 0 && (
          <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-6">Performance Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sgpaData.sgpaList.map((s: any) => ({ name: `Sem ${s.semester}`, sgpa: s.sgpa }))}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 10]} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }} />
                  <Bar dataKey="sgpa" radius={[4, 4, 0, 0]} barSize={40}>
                    {sgpaData.sgpaList.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.sgpa >= 8 ? '#10b981' : entry.sgpa >= 6 ? '#6366f1' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Teacher/Admin View
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Results Database</h1>
        <p className="text-sm text-slate-400">View and enter student grades.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-slate-800/60">
            <tr>
              <th className="px-6 py-4 font-semibold">Student Name</th>
              <th className="px-6 py-4 font-semibold">Subject</th>
              <th className="px-6 py-4 font-semibold">Semester</th>
              <th className="px-6 py-4 font-semibold">Score</th>
              <th className="px-6 py-4 font-semibold">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {results.map((r: any) => (
              <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{r.studentName}</td>
                <td className="px-6 py-4 text-slate-300">{r.subjectName}</td>
                <td className="px-6 py-4 text-slate-400">Sem {r.semester}</td>
                <td className="px-6 py-4 text-white font-mono">{r.totalMarks}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                    ${['S', 'S+', 'A', 'O'].includes(r.grade) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      ['B', 'C', 'D'].includes(r.grade) ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {r.grade}
                  </span>
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No results found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
