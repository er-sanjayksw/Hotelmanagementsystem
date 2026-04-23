"use client";

import { useState } from "react";
import { Building, User, Mail, Shield, Check, X, Loader2, Info, Edit2 } from "lucide-react";
import { updateVendor } from "@/lib/actions";

export default function VendorsClient({ vendors }: { vendors: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (id: string, status: string) => {
    setLoadingId(id);
    try {
      await updateVendor(id, { approvalStatus: status });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      businessName: formData.get('businessName'),
      approvalStatus: formData.get('approvalStatus')
    };

    try {
      await updateVendor(editingVendor.id, data);
      setEditingVendor(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      <div>
        <h2 className="text-xl md:text-3xl font-black text-foreground tracking-tight">Vendor Applications</h2>
        <p className="text-slate-500 font-medium text-xs md:text-lg">Manage business registrations for hotel partners.</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                <th className="p-8">Business Info</th>
                <th className="p-8">Owner</th>
                <th className="p-8">Hotels</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 font-black text-xs uppercase tracking-widest">No applications</td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
                           <Building size={18} />
                        </div>
                        <div>
                          <div className="font-black text-foreground">{vendor.businessName}</div>
                          <div className="text-[10px] font-mono text-slate-400">ID: {vendor.id.split('-')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="font-bold text-foreground">{vendor.user.name}</div>
                      <div className="text-[10px] font-bold text-slate-400">{vendor.user.email}</div>
                    </td>
                    <td className="p-8">
                       <span className="font-black text-foreground">{vendor.hotels?.length || 0}</span>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Listed</span>
                    </td>
                    <td className="p-8">
                       <StatusBadge status={vendor.approvalStatus} />
                    </td>
                    <td className="p-8 text-right">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingVendor(vendor)} className="p-2.5 rounded-xl border border-border text-primary hover:bg-primary/5 transition-all"><Edit2 size={16} /></button>
                          <VendorActions vendor={vendor} loadingId={loadingId} onUpdate={handleStatusUpdate} />
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
         {vendors.length === 0 ? (
           <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No records</div>
         ) : (
           vendors.map((vendor) => (
             <div key={vendor.id} className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                         <Building size={18} />
                      </div>
                      <div>
                         <div className="font-black text-foreground text-sm leading-none">{vendor.businessName}</div>
                         <div className="text-[10px] font-bold text-slate-400 mt-1">ID: {vendor.id.split('-')[0]}</div>
                      </div>
                   </div>
                   <StatusBadge status={vendor.approvalStatus} />
                </div>

                <div className="py-3 border-y border-border/50 grid grid-cols-2 gap-4">
                   <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Owner</span>
                      <div className="text-xs font-black text-foreground truncate">{vendor.user.name}</div>
                   </div>
                   <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Properties</span>
                      <div className="text-xs font-black text-foreground">{vendor.hotels?.length || 0} Hotels</div>
                   </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                   <button onClick={() => setEditingVendor(vendor)} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-slate-400"><Edit2 size={16} /></button>
                   <div className="flex-1 flex gap-2">
                      <VendorActions vendor={vendor} loadingId={loadingId} onUpdate={handleStatusUpdate} isMobile />
                   </div>
                </div>
             </div>
           ))
         )}
      </div>

      {/* Edit Modal (Mobile Optimized) */}
      {editingVendor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[110] flex items-center justify-center p-4">
           <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-base md:text-xl font-black text-foreground tracking-tight">Manage Vendor</h3>
                 <button onClick={() => setEditingVendor(null)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-card border border-border flex items-center justify-center text-slate-400"><X size={16} /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 md:p-8 space-y-6">
                 <div>
                    <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Business Name</label>
                    <input name="businessName" type="text" defaultValue={editingVendor.businessName} required className="w-full p-4 bg-slate-50 border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm text-foreground" />
                 </div>
                 <div>
                    <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Approval Status</label>
                    <select name="approvalStatus" defaultValue={editingVendor.approvalStatus} className="w-full p-4 bg-slate-50 border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm text-foreground">
                       <option value="PENDING">Pending Approval</option>
                       <option value="APPROVED">Approved Partner</option>
                       <option value="REJECTED">Application Rejected</option>
                    </select>
                 </div>
                 <div className="pt-4">
                    <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 text-sm tracking-tight flex items-center justify-center gap-2">
                       {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Business Status"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

function VendorActions({ vendor, loadingId, onUpdate, isMobile = false }: any) {
  const btnBase = "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50";
  
  return (
    <>
      <button 
        onClick={() => onUpdate(vendor.id, 'REJECTED')}
        disabled={loadingId === vendor.id || vendor.approvalStatus === 'REJECTED'}
        className={`${btnBase} border border-rose-100 text-rose-600 bg-rose-50/50 hover:bg-rose-100`}
      >
        {loadingId === vendor.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
        <span>Reject</span>
      </button>
      <button 
        onClick={() => onUpdate(vendor.id, 'APPROVED')}
        disabled={loadingId === vendor.id || vendor.approvalStatus === 'APPROVED'}
        className={`${btnBase} bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover`}
      >
        {loadingId === vendor.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
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
