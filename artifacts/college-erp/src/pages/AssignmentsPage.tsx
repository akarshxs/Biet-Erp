import { useListAssignments } from '@workspace/api-client-react';
import { ClipboardList, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AssignmentsPage({ user }: { user: any }) {
  const { data: assignments = [], isLoading } = useListAssignments();

  if (isLoading) {
    return <div className="flex justify-center h-64 items-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Assignments</h1>
          <p className="text-sm text-slate-400">Coursework and submissions.</p>
        </div>
        {user.role === 'teacher' && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            Create Assignment
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((a: any, i: number) => {
          const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          const isUrgent = daysLeft >= 0 && daysLeft <= 3;
          const isOverdue = daysLeft < 0;
          // mock submission status for visual
          const isSubmitted = user.role === 'student' && i % 3 === 0;

          return (
            <div key={a.id} className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col h-full">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                  {a.subjectName}
                </span>
                {user.role === 'student' ? (
                  isSubmitted ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                    </span>
                  ) : (
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded
                      ${isOverdue ? 'bg-red-500/10 text-red-400' : isUrgent ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
                      <Clock className="w-3 h-3" />
                      {isOverdue ? 'Overdue' : `${daysLeft} days left`}
                    </span>
                  )
                ) : (
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> 14 Submissions
                  </span>
                )}
              </div>
              
              <h3 className="text-base font-bold text-white leading-tight mb-2">{a.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-6">{a.description}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Due: {new Date(a.dueDate).toLocaleDateString()} • {a.maxMarks} Points
                </span>
                {user.role === 'student' && !isSubmitted && !isOverdue && (
                  <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700">Submit</Button>
                )}
                {user.role === 'teacher' && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-300 hover:text-white">Grade</Button>
                )}
              </div>
            </div>
          );
        })}
        {assignments.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-xl">
            <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No active assignments</p>
          </div>
        )}
      </div>
    </div>
  );
}
