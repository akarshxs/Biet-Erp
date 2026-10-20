import { Library as LibraryIcon, Book, Search, BookCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LibraryPage({ user }: { user: any }) {
  const books = [
    { id: 1, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', available: true },
    { id: 2, title: 'Clean Code', author: 'Robert C. Martin', category: 'Software Engineering', available: false },
    { id: 3, title: 'Design Patterns', author: 'Erich Gamma', category: 'Software Engineering', available: true },
    { id: 4, title: 'Database System Concepts', author: 'Abraham Silberschatz', category: 'Databases', available: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Digital Library</h1>
          <p className="text-sm text-slate-400">Search and borrow resources.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input placeholder="Search books by title, author, or ISBN..." className="pl-9 h-12 bg-slate-900 border-slate-800 text-white" />
        </div>
        <Button className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white">Search</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {books.map(b => (
          <div key={b.id} className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col">
            <div className="w-12 h-16 bg-slate-800 rounded mb-4 flex items-center justify-center border border-slate-700 shadow-sm relative overflow-hidden">
              <div className={`absolute inset-0 opacity-20 ${b.available ? 'bg-indigo-500' : 'bg-slate-500'}`} />
              <Book className={`w-6 h-6 ${b.available ? 'text-indigo-400' : 'text-slate-500'}`} />
            </div>
            
            <h3 className="text-base font-bold text-white leading-tight mb-1 line-clamp-2">{b.title}</h3>
            <p className="text-sm text-slate-400 mb-4 flex-1">{b.author}</p>
            
            <div className="flex items-center justify-between mt-auto">
              <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider
                ${b.available ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                {b.available ? 'Available' : 'Issued'}
              </span>
              {b.available && (
                <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                  Request
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
