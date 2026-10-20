import { GraduationCap } from 'lucide-react';

const COURSES = [
  { id: 1, code: 'CSE', name: 'Computer Science & Engineering', duration: '4 Years', intake: 60, pgm: 'B.E.' },
  { id: 2, code: 'ISE', name: 'Information Science & Engineering', duration: '4 Years', intake: 60, pgm: 'B.E.' },
  { id: 3, code: 'AIML', name: 'Artificial Intelligence & Machine Learning', duration: '4 Years', intake: 60, pgm: 'B.E.' },
  { id: 4, code: 'AIDS', name: 'Artificial Intelligence & Data Science', duration: '4 Years', intake: 30, pgm: 'B.E.' },
  { id: 5, code: 'ECE', name: 'Electronics & Communication', duration: '4 Years', intake: 60, pgm: 'B.E.' },
];

export default function CoursesPage({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><GraduationCap className="w-6 h-6" /> Courses Offered</h1>
          <p className="text-sm text-slate-400">Programs and seat matrix</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.map(c => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors" />
            <div className="flex items-start justify-between mb-4 relative">
              <div>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded">{c.pgm}</span>
                <h3 className="text-xl font-bold text-white mt-2">{c.code}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold">
                {c.intake}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-300 mb-4 relative">{c.name}</p>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800 relative">
              <span>Duration: {c.duration}</span>
              <span>Affiliated: VTU</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}