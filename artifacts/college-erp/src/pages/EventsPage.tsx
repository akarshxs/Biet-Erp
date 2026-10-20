import { useListEvents } from '@workspace/api-client-react';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EventsPage({ user }: { user: any }) {
  const { data: events = [], isLoading } = useListEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Events</h1>
          <p className="text-sm text-slate-400">Campus happenings and activities.</p>
        </div>
        {['owner', 'admin'].includes(user.role) && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {events.map((e: any) => {
            const isPast = new Date(e.date) < new Date();
            return (
              <div key={e.id} className={`bg-slate-900 border rounded-xl overflow-hidden flex flex-col ${isPast ? 'border-slate-800/40 opacity-70' : 'border-slate-800/60 hover:border-slate-700 transition-colors'}`}>
                <div className="h-32 bg-slate-800 relative">
                  {/* Decorative pattern for event image placeholder */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded text-white border border-slate-700/50 capitalize">
                    {e.type}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{e.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">{e.description}</p>
                  
                  <div className="space-y-2 mt-auto text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="truncate">{e.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>{e.registrations?.length || 0} / {e.maxParticipants} Registered</span>
                    </div>
                  </div>
                  
                  {!isPast && user.role === 'student' && (
                    <Button className="w-full mt-5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
                      Register Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {events.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-xl">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No upcoming events</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
