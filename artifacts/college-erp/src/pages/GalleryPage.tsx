import { useState } from 'react';
import { Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GalleryPage({ user }: { user: any }) {
  const [tab, setTab] = useState('All');
  const isAdmin = ['owner', 'admin'].includes(user.role);

  const ITEMS = [
    { id: 1, title: 'Annual Tech Fest 2023', cat: 'Events', color: 'from-indigo-500 to-purple-600' },
    { id: 2, title: 'Campus Main Building', cat: 'Infrastructure', color: 'from-blue-500 to-cyan-600' },
    { id: 3, title: 'Sports Day Final Match', cat: 'Sports', color: 'from-emerald-500 to-teal-600' },
    { id: 4, title: 'TCS Placement Drive', cat: 'Placements', color: 'from-amber-500 to-orange-600' },
    { id: 5, title: 'Graduation Ceremony', cat: 'Events', color: 'from-rose-500 to-red-600' },
    { id: 6, title: 'Library Interior', cat: 'Infrastructure', color: 'from-slate-600 to-slate-800' },
  ];

  const filtered = tab === 'All' ? ITEMS : ITEMS.filter(i => i.cat === tab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ImageIcon className="w-6 h-6" /> Gallery</h1>
          <p className="text-sm text-slate-400">Campus life and events</p>
        </div>
        {isAdmin && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Photo
          </Button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Events', 'Infrastructure', 'Sports', 'Placements'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${tab === t ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(i => (
          <div key={i.id} className={`aspect-video rounded-xl bg-gradient-to-br ${i.color} p-6 flex flex-col justify-end relative overflow-hidden group cursor-pointer`}>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative z-10 translate-y-2 group-hover:translate-y-0 transition-transform">
              <span className="px-2 py-1 bg-black/30 backdrop-blur-md rounded text-[10px] text-white/90 uppercase tracking-wider font-bold mb-2 inline-block">{i.cat}</span>
              <h3 className="text-lg font-bold text-white shadow-sm">{i.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}