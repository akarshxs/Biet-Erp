import { useListSubjects } from '@workspace/api-client-react';
import { BookOpen, Search, Plus, Filter } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SubjectsPage({ user }: { user: any }) {
  const { data: subjects = [], isLoading } = useListSubjects();
  const [search, setSearch] = useState('');

  const filtered = subjects.filter((s: any) => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Subjects</h1>
          <p className="text-sm text-slate-400">Manage curriculum and courses.</p>
        </div>
        {['owner', 'admin'].includes(user.role) && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Subject
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by code or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
          />
        </div>
        <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white w-full sm:w-auto">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s: any) => (
            <div key={s.id} className="group relative bg-slate-900 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-indigo-500/10 text-indigo-400 font-mono text-xs font-semibold px-2 py-1 rounded">
                  {s.code}
                </div>
                <div className="text-slate-500 text-sm">
                  {s.credits} Credits
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{s.name}</h3>
              <p className="text-sm text-slate-400 mb-6">{s.department} • Semester {s.semester}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-400">T1</div>
                  <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-400">T2</div>
                </div>
                <button className="text-xs font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-400">
                  View Details →
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-xl">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No subjects found</p>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
