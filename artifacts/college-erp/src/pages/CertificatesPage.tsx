import { useState } from 'react';
import { BadgeCheck, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const CERTS = [
  { id: 1, name: 'Bonafide Certificate', desc: 'Certifies current enrollment' },
  { id: 2, name: 'Character Certificate', desc: 'Certifies good standing' },
  { id: 3, name: 'Transfer Certificate (TC)', desc: 'Required when leaving college' },
  { id: 4, name: 'Study Certificate', desc: 'For visa or scholarship purposes' },
];

export default function CertificatesPage({ user }: { user: any }) {
  const [requests, setRequests] = useState([
    { id: 1, cert: 'Bonafide Certificate', status: 'Ready', date: '2023-11-20' },
  ]);
  const [showReq, setShowReq] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BadgeCheck className="w-6 h-6" /> Certificates</h1>
          <p className="text-sm text-slate-400">Request official college documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Available Certificates</h2>
          <div className="space-y-4">
            {CERTS.map(c => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{c.name}</h3>
                  <p className="text-xs text-slate-500">{c.desc}</p>
                </div>
                <Button size="sm" onClick={() => setShowReq(true)} className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30">Request</Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-4">My Requests</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                <tr><th className="px-4 py-3">Certificate</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {requests.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-slate-300">{r.cert}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'Ready' && (
                        <Button size="sm" variant="ghost" onClick={() => setShowPreview(true)} className="h-8 px-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={showReq} onOpenChange={setShowReq}>
        <DialogContent className="bg-slate-950 border-slate-800">
          <DialogHeader><DialogTitle className="text-white">Request Certificate</DialogTitle></DialogHeader>
          <div className="py-4 text-slate-300 text-sm">
            <p>Your request will be sent to the administration office. Processing typically takes 2-3 business days.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowReq(false)} className="text-slate-400">Cancel</Button>
            <Button onClick={() => setShowReq(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-white text-black max-w-2xl">
          <div className="p-8 border-4 border-double border-slate-200 text-center relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <BadgeCheck className="w-96 h-96" />
            </div>
            <div className="mx-auto w-16 h-16 mb-2">
              <img src="/download.jpg" alt="BIET Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900 mb-1">BIET ERP</h1>
            <p className="text-sm font-semibold text-slate-700">Bansal Institute of Engineering & Technology</p>
            <p className="text-xs text-slate-500 mb-6">Lucknow, Uttar Pradesh</p>
            <h2 className="text-2xl font-serif text-slate-800 border-b border-slate-300 pb-2 mb-8 inline-block">BONAFIDE CERTIFICATE</h2>
            <p className="text-lg leading-relaxed text-justify mb-16">
              This is to certify that Mr./Ms. <strong>{user.name}</strong>, bearing Roll No. <strong>1BI21CS001</strong>, studying in 5th semester of Computer Science & Engineering department, is a bonafide student of this institution for the academic year 2023-24.
            </p>
            <div className="flex justify-between items-end mt-12">
              <div><p className="text-sm">Date: 20-Nov-2023</p></div>
              <div className="text-center"><div className="w-32 h-16 border-b border-slate-400 mb-2"></div><p className="font-bold">Principal Signature</p></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}