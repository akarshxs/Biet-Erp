import { Briefcase, MapPin, Building, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PlacementsPage({ user }: { user: any }) {
  const jobs = [
    { id: 1, company: 'Google', role: 'Software Engineer', location: 'Bangalore', ctc: '32 LPA', deadline: '2023-11-15', tags: ['SDE', 'Full-time'] },
    { id: 2, company: 'Microsoft', role: 'Frontend Developer', location: 'Hyderabad', ctc: '28 LPA', deadline: '2023-11-20', tags: ['Frontend', 'Full-time'] },
    { id: 3, company: 'Amazon', role: 'SDE Intern', location: 'Remote', ctc: '80K/mo', deadline: '2023-11-10', tags: ['Internship', 'Remote'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Placements</h1>
          <p className="text-sm text-slate-400">Campus recruitment drives and opportunities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.map((j) => (
          <div key={j.id} className="bg-slate-900 border border-slate-800/60 rounded-xl p-6 hover:border-indigo-500/40 transition-colors flex flex-col group relative">
            <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active
            </div>
            
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-sm text-xl font-bold text-slate-300">
                {j.company.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{j.role}</h3>
                <p className="text-sm font-medium text-indigo-400">{j.company}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6 flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="w-4 h-4 text-slate-500" /> {j.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Building className="w-4 h-4 text-slate-500" /> Package: <span className="font-mono font-medium text-white">{j.ctc}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500" /> Deadline: {new Date(j.deadline).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              {j.tags.map(t => (
                <span key={t} className="px-2.5 py-1 rounded bg-slate-800 text-xs font-medium text-slate-400 border border-slate-700/50">
                  {t}
                </span>
              ))}
            </div>
            
            <Button className="w-full bg-slate-800 hover:bg-indigo-600 text-white border border-slate-700 hover:border-indigo-500 transition-colors">
              Apply Now
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
