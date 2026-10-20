import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { recordModules, type RecordField } from '@/lib/recordModules';
import {
  getListRecordsQueryKey,
  type ManagedRecordInput,
  useCreateRecord,
  useDeleteRecord,
  useListRecords,
  useUpdateRecord,
} from '@workspace/api-client-react';

type RecordRow = Record<string, unknown> & { id: string };
type Props = { section: string; user: { id: string; role: string } };

function displayValue(value: unknown, key: string) {
  if (value === null || value === undefined || value === '') return '—';
  if (key === 'read' && typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return Array.isArray(value) ? `${value.length} items` : JSON.stringify(value);
  return String(value);
}

function getInputValue(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function toPayload(form: Record<string, string>, fields: RecordField[], editing: boolean) {
  return Object.fromEntries(fields.map(({ key, kind }) => {
    const value = form[key] ?? '';
    if (kind === 'number') return [key, value === '' ? (editing ? null : undefined) : Number(value)];
    if (key === 'read') return [key, value === 'true'];
    return [key, value.trim() === '' ? (editing ? null : undefined) : value.trim()];
  }).filter(([, value]) => value !== undefined));
}

function RecordFormField({ field, value, onChange }: { field: RecordField; value: string; onChange: (value: string) => void }) {
  const inputClass = 'mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15';
  return (
    <label className={`block text-xs font-semibold text-slate-400 ${field.kind === 'textarea' ? 'sm:col-span-2' : ''}`}>
      {field.label}{field.required ? <span className="ml-1 text-rose-400">*</span> : null}
      {field.kind === 'textarea' ? (
        <Textarea required={field.required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 min-h-24 border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500/30" />
      ) : field.kind === 'select' ? (
        <select required={field.required} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
          <option value="">Select {field.label.toLowerCase()}</option>
          {(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <Input
          required={field.required}
          type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : field.kind === 'email' ? 'email' : 'text'}
          min={field.kind === 'number' ? '0' : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </label>
  );
}

export default function RecordManager({ section, user }: Props) {
  const module = recordModules[section];
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecordRow | null>(null);
  const [deleting, setDeleting] = useState<RecordRow | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const canEdit = user.role === 'owner' || user.role === 'admin' || user.role === 'administrator' || user.role === 'teacher' || user.role === 'hod' || user.role === 'principal';
  const canManage = canEdit && (!module?.adminOnly || ['owner', 'admin', 'administrator', 'principal'].includes(user.role));
  const queryKey = module ? getListRecordsQueryKey(module.resource) : [];
  const query = useListRecords(module?.resource ?? '', { query: { queryKey, enabled: Boolean(module), staleTime: 0 } });
  const createMutation = useCreateRecord();
  const updateMutation = useUpdateRecord();
  const deleteMutation = useDeleteRecord();
  const rows = (query.data ?? []) as RecordRow[];
  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => Object.entries(row).some(([key, value]) => key !== 'id' && displayValue(value, key).toLowerCase().includes(term)));
  }, [rows, search]);
  const columns = module.fields.slice(0, 5);

  if (!module) return null;

  const openCreate = () => {
    setEditing(null);
    setForm(Object.fromEntries(module.fields.map(({ key }) => [key, ''])));
    setFeedback('');
    setFormOpen(true);
  };
  const openEdit = (row: RecordRow) => {
    setEditing(row);
    setForm(Object.fromEntries(module.fields.map(({ key }) => [key, getInputValue(row[key])])));
    setFeedback('');
    setFormOpen(true);
  };
  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('');
    const data = toPayload(form, module.fields, Boolean(editing)) as ManagedRecordInput;
    const onSuccess = async () => {
      await queryClient.invalidateQueries({ queryKey });
      setFormOpen(false);
      setEditing(null);
      setFeedback(`${module.singular} saved.`);
    };
    const onError = (error: Error) => setFeedback(error.message);
    if (editing) {
      updateMutation.mutate({ resource: module.resource, id: editing.id, data }, { onSuccess, onError });
    } else {
      createMutation.mutate({ resource: module.resource, data }, { onSuccess, onError });
    }
  };
  const savePending = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="erp-mono mb-2 text-[10px] uppercase tracking-[0.18em] text-cyan-500">Record management</p>
          <h2 className="text-2xl font-semibold tracking-tight text-white">{module.title}</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-400">{module.description}</p>
        </div>
        {canManage && <Button data-testid={`button-add-${module.resource}`} onClick={openCreate} className="h-10 shrink-0 bg-cyan-500 text-slate-950 hover:bg-cyan-400"><Plus className="h-4 w-4" /> Add {module.singular}</Button>}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/80">
        <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{rows.length} records</p>
            <p className="mt-0.5 text-xs text-slate-500">Changes are saved to the ERP record store.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input aria-label={`Search ${module.title}`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${module.title.toLowerCase()}...`} className="h-9 border-slate-700 bg-slate-950 pl-9 text-sm text-slate-100 placeholder:text-slate-600" />
          </div>
        </div>
        {query.isLoading ? (
          <div className="space-y-3 p-5"><div className="h-9 animate-pulse rounded bg-slate-800" /><div className="h-9 animate-pulse rounded bg-slate-800" /><div className="h-9 animate-pulse rounded bg-slate-800" /></div>
        ) : query.isError ? (
          <div className="p-8 text-center"><AlertTriangle className="mx-auto mb-2 h-6 w-6 text-amber-400" /><p className="text-sm text-slate-300">Could not load {module.title.toLowerCase()}.</p><p className="mt-1 text-xs text-slate-500">{(query.error as Error).message}</p><Button variant="outline" size="sm" onClick={() => query.refetch()} className="mt-4 border-slate-700 text-slate-300">Try again</Button></div>
        ) : visibleRows.length === 0 ? (
          <div className="p-10 text-center"><div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-cyan-400"><Plus className="h-5 w-5" /></div><p className="text-sm font-medium text-slate-200">{search ? 'No matching records' : `No ${module.title.toLowerCase()} yet`}</p><p className="mt-1 text-xs text-slate-500">{search ? 'Try a different search term.' : canManage ? `Add the first ${module.singular} to get started.` : 'Records will appear here when added by an administrator.'}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead><tr className="bg-slate-950/60">{columns.map((column) => <th key={column.key} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{column.label}</th>)}<th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Actions</th></tr></thead>
              <tbody>{visibleRows.map((row) => (
                <tr key={row.id} data-testid={`record-row-${row.id}`} className="border-t border-slate-800/70 transition-colors hover:bg-slate-800/35">
                  {columns.map((column) => <td key={column.key} className="max-w-[260px] truncate px-4 py-3 text-sm text-slate-300" title={displayValue(row[column.key], column.key)}>{displayValue(row[column.key], column.key)}</td>)}
                  <td className="px-4 py-3"><div className="flex justify-end gap-1">{canManage && <><button data-testid={`button-edit-${row.id}`} onClick={() => openEdit(row)} aria-label={`Edit ${module.singular}`} className="rounded-md p-2 text-slate-400 transition hover:bg-cyan-500/10 hover:text-cyan-300"><Edit3 className="h-4 w-4" /></button><button data-testid={`button-delete-${row.id}`} onClick={() => { setDeleting(row); setFeedback(''); }} aria-label={`Delete ${module.singular}`} className="rounded-md p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button></>}</div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {feedback && <div role="status" className={`border-t border-slate-800 px-4 py-2.5 text-xs ${feedback.includes('Could not') || feedback.includes('failed') || feedback.includes('permission') ? 'text-rose-300' : 'text-emerald-300'}`}>{feedback}</div>}
      </div>

      {formOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
        <form onSubmit={save} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4"><div><p className="text-[10px] uppercase tracking-[0.16em] text-cyan-400">{editing ? 'Edit record' : 'New record'}</p><h3 className="mt-1 text-lg font-semibold text-white">{editing ? `Edit ${module.singular}` : `Add ${module.singular}`}</h3></div><button type="button" onClick={() => setFormOpen(false)} aria-label="Close form" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-4 w-4" /></button></div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">{module.fields.map((formField) => <RecordFormField key={formField.key} field={formField} value={form[formField.key] ?? ''} onChange={(value) => setForm((current) => ({ ...current, [formField.key]: value }))} />)}</div>
          <div className="flex justify-end gap-2 border-t border-slate-800 px-5 py-4"><Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="border-slate-700 text-slate-300">Cancel</Button><Button type="submit" disabled={savePending} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">{savePending ? 'Saving…' : editing ? 'Save changes' : `Add ${module.singular}`}</Button></div>
        </form>
      </div>}

      {deleting && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleting(null); }}>
        <div role="alertdialog" aria-modal="true" aria-labelledby="delete-record-title" className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400"><Trash2 className="h-5 w-5" /></div>
          <h3 id="delete-record-title" className="text-lg font-semibold text-white">Delete this {module.singular}?</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">This removes the record from the ERP. This action cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setDeleting(null)} className="border-slate-700 text-slate-300">Keep record</Button><Button onClick={() => deleteMutation.mutate({ resource: module.resource, id: deleting.id }, { onSuccess: async () => { await queryClient.invalidateQueries({ queryKey }); setDeleting(null); setFeedback(`${module.singular} deleted.`); }, onError: (error) => setFeedback(error.message) })} disabled={deleteMutation.isPending} className="bg-rose-600 text-white hover:bg-rose-500">{deleteMutation.isPending ? 'Deleting…' : 'Delete record'}</Button></div>
        </div>
      </div>}
    </section>
  );
}
