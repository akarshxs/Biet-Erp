import { useState } from 'react';
import { useGetAttendanceStats, getGetAttendanceStatsQueryKey } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function AttendancePage({ user }: { user: any }) {
  const { data: stats, isLoading } = useGetAttendanceStats(user.id, {
    query: { enabled: user.role === 'student', queryKey: getGetAttendanceStatsQueryKey(user.id) }
  });

  if (user.role !== 'student') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Attendance</h1>
          <p className="text-sm text-slate-400">Record and monitor class attendance.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Select a class to mark attendance</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">Choose a subject and section from your schedule to bring up the student roster for today's session.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center h-64 items-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const overall = stats?.overall?.percentage || 0;
  const overallColor = overall >= 75 ? '#10b981' : overall >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">My Attendance</h1>
        <p className="text-sm text-slate-400">Keep track of your presence across all subjects.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Status Card */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
          <h3 className="text-sm font-semibold text-slate-300 w-full text-left mb-6">Aggregate Attendance</h3>
          
          <div className="w-40 h-40 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="80%" outerRadius="100%" barSize={8} data={[{ name: 'A', value: overall, fill: overallColor }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: '#1e293b' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white tracking-tighter">{overall}%</span>
            </div>
          </div>
          
          <div className="mt-6 w-full text-center">
            <p className="text-sm text-slate-400">
              <span className="text-white font-medium">{stats?.overall?.present || 0}</span> present out of <span className="text-white font-medium">{stats?.overall?.total || 0}</span> total classes
            </p>
            {overall < 75 && (
              <p className="text-xs text-red-400 mt-2 font-medium bg-red-500/10 py-1.5 px-3 rounded-md inline-block">
                Warning: Below 75% minimum requirement
              </p>
            )}
          </div>
        </div>

        {/* Subject-wise grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats?.bySubject?.filter((s: any) => s.total > 0).map((s: any) => {
            const isGood = s.percentage >= 75;
            const isWarn = s.percentage >= 60 && s.percentage < 75;
            return (
              <div key={s.subjectId} className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-sm font-bold text-white truncate">{s.subjectName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{s.present} / {s.total} classes</p>
                  </div>
                  <span className={cn(
                    "text-xl font-bold tracking-tight",
                    isGood ? "text-emerald-400" : isWarn ? "text-amber-400" : "text-red-400"
                  )}>
                    {s.percentage}%
                  </span>
                </div>
                
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", 
                      isGood ? "bg-emerald-500" : isWarn ? "bg-amber-500" : "bg-red-500"
                    )} 
                    style={{ width: `${s.percentage}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
