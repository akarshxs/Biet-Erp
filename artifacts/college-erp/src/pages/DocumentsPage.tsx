import { useState, useEffect } from 'react';
import { FileCheck, Upload, CheckCircle, Clock, Eye, X, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useListUsers, getListUsersQueryKey } from '@workspace/api-client-react';

const REQUIRED_DOCUMENTS = [
  { id: 'marks_10', name: '10th Marks Card (Original scan)' },
  { id: 'marks_12', name: '12th / PUC Marks Card' },
  { id: 'cet_rank', name: 'CET / COMEDK Rank Card' },
  { id: 'tc', name: 'Transfer Certificate (TC)' },
  { id: 'migration', name: 'Migration Certificate' },
  { id: 'caste', name: 'Caste Certificate (SC/ST/OBC)' },
  { id: 'income', name: 'Income Certificate' },
  { id: 'domicile', name: 'Domicile / Residency Certificate' },
  { id: 'aadhar', name: 'Aadhar Card' },
  { id: 'photo', name: 'Passport Size Photograph (minimum 2)' },
  { id: 'parent_id', name: 'Parent/Guardian ID Proof' },
  { id: 'bank', name: 'Bank Account Passbook (first page)' },
  { id: 'medical', name: 'Medical Fitness Certificate' },
  { id: 'anti_ragging', name: 'Anti-Ragging Undertaking' },
  { id: 'gap', name: 'Gap Certificate (if applicable)' },
];

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB per file (localStorage safety)

interface Document {
  studentId: string;
  docType: string;
  fileName: string;
  fileType: string;   // MIME type, e.g. "image/jpeg" or "application/pdf"
  fileData: string;   // base64 data URL for view/download
  status: 'pending' | 'uploaded' | 'verified';
  uploadedAt: string;
}

/** Reads a File into a base64 data URL */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Small file-type icon */
function FileIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  if (mimeType.startsWith('image/')) return <ImageIcon className={className} />;
  return <FileText className={className} />;
}

// ─── View / Download Dialog ───────────────────────────────────────────────────

function ViewDocDialog({ doc, onClose }: { doc: Document | null; onClose: () => void }) {
  if (!doc) return null;

  const isImage = doc.fileType.startsWith('image/');
  const isPdf   = doc.fileType === 'application/pdf';
  const docName = REQUIRED_DOCUMENTS.find(d => d.id === doc.docType)?.name ?? doc.docType;

  const handleDownload = () => {
    const a = window.document.createElement('a');
    a.href = doc.fileData;
    a.download = doc.fileName;
    a.click();
  };

  return (
    <Dialog open={!!doc} onOpenChange={onClose}>
      <DialogContent className="bg-slate-950 border-slate-800 sm:max-w-[700px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{docName}</h2>
            <p className="text-sm text-slate-400 truncate mt-0.5">{doc.fileName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white ml-4 mt-0.5 flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto bg-slate-900 min-h-0">
          {isImage && (
            <div className="flex items-center justify-center p-4 min-h-[300px]">
              <img
                src={doc.fileData}
                alt={doc.fileName}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          )}

          {isPdf && (
            <iframe
              src={doc.fileData}
              title={doc.fileName}
              className="w-full"
              style={{ height: '60vh', border: 'none' }}
            />
          )}

          {!isImage && !isPdf && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <FileText className="w-16 h-16 text-slate-600" />
              <p className="text-slate-400 text-sm">Preview not available for this file type.</p>
              <Button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Download className="w-4 h-4 mr-2" /> Download to view
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <div className="text-xs text-slate-500">
            Uploaded {new Date(doc.uploadedAt).toLocaleString()} ·{' '}
            <span className={`capitalize font-medium ${doc.status === 'verified' ? 'text-emerald-400' : 'text-blue-400'}`}>
              {doc.status}
            </span>
          </div>
          <Button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DocumentsPage({ user }: { user: any }) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>(user.role === 'student' ? user.id : '');
  const [viewDoc, setViewDoc] = useState<Document | null>(null);

  const { data: users = [] } = useListUsers(
    user.role !== 'student' ? { role: 'student' } : undefined,
    { query: { enabled: user.role !== 'student', queryKey: getListUsersQueryKey({ role: 'student' }) } }
  );

  useEffect(() => {
    const stored = localStorage.getItem('erp_documents');
    if (stored) setDocuments(JSON.parse(stored));
  }, []);

  const saveDocuments = (docs: Document[]) => {
    localStorage.setItem('erp_documents', JSON.stringify(docs));
    setDocuments(docs);
  };

  /** Programmatic upload: reads file as base64, stores in localStorage */
  const triggerUpload = (docType: string) => {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_BYTES) {
        toast({ title: 'File too large', description: 'Please upload a file smaller than 4 MB.', variant: 'destructive' });
        return;
      }

      try {
        const fileData = await readFileAsDataURL(file);
        const newDoc: Document = {
          studentId: selectedStudent || user.id,
          docType,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileData,
          status: 'uploaded',
          uploadedAt: new Date().toISOString(),
        };
        setDocuments(prev => {
          const updated = prev.filter(d => !(d.studentId === newDoc.studentId && d.docType === docType));
          updated.push(newDoc);
          localStorage.setItem('erp_documents', JSON.stringify(updated));
          return updated;
        });
        toast({ title: `"${file.name}" uploaded successfully` });
      } catch {
        toast({ title: 'Upload failed', description: 'Could not read the file.', variant: 'destructive' });
      }
    };
    input.click();
  };

  const handleVerify = (doc: Document) => {
    const updated = documents.map(d =>
      d.studentId === doc.studentId && d.docType === doc.docType
        ? { ...d, status: 'verified' as const }
        : d
    );
    saveDocuments(updated);
    toast({ title: 'Document verified' });
  };

  const handleDelete = (doc: Document) => {
    if (!confirm('Remove this document?')) return;
    const updated = documents.filter(d => !(d.studentId === doc.studentId && d.docType === doc.docType));
    saveDocuments(updated);
    toast({ title: 'Document removed' });
  };

  const handleDownload = (doc: Document) => {
    const a = window.document.createElement('a');
    a.href = doc.fileData;
    a.download = doc.fileName;
    a.click();
  };

  const studentDocs  = documents.filter(d => d.studentId === (selectedStudent || user.id));
  const uploadedCount = studentDocs.filter(d => d.status === 'uploaded' || d.status === 'verified').length;
  const verifiedCount = studentDocs.filter(d => d.status === 'verified').length;
  const progress      = (uploadedCount / REQUIRED_DOCUMENTS.length) * 100;

  const getDocStatus = (docType: string) => studentDocs.find(d => d.docType === docType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Document Management</h1>
        <p className="text-sm text-slate-400">Upload and verify admission documents.</p>
      </div>

      {user.role !== 'student' && (
        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Student</label>
          <select
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            className="w-full max-w-md h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-white text-sm focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">-- Select a student --</option>
            {users.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
      )}

      {(selectedStudent || user.role === 'student') && (
        <>
          {/* Progress card */}
          <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Upload Progress</h3>
                <p className="text-sm text-slate-400">
                  {uploadedCount} / {REQUIRED_DOCUMENTS.length} documents uploaded
                  {user.role !== 'student' && ` · ${verifiedCount} verified`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800/60 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-slate-800/60">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Document</th>
                    <th className="px-6 py-4 font-semibold">File</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Uploaded</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {REQUIRED_DOCUMENTS.map(doc => {
                    const status = getDocStatus(doc.id);
                    return (
                      <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <FileCheck className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <span className="text-white font-medium">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {status ? (
                            <div className="flex items-center gap-1.5">
                              <FileIcon mimeType={status.fileType} className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                              <span className="truncate max-w-[180px]" title={status.fileName}>{status.fileName}</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          {!status && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                          {status?.status === 'uploaded' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400">
                              <Upload className="w-3 h-3" /> Uploaded
                            </span>
                          )}
                          {status?.status === 'verified' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {status?.uploadedAt ? new Date(status.uploadedAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Upload / Replace */}
                            {!status && (
                              <Button size="sm" onClick={() => triggerUpload(doc.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-xs px-2.5">
                                <Upload className="w-3 h-3 mr-1" /> Upload
                              </Button>
                            )}
                            {status && status.status !== 'verified' && (
                              <Button size="sm" variant="ghost" onClick={() => triggerUpload(doc.id)}
                                className="text-slate-400 hover:text-white hover:bg-slate-700 h-7 text-xs px-2.5">
                                <Upload className="w-3 h-3 mr-1" /> Replace
                              </Button>
                            )}

                            {/* Verify (admins only) */}
                            {status && status.status !== 'verified' && user.role !== 'student' && (
                              <Button size="sm" onClick={() => handleVerify(status)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs px-2.5">
                                <CheckCircle className="w-3 h-3 mr-1" /> Verify
                              </Button>
                            )}

                            {/* View */}
                            {status && (
                              <Button size="sm" variant="ghost" onClick={() => setViewDoc(status)}
                                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-7 text-xs px-2.5">
                                <Eye className="w-3 h-3 mr-1" /> View
                              </Button>
                            )}

                            {/* Download */}
                            {status && (
                              <Button size="sm" variant="ghost" onClick={() => handleDownload(status)}
                                className="text-slate-400 hover:text-white hover:bg-slate-700 h-7 text-xs px-2.5">
                                <Download className="w-3 h-3 mr-1" /> Download
                              </Button>
                            )}

                            {/* Remove */}
                            {status && (
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(status)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 text-xs px-2.5">
                                <X className="w-3 h-3 mr-1" /> Remove
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!selectedStudent && user.role !== 'student' && (
        <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-12 text-center">
          <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Student Selected</h3>
          <p className="text-sm text-slate-500">Select a student from the dropdown above to view their documents.</p>
        </div>
      )}

      <ViewDocDialog doc={viewDoc} onClose={() => setViewDoc(null)} />
    </div>
  );
}

// ─── Upload Dialog (used from UsersPage after creating a new student) ─────────

export function UploadDocumentsDialog({
  studentId, open, onOpenChange,
}: {
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewDoc, setViewDoc] = useState<Document | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('erp_documents');
    if (stored) setDocuments(JSON.parse(stored));
  }, [open]);

  const triggerUpload = (docType: string) => {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_BYTES) {
        toast({ title: 'File too large', description: 'Please upload a file smaller than 4 MB.', variant: 'destructive' });
        return;
      }

      try {
        const fileData = await readFileAsDataURL(file);
        const newDoc: Document = {
          studentId,
          docType,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileData,
          status: 'uploaded',
          uploadedAt: new Date().toISOString(),
        };
        setDocuments(prev => {
          const updated = prev.filter(d => !(d.studentId === studentId && d.docType === docType));
          updated.push(newDoc);
          localStorage.setItem('erp_documents', JSON.stringify(updated));
          return updated;
        });
        toast({ title: `"${file.name}" uploaded` });
      } catch {
        toast({ title: 'Upload failed', variant: 'destructive' });
      }
    };
    input.click();
  };

  const handleDownload = (doc: Document) => {
    const a = window.document.createElement('a');
    a.href = doc.fileData;
    a.download = doc.fileName;
    a.click();
  };

  const studentDocs  = documents.filter(d => d.studentId === studentId);
  const uploadedCount = studentDocs.filter(d => d.status === 'uploaded' || d.status === 'verified').length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-950 border-slate-800 sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Upload Student Documents</DialogTitle>
            <p className="text-sm text-slate-400 mt-1">Upload required admission documents. Max 4 MB per file.</p>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Progress */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Upload Progress</span>
                <span className="text-sm font-medium text-white">{uploadedCount} / {REQUIRED_DOCUMENTS.length}</span>
              </div>
              <Progress value={(uploadedCount / REQUIRED_DOCUMENTS.length) * 100} className="h-2" />
            </div>

            {/* Document list */}
            <div className="space-y-2">
              {REQUIRED_DOCUMENTS.map(doc => {
                const status = studentDocs.find(d => d.docType === doc.id);
                return (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {status ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">{doc.name}</p>
                        {status && (
                          <p className="text-xs text-emerald-500 truncate">{status.fileName}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* View */}
                      {status && (
                        <Button size="sm" variant="ghost" onClick={() => setViewDoc(status)}
                          className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-7 text-xs px-2">
                          <Eye className="w-3 h-3 mr-1" /> View
                        </Button>
                      )}
                      {/* Download */}
                      {status && (
                        <Button size="sm" variant="ghost" onClick={() => handleDownload(status)}
                          className="text-slate-400 hover:text-white hover:bg-slate-700 h-7 text-xs px-2">
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                      {/* Upload / Replace */}
                      <Button
                        size="sm"
                        onClick={() => triggerUpload(doc.id)}
                        variant={status ? 'ghost' : 'default'}
                        className={status
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800 h-7 text-xs px-2'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-xs px-2.5'}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        {status ? 'Replace' : 'Upload'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white">
              Skip for now
            </Button>
            <Button onClick={() => onOpenChange(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nested view dialog */}
      <ViewDocDialog doc={viewDoc} onClose={() => setViewDoc(null)} />
    </>
  );
}
