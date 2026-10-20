import { BookMarked, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotesPage({ user }: { user: any }) {
  // Mock data for UI demonstration since no generated hook is obvious from index
  const notes = [
    { id: 1, title: 'Operating Systems Chapter 1', subject: 'OS', author: 'Dr. Smith', type: 'PDF', date: '2023-10-12', size: '2.4 MB' },
    { id: 2, title: 'Database Normalization Slides', subject: 'DBMS', author: 'Prof. Johnson', type: 'PPT', date: '2023-10-10', size: '5.1 MB' },
    { id: 3, title: 'Network Protocols Cheatsheet', subject: 'CN', author: 'Dr. Davis', type: 'DOC', date: '2023-10-08', size: '1.2 MB' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Study Materials</h1>
          <p className="text-sm text-slate-400">Access and download lecture notes.</p>
        </div>
        {user.role === 'teacher' && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Upload Material
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {notes.map((n) => (
          <div key={n.id} className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm
                ${n.type === 'PDF' ? 'bg-red-500/10 text-red-400' : n.type === 'PPT' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                {n.type}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white truncate">{n.title}</h3>
                <p className="text-xs text-indigo-400 mt-0.5">{n.subject}</p>
              </div>
            </div>
            
            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>By {n.author}</span>
                <span>{new Date(n.date).toLocaleDateString()}</span>
              </div>
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">
                <Download className="w-4 h-4 mr-2" /> Download ({n.size})
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
