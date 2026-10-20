import { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_ROUTES = [
  { id: '1', routeNo: 'R-01', name: 'City Center Route', stops: 'City Center, Main Station, North Gate, College', vehicle: 'KA-25-A-1234', driver: 'Suresh (9876543210)', timing: '08:00 AM - 05:00 PM', fee: 1200, count: 45 },
  { id: '2', routeNo: 'R-02', name: 'South Suburb Route', stops: 'South Mall, Park Road, East End, College', vehicle: 'KA-25-A-5678', driver: 'Mahesh (9876543211)', timing: '08:15 AM - 05:15 PM', fee: 1500, count: 38 },
];

export default function TransportPage({ user }: { user: any }) {
  const [routes, setRoutes] = useState(DEFAULT_ROUTES);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('erp_routes');
    if (saved) setRoutes(JSON.parse(saved));
  }, []);

  const isAdmin = ['owner', 'admin', 'principal'].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Bus className="w-6 h-6" /> Transport Management</h1>
          <p className="text-sm text-slate-400">Bus routes and allocations</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAdd(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Route
          </Button>
        )}
      </div>

      {!isAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Bus className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">My Transport: R-01 (City Center Route)</h3>
            <p className="text-sm text-slate-400 mt-1">Vehicle: KA-25-A-1234 • Driver: Suresh (9876543210)</p>
            <p className="text-sm text-slate-400 mt-1">Timing: 08:00 AM (Pickup) / 05:00 PM (Drop)</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {routes.map(r => (
          <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs font-bold">{r.routeNo}</span>
                  <h3 className="text-lg font-bold text-white">{r.name}</h3>
                </div>
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" /> {r.stops}
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex flex-col items-end">
                  <span className="text-slate-500 text-xs">Fee/Month</span>
                  <span className="text-white font-medium">₹{r.fee}</span>
                </div>
                {isAdmin && (
                  <div className="flex flex-col items-end">
                    <span className="text-slate-500 text-xs">Students</span>
                    <span className="text-emerald-400 font-medium">{r.count}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-300">
              <span className="flex items-center gap-2"><Bus className="w-4 h-4 text-slate-500" /> {r.vehicle}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-500" /> Driver: {r.driver}</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-500" /> {r.timing}</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-slate-950 border-slate-800">
          <DialogHeader><DialogTitle className="text-white">Add New Route</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label className="text-slate-300">Route No</Label>
                 <Input className="bg-slate-900 border-slate-800 text-white" />
               </div>
               <div>
                 <Label className="text-slate-300">Route Name</Label>
                 <Input className="bg-slate-900 border-slate-800 text-white" />
               </div>
             </div>
             <div>
               <Label className="text-slate-300">Stops (comma separated)</Label>
               <Input className="bg-slate-900 border-slate-800 text-white" />
             </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-slate-400">Cancel</Button>
            <Button onClick={() => setShowAdd(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Route</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}