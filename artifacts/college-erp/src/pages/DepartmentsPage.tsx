import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListDepartmentsQueryKey,
  useCreateDepartment,
  useDeleteDepartment,
  useListDepartments,
  useUpdateDepartment,
} from '@workspace/api-client-react';
import { Building2, Edit3, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const emptyForm = { name: '', code: '', head: '' };

export default function DepartmentsPage({ user }: { user: any }) {
  const queryClient = useQueryClient();
  const { data: departments = [], isLoading, isError } = useListDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const canManage = ['owner', 'admin', 'administrator'].includes(user.role);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const visibleDepartments = departments.filter((department: any) =>
    `${department.name} ${department.code} ${department.head ?? ''}`.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFeedback(null);
    setDialogOpen(true);
  };

  const openEdit = (department: any) => {
    setEditing(department);
    setForm({ name: department.name ?? '', code: department.code ?? '', head: department.head ?? department.hodName ?? '' });
    setFeedback(null);
    setDialogOpen(true);
  };

  const submit = () => {
    if (!form.name.trim() || !form.code.trim()) {
      setFeedback({ type: 'error', text: 'Name and code are required.' });
      return;
    }
    const data = { name: form.name.trim(), code: form.code.trim().toUpperCase(), head: form.head.trim() || null };
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
      setDialogOpen(false);
      setFeedback({ type: 'success', text: editing ? 'Department updated.' : 'Department added.' });
    };
    const onError = () => setFeedback({ type: 'error', text: 'Could not save department. Try again.' });
    if (editing) updateDepartment.mutate({ id: editing.id, data }, { onSuccess, onError });
    else createDepartment.mutate({ data }, { onSuccess, onError });
  };

  const remove = (department: any) => {
    if (!window.confirm(`Delete ${department.name}? This action cannot be undone.`)) return;
    deleteDepartment.mutate({ id: department.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
        setFeedback({ type: 'success', text: `${department.name} deleted.` });
      },
      onError: () => setFeedback({ type: 'error', text: 'Could not delete department.' }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="erp-mono text-[10px] uppercase tracking-[0.18em] text-indigo-400">Academic structure</p>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Departments</h2>
          <p className="text-sm text-slate-400 mt-1">Keep ownership, staffing and student capacity in one place.</p>
        </div>
        {canManage && <Button data-testid="button-add-department" onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"><Plus className="w-4 h-4 mr-2" /> Add department</Button>}
      </div>

      {feedback && <div data-testid={`status-department-${feedback.type}`} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${feedback.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 'border-red-500/20 bg-red-500/10 text-red-500'}`}><span>{feedback.text}</span><button data-testid="button-dismiss-department-feedback" onClick={() => setFeedback(null)}><X className="w-4 h-4" /></button></div>}

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><Input data-testid="input-search-departments" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search departments" className="pl-9 bg-slate-900 border-slate-800" /></div>
        <span className="erp-mono text-xs text-slate-500">{visibleDepartments.length.toString().padStart(2, '0')} records</span>
      </div>

      <div className="bg-slate-900 border border-slate-800/60 rounded-xl overflow-hidden erp-panel">
        {isLoading ? <div className="p-6 space-y-3"><div className="h-10 bg-slate-800 rounded animate-pulse" /><div className="h-10 bg-slate-800 rounded animate-pulse" /><div className="h-10 bg-slate-800 rounded animate-pulse" /></div> :
          isError ? <div className="p-12 text-center text-sm text-red-400">Department records could not be loaded.</div> :
            <div className="overflow-x-auto"><table className="w-full text-sm text-left min-w-[700px]"><thead className="bg-slate-950/50 text-[10px] uppercase tracking-[0.14em] text-slate-500 border-b border-slate-800/60"><tr><th className="px-5 py-3">Department</th><th className="px-5 py-3">Code</th><th className="px-5 py-3">Head</th><th className="px-5 py-3">Students</th>{canManage && <th className="px-5 py-3 text-right">Actions</th>}</tr></thead><tbody className="divide-y divide-slate-800/60">
              {visibleDepartments.map((department: any) => <tr key={department.id} data-testid={`row-department-${department.id}`} className="hover:bg-slate-800/30 transition-colors"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Building2 className="w-4 h-4" /></span><div><p className="font-semibold text-white">{department.name}</p><p className="text-xs text-slate-500">Created {new Date(department.createdAt).toLocaleDateString()}</p></div></div></td><td className="px-5 py-4"><span className="erp-mono text-xs text-indigo-400 bg-indigo-500/10 rounded px-2 py-1">{department.code}</span></td><td className="px-5 py-4 text-slate-300">{department.head ?? department.hodName ?? 'Unassigned'}</td><td className="px-5 py-4 text-slate-300"><span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-500" />{department.studentCount ?? '—'}</span></td>{canManage && <td className="px-5 py-4"><div className="flex justify-end gap-1"><button data-testid={`button-edit-department-${department.id}`} onClick={() => openEdit(department)} className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md" aria-label={`Edit ${department.name}`}><Edit3 className="w-4 h-4" /></button><button data-testid={`button-delete-department-${department.id}`} onClick={() => remove(department)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md" aria-label={`Delete ${department.name}`}><Trash2 className="w-4 h-4" /></button></div></td>}</tr>)}
              {!visibleDepartments.length && <tr><td colSpan={canManage ? 5 : 4} className="px-5 py-16 text-center text-slate-500">No departments match this search.</td></tr>}
            </tbody></table></div>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="bg-slate-950 border-slate-800"><DialogHeader><DialogTitle className="text-white">{editing ? 'Edit department' : 'Add department'}</DialogTitle></DialogHeader><div className="space-y-4 py-3"><div><Label htmlFor="department-name" className="text-slate-300">Department name</Label><Input id="department-name" data-testid="input-department-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 bg-slate-900 border-slate-800" placeholder="Computer Science & Engineering" /></div><div><Label htmlFor="department-code" className="text-slate-300">Short code</Label><Input id="department-code" data-testid="input-department-code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="mt-1.5 bg-slate-900 border-slate-800 erp-mono" placeholder="CSE" /></div><div><Label htmlFor="department-head" className="text-slate-300">Department head</Label><Input id="department-head" data-testid="input-department-head" value={form.head} onChange={(event) => setForm({ ...form, head: event.target.value })} className="mt-1.5 bg-slate-900 border-slate-800" placeholder="Faculty name or employee ID" /></div></div><DialogFooter><Button data-testid="button-cancel-department" variant="ghost" onClick={() => setDialogOpen(false)} className="text-slate-400">Cancel</Button><Button data-testid="button-save-department" onClick={submit} disabled={createDepartment.isPending || updateDepartment.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">{editing ? 'Save changes' : 'Add department'}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}