import { useState, useEffect } from 'react';
import { Home, BedDouble, Users, Plus, Trash2, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_ROOMS = [
  { id: '1', roomNo: 'A-101', block: 'A', hostel: 'Boys', type: 'Double', capacity: 2, occupied: 2 },
  { id: '2', roomNo: 'A-102', block: 'A', hostel: 'Boys', type: 'Single', capacity: 1, occupied: 0 },
  { id: '3', roomNo: 'B-201', block: 'B', hostel: 'Girls', type: 'Triple', capacity: 3, occupied: 1 },
];

export default function HostelPage({ user }: { user: any }) {
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [tab, setTab] = useState('All Rooms');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAlloc, setShowAlloc] = useState(false);

  useEffect(() => {
    const savedRooms = localStorage.getItem('erp_hostel_rooms');
    const savedAlloc = localStorage.getItem('erp_hostel_alloc');
    if (savedRooms) setRooms(JSON.parse(savedRooms));
    if (savedAlloc) setAllocations(JSON.parse(savedAlloc));
  }, []);

  const saveRooms = (newRooms: any) => {
    setRooms(newRooms);
    localStorage.setItem('erp_hostel_rooms', JSON.stringify(newRooms));
  };
  const saveAlloc = (newAlloc: any) => {
    setAllocations(newAlloc);
    localStorage.setItem('erp_hostel_alloc', JSON.stringify(newAlloc));
  };

  const isAdmin = ['owner', 'admin', 'principal'].includes(user.role);
  const isStudent = user.role === 'student' || user.role === 'parent';

  if (isStudent) {
    const myAlloc = allocations.find(a => a.studentId === user.id) || {
      roomNo: 'A-101', block: 'A', hostel: 'Boys', date: '2023-08-15', roommates: 'Rahul S, Aman K'
    }; // Mock if not allocated

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Bed className="w-6 h-6" /> My Hostel Details</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Room Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Room No:</span>
                <span className="text-white font-medium">{myAlloc.roomNo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Block:</span>
                <span className="text-white font-medium">{myAlloc.block}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Hostel:</span>
                <span className="text-white font-medium">{myAlloc.hostel}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Joining Date:</span>
                <span className="text-white font-medium">{myAlloc.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Roommates:</span>
                <span className="text-white font-medium">{myAlloc.roommates}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Warden Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Mr. Ramesh Kumar</p>
                  <p className="text-xs text-slate-400">Boys Hostel Chief Warden</p>
                </div>
                <div className="ml-auto text-xs text-indigo-400 font-medium">+91 98765 43210</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredRooms = rooms.filter(r => tab === 'All Rooms' || r.hostel === tab.split(' ')[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Bed className="w-6 h-6" /> Hostel Management</h1>
          <p className="text-sm text-slate-400">Manage rooms and allocations</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => setShowAddRoom(true)} className="bg-slate-800 hover:bg-slate-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Room
            </Button>
            <Button onClick={() => setShowAlloc(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Users className="w-4 h-4 mr-2" /> Allocate
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-400">Total Rooms</p>
          <p className="text-2xl font-bold text-white mt-1">{rooms.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-400">Total Capacity</p>
          <p className="text-2xl font-bold text-white mt-1">{rooms.reduce((acc, r) => acc + r.capacity, 0)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-400">Occupied</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{rooms.reduce((acc, r) => acc + r.occupied, 0)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-400">Available</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{rooms.reduce((acc, r) => acc + (r.capacity - r.occupied), 0)}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-800">
          {['All Rooms', 'Boys Hostel', 'Girls Hostel'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium ${tab === t ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-950/50 text-slate-400">
              <tr>
                <th className="px-6 py-3">Room No</th>
                <th className="px-6 py-3">Block & Hostel</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Occupancy</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRooms.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-3 text-white font-medium">{r.roomNo}</td>
                  <td className="px-6 py-3 text-slate-400">Block {r.block} • {r.hostel}</td>
                  <td className="px-6 py-3 text-slate-400">{r.type}</td>
                  <td className="px-6 py-3 text-white">{r.occupied} / {r.capacity}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.occupied === r.capacity ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {r.occupied === r.capacity ? 'Full' : 'Available'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
        <DialogContent className="bg-slate-950 border-slate-800">
          <DialogHeader><DialogTitle className="text-white">Add New Room</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label className="text-slate-300">Room No</Label>
                 <Input className="bg-slate-900 border-slate-800 text-white" />
               </div>
               <div>
                 <Label className="text-slate-300">Block</Label>
                 <select className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-800 text-white"><option>A</option><option>B</option><option>C</option></select>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label className="text-slate-300">Hostel</Label>
                 <select className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-800 text-white"><option>Boys</option><option>Girls</option></select>
               </div>
               <div>
                 <Label className="text-slate-300">Capacity</Label>
                 <Input type="number" defaultValue="2" className="bg-slate-900 border-slate-800 text-white" />
               </div>
             </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddRoom(false)} className="text-slate-400">Cancel</Button>
            <Button onClick={() => setShowAddRoom(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}