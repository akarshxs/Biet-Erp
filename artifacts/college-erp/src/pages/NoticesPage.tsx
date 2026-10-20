import { useListNotices } from '@workspace/api-client-react';
import { Bell, Pin, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NoticesPage({ user }: { user: any }) {
  const { data: notices = [], isLoading } = useListNotices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Notice Board</h1>
          <p className="text-sm text-slate-400">Important announcements and updates.</p>
        </div>
        {['owner', 'admin'].includes(user.role) && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> New Notice
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-4xl space-y-4">
          {notices.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((n: any, idx: number) => {
            const isHighPriority = n.priority === 'high';
            return (
              <div 
                key={n.id} 
                className={`group relative bg-slate-900 border rounded-xl p-5 hover:border-slate-700 transition-colors
                  ${isHighPriority ? 'border-red-500/30' : 'border-slate-800/60'}`}
              >
                {/* Priority indicator line */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full
                  ${isHighPriority ? 'bg-red-500' : n.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                />
                
                <div className="pl-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white tracking-tight">{n.title}</h3>
                      {idx === 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <Pin className="w-3 h-3 mr-1" /> Pinned
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">{n.content}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">
                        {n.authorName?.charAt(0)}
                      </div>
                      {n.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {notices.length === 0 && (
            <div className="py-20 text-center border border-dashed border-slate-800 rounded-xl">
              <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Notice board is empty</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
