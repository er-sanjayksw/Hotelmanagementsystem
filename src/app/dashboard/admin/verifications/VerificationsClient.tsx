"use client";

import { useState } from "react";
import { ShieldCheck, User, Calendar, ExternalLink, Check, X, Loader2, FileText } from "lucide-react";
import { updateVerificationStatus } from "@/lib/actions";

export default function VerificationsClient({ documents }: { documents: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, status: string) => {
    setLoadingId(id);
    try {
      await updateVerificationStatus(id, status);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      <div>
        <h2 className="text-xl md:text-3xl font-black text-foreground tracking-tight">Identity Verifications</h2>
        <p className="text-slate-500 font-medium text-xs md:text-lg">Approve user documents for platform verification.</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                <th className="p-8">User Info</th>
                <th className="p-8">Document</th>
                <th className="p-8">Date</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 font-black text-xs tracking-widest uppercase">No pending requests</td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
                           {doc.user.image ? <img src={doc.user.image} className="w-full h-full object-cover rounded-xl" /> : <span>{doc.user.name[0]}</span>}
                        </div>
                        <div>
                          <div className="font-black text-foreground">{doc.user.name}</div>
                          <div className="text-[10px] font-bold text-slate-400">{doc.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><FileText size={16} /></div>
                         <div>
                            <div className="font-black text-foreground">{doc.documentType}</div>
                            <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-[9px] font-black uppercase tracking-widest flex items-center gap-1 mt-0.5 hover:underline">
                              View <ExternalLink size={10} />
                            </a>
                         </div>
                      </div>
                    </td>
                    <td className="p-8">
                       <div className="flex items-center gap-2 text-slate-500 font-bold">
                         <Calendar size={14} />
                         {new Date(doc.uploadedAt).toLocaleDateString()}
                       </div>
                    </td>
                    <td className="p-8">
                       <StatusBadge status={doc.verificationStatus} />
                    </td>
                    <td className="p-8 text-right">
                       <div className="flex justify-end gap-2">
                          <VerificationActions doc={doc} loadingId={loadingId} onUpdate={handleStatusUpdate} />
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {documents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-black text-xs uppercase tracking-widest bg-card border border-border rounded-3xl">Clean Queue</div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                      {doc.user.image ? <img src={doc.user.image} className="w-full h-full object-cover rounded-xl" /> : <span>{doc.user.name[0]}</span>}
                    </div>
                    <div>
                      <div className="font-black text-foreground text-sm leading-none">{doc.user.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">{doc.user.email}</div>
                    </div>
                  </div>
                  <StatusBadge status={doc.verificationStatus} />
               </div>

               <div className="py-3 border-y border-border/50 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Document</span>
                    <div className="flex items-center gap-2">
                       <div className="text-xs font-black text-foreground">{doc.documentType}</div>
                       <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-primary/5 text-primary rounded-lg">
                          <ExternalLink size={10} />
                       </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Submitted</span>
                    <div className="text-xs font-black text-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                  </div>
               </div>

               <div className="flex gap-2">
                  <VerificationActions doc={doc} loadingId={loadingId} onUpdate={handleStatusUpdate} isMobile />
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function VerificationActions({ doc, loadingId, onUpdate, isMobile = false }: any) {
  const btnBase = "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50";
  
  return (
    <>
      <button 
        onClick={() => onUpdate(doc.id, 'REJECTED')}
        disabled={loadingId === doc.id || doc.verificationStatus === 'REJECTED'}
        className={`${btnBase} border border-rose-100 text-rose-600 bg-rose-50/50 hover:bg-rose-100`}
      >
        {loadingId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
        <span>Reject</span>
      </button>
      <button 
        onClick={() => onUpdate(doc.id, 'APPROVED')}
        disabled={loadingId === doc.id || doc.verificationStatus === 'APPROVED'}
        className={`${btnBase} bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover`}
      >
        {loadingId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        <span>Approve</span>
      </button>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    REJECTED: 'bg-rose-50 text-rose-600 border-rose-100',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${styles[status] || 'bg-slate-50 text-slate-500'}`}>
      {status}
    </span>
  );
}
