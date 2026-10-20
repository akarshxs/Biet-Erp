import { useMemo, useState } from 'react';
import { getGetAnalyticsOverviewQueryKey, useGetAnalyticsOverview } from '@workspace/api-client-react';
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, Briefcase, ClipboardCheck, Bell, Award, BarChart3, ClipboardList, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

function StatsCard({ title, value, icon: Icon, trend }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 hover:-translate-y-0.5 transition-transform duration-200">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        {trend && (
          <span className={`text-xs mb-1 font-medium ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage({ user, onNavigate }: { user: any; onNavigate?: (section: string) => void }) {
  const canViewOverview = useMemo(() => ['owner', 'admin', 'administrator', 'principal'].includes(user.role), [user.role]);
  const overviewQuery = useGetAnalyticsOverview({
    query: { enabled: canViewOverview, queryKey: getGetAnalyticsOverviewQueryKey() },
  });
  const data = overviewQuery.data;
  const loading = canViewOverview && overviewQuery.isLoading;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-slate-900 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-32 bg-slate-900 rounded-xl" />
          <div className="h-32 bg-slate-900 rounded-xl" />
          <div className="h-32 bg-slate-900 rounded-xl" />
          <div className="h-32 bg-slate-900 rounded-xl" />
        </div>
      </div>
    );
  }

  if (user.role === 'student') return <StudentDashboard user={user} onNavigate={onNavigate} />;
  if (user.role === 'teacher') return <TeacherDashboard user={user} onNavigate={onNavigate} />;
  if (user.role === 'hod') return <HodDashboard user={user} onNavigate={onNavigate} />;
  if (user.role === 'principal') return <PrincipalDashboard user={user} onNavigate={onNavigate} />;
  if (user.role === 'parent') return <ParentDashboard user={user} onNavigate={onNavigate} />;

  const chartData = [
    { name: 'Mon', attendance: 85 },
    { name: 'Tue', attendance: 88 },
    { name: 'Wed', attendance: 92 },
    { name: 'Thu', attendance: 81 },
    { name: 'Fri', attendance: 89 },
  ];

  const deptData = [
    { name: 'CSE', students: 420 },
    { name: 'ECE', students: 250 },
    { name: 'MECH', students: 180 },
    { name: 'CIVIL', students: 150 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={data?.totalStudents || 1240} icon={GraduationCap} trend={4.2} />
        <StatsCard title="Total Teachers" value={data?.totalTeachers || 145} icon={Users} trend={1.5} />
        <StatsCard title="Active Departments" value={data?.totalDepartments || 8} icon={BookOpen} />
        <StatsCard title="Pending Fees" value={"$42.5K"} icon={DollarSign} trend={-2.4} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Department Enrollment</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }} />
                <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Weekly Attendance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { text: "New notice posted by Admin: 'Semester End Exams'", time: "2 hours ago" },
              { text: "Dr. Smith marked attendance for CSE-301", time: "4 hours ago" },
              { text: "Fee payment of ₹38,500 received from Asha Kulkarni", time: "5 hours ago" },
              { text: "Library book 'Clean Code' issued to Rohan Patil", time: "Yesterday" }
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-300">{activity.text}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Student', icon: Users, section: 'users' },
              { label: 'Post Notice', icon: Bell, section: 'notices' },
              { label: 'View Fees', icon: DollarSign, section: 'fees' },
              { label: 'Analytics', icon: BarChart3, section: 'analytics' }
            ].map((action) => (
              <button
                key={action.section}
                onClick={() => onNavigate?.(action.section)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                <action.icon className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HodDashboard({ user, onNavigate }: any) {
  const [data, setData] = useState({
    subjects: 12, teachers: 24, students: 450, avgAttendance: 84.5,
    pendingLeaves: 5
  });

  const attendanceData = [
    { name: 'OS', attendance: 88 },
    { name: 'DBMS', attendance: 82 },
    { name: 'Networks', attendance: 79 },
    { name: 'AI/ML', attendance: 91 },
    { name: 'Web Dev', attendance: 85 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">My Department Overview</h2>
          <p className="text-sm text-slate-400">Computer Science & Engineering</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Subjects" value={data.subjects} icon={BookOpen} />
        <StatsCard title="Teachers" value={data.teachers} icon={Users} />
        <StatsCard title="Students Enrolled" value={data.students} icon={GraduationCap} />
        <StatsCard title="Avg Attendance" value={`${data.avgAttendance}%`} icon={ClipboardCheck} trend={1.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Subject-wise Attendance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }} />
                <Bar dataKey="attendance" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Results</h3>
            <button onClick={() => onNavigate?.('results')} className="text-xs text-indigo-400">View All</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-950/50 text-slate-400">
                <tr>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Sem</th>
                  <th className="px-3 py-2">Pass %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr><td className="px-3 py-2 text-white">DBMS</td><td className="px-3 py-2 text-slate-400">5th</td><td className="px-3 py-2 text-emerald-400">92%</td></tr>
                <tr><td className="px-3 py-2 text-white">OS</td><td className="px-3 py-2 text-slate-400">5th</td><td className="px-3 py-2 text-emerald-400">88%</td></tr>
                <tr><td className="px-3 py-2 text-white">Networks</td><td className="px-3 py-2 text-slate-400">6th</td><td className="px-3 py-2 text-emerald-400">85%</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-sm text-slate-300">Pending Leave Approvals</span>
            <button onClick={() => onNavigate?.('leave')} className="px-3 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-md text-xs font-medium">
              Review {data.pendingLeaves} requests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrincipalDashboard({ user, onNavigate }: any) {
  const deptData = [
    { name: 'CSE', performance: 88 },
    { name: 'ISE', performance: 85 },
    { name: 'ECE', performance: 78 },
    { name: 'MECH', performance: 72 },
    { name: 'CIVIL', performance: 75 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">College Overview</h2>
          <p className="text-sm text-slate-400">BIET ERP</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value="2,450" icon={GraduationCap} />
        <StatsCard title="Total Faculty" value="185" icon={Users} />
        <StatsCard title="Departments" value="8" icon={BookOpen} />
        <StatsCard title="Overall Attendance" value="82.4%" icon={TrendingUp} trend={0.5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Department-wise Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }} />
                <Bar dataKey="performance" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Upcoming Events</h3>
              <button onClick={() => onNavigate?.('events')} className="text-xs text-indigo-400">View All</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex flex-col items-center justify-center text-indigo-400">
                  <span className="text-xs font-bold">24</span>
                  <span className="text-[10px] uppercase">Nov</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Annual Tech Symposium</p>
                  <p className="text-xs text-slate-500">Main Auditorium</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex flex-col items-center justify-center text-emerald-400">
                  <span className="text-xs font-bold">12</span>
                  <span className="text-[10px] uppercase">Dec</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Alumni Meet 2025</p>
                  <p className="text-xs text-slate-500">College Campus</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Action Items</h3>
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950">
              <span className="text-sm text-slate-300">Staff Leave Approvals</span>
              <button onClick={() => onNavigate?.('leave')} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs text-white">Review 12</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950 mt-2">
              <span className="text-sm text-slate-300">Department Budgets</span>
              <button onClick={() => onNavigate?.('analytics')} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white">View 3</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentDashboard({ user, onNavigate }: any) {
  // Simulate no child linked for the dummy account
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-8 text-center max-w-2xl mx-auto mt-12">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Welcome to Parent Portal</h2>
        <p className="text-slate-400 text-sm mb-6">
          Your account is active, but we couldn't find a linked student profile. Link your child's account to track their attendance, results, fees, and more.
        </p>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
          Link Child's Account
        </button>
        <p className="text-xs text-slate-500 mt-4">
          Need help? Contact the admin office with your child's roll number.
        </p>
      </div>
    </div>
  );
}

function StudentDashboard({ user, onNavigate }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Attendance" value="86%" icon={ClipboardCheck} trend={2.1} />
        <StatsCard title="Current CGPA" value="8.4" icon={Award} trend={0.2} />
        <StatsCard title="Pending Fees" value="$0" icon={DollarSign} />
        <StatsCard title="Unread Messages" value="3" icon={Bell} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Upcoming Assignments</h3>
            <button onClick={() => onNavigate?.('assignments')} className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Database Normalization', subject: 'DBMS', due: '2 days left', urgent: true },
              { title: 'React UI Components', subject: 'Web Dev', due: '5 days left', urgent: false },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950">
                <div>
                  <p className="text-sm font-medium text-white">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.subject}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${a.urgent ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {a.due}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Latest Notices</h3>
            <button onClick={() => onNavigate?.('notices')} className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-1 bg-red-500 rounded-full" />
              <div>
                <p className="text-sm text-white">End Semester Exam Timetable Released</p>
                <p className="text-xs text-slate-500">Today</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1 bg-indigo-500 rounded-full" />
              <div>
                <p className="text-sm text-white">Guest Lecture on AI/ML</p>
                <p className="text-xs text-slate-500">Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherDashboard({ user, onNavigate }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="My Subjects" value="4" icon={BookOpen} />
        <StatsCard title="Students Taught" value="245" icon={Users} />
        <StatsCard title="Pending Evaluations" value="12" icon={ClipboardList} />
        <StatsCard title="Today's Classes" value="3" icon={Calendar} />
      </div>

      <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Today's Schedule</h3>
        <div className="space-y-3">
          {[
            { time: '09:00 AM', subject: 'Data Structures', room: 'Room 301', section: 'CSE-A' },
            { time: '11:00 AM', subject: 'Web Development', room: 'Lab 2', section: 'CSE-B' },
            { time: '02:00 PM', subject: 'Algorithms', room: 'Room 304', section: 'ISE-A' },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-slate-800 bg-slate-950 hover:border-slate-700 transition-colors">
              <div className="w-20 flex-shrink-0">
                <p className="text-sm font-bold text-white">{c.time}</p>
              </div>
              <div className="w-1 h-8 bg-indigo-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{c.subject}</p>
                <p className="text-xs text-slate-500">{c.section} • {c.room}</p>
              </div>
              <button 
                onClick={() => onNavigate?.('attendance')}
                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium rounded-md transition-colors"
              >
                Mark Attendance
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
