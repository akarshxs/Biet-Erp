import { useState } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const INITIAL_EVENTS = [
  { id: 1, date: '2025-06-01', title: 'College reopens', type: 'Important' },
  { id: 2, date: '2025-06-03', title: 'Orientation Day', type: 'Event' },
  { id: 3, date: '2025-07-14', title: 'Internal Test 1 Begins', type: 'Exam' },
  { id: 4, date: '2025-07-15', title: 'Independence Day', type: 'Holiday' },
  { id: 5, date: '2025-08-22', title: 'Department Fest', type: 'Event' },
  { id: 6, date: '2025-09-01', title: '1st IA Results', type: 'Result' },
  { id: 7, date: '2025-10-02', title: 'Dasara Holiday', type: 'Holiday' },
  { id: 8, date: '2025-12-01', title: 'VTU Semester Exams', type: 'Exam' },
];

const TYPE_COLORS: Record<string, string> = {
  Exam: 'bg-red-500/20 text-red-400 border-red-500/30',
  Holiday: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Event: 'bg-green-500/20 text-green-400 border-green-500/30',
  Important: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Result: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export default function AcademicCalendarPage({ user }: { user: any }) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // Start June 2025
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [showAdd, setShowAdd] = useState(false);
  const isAdmin = ['owner', 'admin'].includes(user.role);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><CalendarRange className="w-6 h-6" /> Academic Calendar</h1>
          <p className="text-sm text-slate-400">2025-26 Academic Year</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAdd(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Event
          </Button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{monthName}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" onClick={goToday} className="bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800">Today</Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-slate-800 border border-slate-800 rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="bg-slate-950 p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="bg-slate-900/50 min-h-[100px]" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            return (
              <div key={day} className="bg-slate-900 min-h-[100px] p-2 hover:bg-slate-800/50 transition-colors border-t border-slate-800">
                <span className="text-sm font-medium text-slate-300">{day}</span>
                <div className="mt-1 space-y-1">
                  {dayEvents.map(e => (
                    <div key={e.id} className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${TYPE_COLORS[e.type]}`}>
                      {e.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-slate-950 border-slate-800">
          <DialogHeader><DialogTitle className="text-white">Add Calendar Event</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
             <div>
               <Label className="text-slate-300">Date</Label>
               <Input type="date" className="bg-slate-900 border-slate-800 text-white" />
             </div>
             <div>
               <Label className="text-slate-300">Title</Label>
               <Input className="bg-slate-900 border-slate-800 text-white" />
             </div>
             <div>
               <Label className="text-slate-300">Type</Label>
               <select className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-800 text-white">
                 <option>Exam</option><option>Holiday</option><option>Event</option><option>Important</option><option>Result</option>
               </select>
             </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-slate-400">Cancel</Button>
            <Button onClick={() => setShowAdd(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}