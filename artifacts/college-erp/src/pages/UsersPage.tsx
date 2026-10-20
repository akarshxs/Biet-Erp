import { useState } from 'react';
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, Plus, Search, Trash2, Edit, Shield, MoreHorizontal, Download, KeyRound, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { UploadDocumentsDialog } from './DocumentsPage';

export default function UsersPage({ user }: { user: any }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [showUploadDocs, setShowUploadDocs] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');

  // Password Management State
  const [passwordTargetUser, setPasswordTargetUser] = useState<any>(null);
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [confirmStaffPassword, setConfirmStaffPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassText, setShowPassText] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'teacher', department: 'CSE', semester: 1, year: 1,
    phone: '', employeeId: '', rollNumber: '', designation: '', qualification: ''
  });

  const DEPTS = ['CSE', 'ISE', 'AIML', 'AIDS', 'ECE', 'EEE', 'Civil', 'Mechanical'];

  const { data: users = [], isLoading } = useListUsers(
    roleFilter ? { role: roleFilter } : undefined,
    { query: { enabled: true, queryKey: getListUsersQueryKey(roleFilter ? { role: roleFilter } : undefined) } }
  );

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleSave = async () => {
    try {
      if (editUser) {
        await updateUser.mutateAsync({ id: editUser.id, data: form });
        toast({ title: 'User updated successfully' });
        setShowModal(false);
        setEditUser(null);
        setForm({ name: '', email: '', password: '', role: 'student', department: '', semester: 1, phone: '', employeeId: '', rollNumber: '' });
      } else {
        const result = await createUser.mutateAsync({ data: form });
        toast({ title: 'User created successfully' });
        setShowModal(false);
        
        // If student, open upload documents dialog
        if (form.role === 'student' && result.id) {
          setNewStudentId(result.id);
          setShowUploadDocs(true);
        }
        
        setEditUser(null);
        setForm({ name: '', email: '', password: '', role: 'student', department: '', semester: 1, phone: '', employeeId: '', rollNumber: '' });
      }
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await deleteUser.mutateAsync({ id });
      toast({ title: 'User deactivated' });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleOpenPasswordModal = (targetUser: any) => {
    setPasswordTargetUser(targetUser);
    setNewStaffPassword('');
    setConfirmStaffPassword('');
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (!newStaffPassword || newStaffPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters long', variant: 'destructive' });
      return;
    }
    if (newStaffPassword !== confirmStaffPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('erp_token');
      const res = await fetch(`/api/users/${passwordTargetUser.id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ newPassword: newStaffPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      toast({ title: 'Password updated', description: `New login password set for ${passwordTargetUser.name}` });
      setShowPasswordModal(false);
      setPasswordTargetUser(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const filteredUsers = users.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const csv = ['Name,Email,Role,Department,Status'];
      filteredUsers.forEach((u: any) => {
        csv.push(`${u.name},${u.email},${u.role},${u.department || '-'},${u.isActive ? 'Active' : 'Inactive'}`);
      });
      const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users_export.csv';
      a.click();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      <style media="print">
        {`
          @page { size: landscape; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        `}
      </style>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Users</h1>
          <p className="text-sm text-slate-400">Manage students, teachers, and admins.</p>
        </div>
        <div className="flex gap-2">
          {['owner', 'admin', 'administrator'].includes(user.role) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-slate-900 border-slate-700 text-slate-300">
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-slate-800">
                <DropdownMenuItem onClick={() => handleExport('csv')} className="text-slate-300">Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="text-slate-300">Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {['owner', 'admin', 'administrator'].includes(user.role) && (
            <Button onClick={() => { setEditUser(null); setShowModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Add User
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="h-10 px-3 rounded-md bg-slate-900 border border-slate-800 text-white text-sm focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
          <option value="administrator">Administrators</option>
          <option value="hod">HODs</option>
          <option value="principal">Principals</option>
          <option value="parent">Parents</option>
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm print-area">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-slate-800/60 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-medium text-xs">
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider
                      ${u.role === 'owner' ? 'bg-purple-500/10 text-purple-400' :
                        u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400' :
                        u.role === 'administrator' ? 'bg-violet-500/10 text-violet-400' :
                        u.role === 'teacher' ? 'bg-emerald-500/10 text-emerald-400' :
                        u.role === 'hod' ? 'bg-amber-500/10 text-amber-400' :
                        u.role === 'principal' ? 'bg-rose-500/10 text-rose-400' :
                        u.role === 'parent' ? 'bg-cyan-500/10 text-cyan-400' :
                        'bg-slate-800 text-slate-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-400">{u.department || '—'}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-slate-300">{u.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenPasswordModal(u)}
                        title="Manage / Reset Password"
                        className="p-1.5 text-amber-400 hover:text-amber-300 rounded-md hover:bg-slate-800 transition-colors"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 text-slate-500 hover:text-white rounded-md hover:bg-slate-800 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800">
                          <DropdownMenuItem onClick={() => handleOpenPasswordModal(u)} className="text-amber-400 focus:bg-amber-500/10 focus:text-amber-300 cursor-pointer">
                            <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setEditUser(u);
                            setForm({ ...form, ...u, password: '' });
                            setShowModal(true);
                          }} className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer">
                            <Edit className="w-4 h-4 mr-2" /> Edit Profile
                          </DropdownMenuItem>
                          {u.role !== 'owner' && (
                            <DropdownMenuItem onClick={() => handleDelete(u.id)} className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                              <Trash2 className="w-4 h-4 mr-2" /> Deactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit User Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-slate-950 border-slate-800 sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {editUser ? 'Edit User Profile' : 'Add Staff or User'}
            </DialogTitle>
          </DialogHeader>

          {!editUser && (
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
              <Shield className="w-4 h-4 flex-shrink-0 text-indigo-400" />
              <span>Define login credentials for staff/teachers. You can reset their password anytime.</span>
            </div>
          )}

          <div className="grid gap-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Full Name *</Label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Dr. Rajesh Verma"
                className="bg-slate-900 border-slate-800 text-white h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Login Email Address *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="staff@biet.edu or personal@gmail.com"
                className="bg-slate-900 border-slate-800 text-white h-9"
              />
            </div>

            {!editUser ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300 text-xs uppercase tracking-wider">Predefined Initial Password *</Label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, password: form.role === 'student' ? 'Student@123' : 'Teacher@123' })}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Autofill default
                  </button>
                </div>
                <Input
                  type="text"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="e.g. Teacher@123"
                  className="bg-slate-900 border-slate-800 text-white h-9"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs uppercase tracking-wider">
                  Update Password (Optional)
                </Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Leave empty to keep existing password"
                  className="bg-slate-900 border-slate-800 text-white h-9"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Role</Label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full h-9 px-3 rounded-md bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="teacher">Teacher / Faculty</option>
                  <option value="hod">HOD</option>
                  <option value="admin">Admin</option>
                  <option value="administrator">Administrator</option>
                  <option value="principal">Principal</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Department</Label>
                <select
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full h-9 px-3 rounded-md bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">None</option>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {form.role !== 'student' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs uppercase tracking-wider">Designation</Label>
                  <Input
                    value={form.designation}
                    onChange={e => setForm({ ...form, designation: e.target.value })}
                    placeholder="e.g. Assistant Professor"
                    className="bg-slate-900 border-slate-800 text-white h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs uppercase tracking-wider">Qualification</Label>
                  <Input
                    value={form.qualification}
                    onChange={e => setForm({ ...form, qualification: e.target.value })}
                    placeholder="e.g. Ph.D CS, M.Tech"
                    className="bg-slate-900 border-slate-800 text-white h-9"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs uppercase tracking-wider">Roll Number</Label>
                  <Input
                    value={form.rollNumber}
                    onChange={e => setForm({ ...form, rollNumber: e.target.value })}
                    placeholder="e.g. 1BI23CS045"
                    className="bg-slate-900 border-slate-800 text-white h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs uppercase tracking-wider">Year of Study</Label>
                  <select
                    value={form.year}
                    onChange={e => setForm({ ...form, year: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-md bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={1}>1st Year (Sem 1/2)</option>
                    <option value={2}>2nd Year (Sem 3/4)</option>
                    <option value={3}>3rd Year (Sem 5/6)</option>
                    <option value={4}>4th Year (Sem 7/8)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {editUser ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dedicated Password Management Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="bg-slate-950 border-slate-800 sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              Manage Staff / User Password
            </DialogTitle>
          </DialogHeader>

          {passwordTargetUser && (
            <div className="py-2 space-y-4">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{passwordTargetUser.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-indigo-500/20 text-indigo-300">
                    {passwordTargetUser.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{passwordTargetUser.email}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300 text-xs uppercase tracking-wider">New Password *</Label>
                  <button
                    type="button"
                    onClick={() => {
                      const p = passwordTargetUser.role === 'teacher' ? 'Teacher@123' : passwordTargetUser.role === 'student' ? 'Student@123' : 'Admin@123';
                      setNewStaffPassword(p);
                      setConfirmStaffPassword(p);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline"
                  >
                    Set preset default
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassText ? 'text' : 'password'}
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="bg-slate-900 border-slate-800 text-white pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassText(!showPassText)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Confirm New Password *</Label>
                <Input
                  type={showPassText ? 'text' : 'password'}
                  value={confirmStaffPassword}
                  onChange={(e) => setConfirmStaffPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button
              onClick={handleSavePassword}
              disabled={passwordLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
            >
              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UploadDocumentsDialog
        studentId={newStudentId}
        open={showUploadDocs}
        onOpenChange={setShowUploadDocs}
      />
    </div>
  );
}
