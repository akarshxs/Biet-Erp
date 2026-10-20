import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Shield, BookOpen, Calendar, Camera } from 'lucide-react';

export default function ProfilePage({ user, onUpdate }: { user: any; onUpdate: (user: any) => void; onBack?: () => void; }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSave = () => {
    // mock save
    setEditing(false);
    onUpdate({ ...user, ...form });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Profile Settings</h1>
        <p className="text-sm text-slate-400">Manage your personal information.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
        
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 relative z-10 mb-8">
            <div className="w-24 h-24 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-3xl font-bold text-white shadow-xl relative group cursor-pointer overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left pb-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h2>
              <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                  <Shield className="w-3 h-3" /> {user?.role}
                </span>
                {user?.department && user?.role !== 'owner' && (
                  <span className="text-sm text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-4 h-4" /> {user.department}
                  </span>
                )}
              </div>
            </div>

            <Button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className={editing ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"}
            >
              {editing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">Personal Information</h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Full Name</Label>
                  {editing ? (
                    <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                  ) : (
                    <div className="text-sm text-white font-medium flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                      <User className="w-4 h-4 text-slate-500" /> {user?.name}
                    </div>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Email Address</Label>
                  <div className="text-sm text-slate-300 flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50 opacity-70">
                    <Mail className="w-4 h-4 text-slate-500" /> {user?.email} (Cannot be changed)
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Phone Number</Label>
                  {editing ? (
                    <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                  ) : (
                    <div className="text-sm text-white font-medium flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                      <Phone className="w-4 h-4 text-slate-500" /> {user?.phone || 'Not provided'}
                    </div>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Location</Label>
                  {editing ? (
                    <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                  ) : (
                    <div className="text-sm text-white font-medium flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                      <MapPin className="w-4 h-4 text-slate-500" /> {user?.address || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Academic/System Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">Academic Details</h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                   {user?.role !== 'owner' && (
                     <>
                       <Label className="text-xs text-slate-500">Department</Label>
                       <div className="text-sm text-white font-medium flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                         <BookOpen className="w-4 h-4 text-slate-500" /> {user?.department || 'Not Assigned'}
                       </div>
                     </>
                   )}
                </div>

                {user?.role === 'student' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Current Semester</Label>
                    <div className="text-sm text-white font-medium flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                      <Calendar className="w-4 h-4 text-slate-500" /> Semester {user?.semester || '—'}
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Account Created</Label>
                  <div className="text-sm text-slate-300 flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50 opacity-70">
                    <Calendar className="w-4 h-4 text-slate-500" /> 
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
