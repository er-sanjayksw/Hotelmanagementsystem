"use client";

import { useState } from "react";
import { Building, Archive, RotateCcw, Calendar, User, Loader2, Users, Mail, MapPin, ChevronDown, ChevronUp, Star, Bed, Clock, Image as ImageIcon } from "lucide-react";
import { restoreHotel } from "@/lib/actions";

export default function ArchiveClient({ archivedHotels, archivedVendors }: { archivedHotels: any[], archivedVendors: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);

  const handleRestore = async (id: string) => {
    setLoadingId(id);
    try {
      await restoreHotel(id);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black text-foreground tracking-tight">Unified Platform Archive</h2>
        <p className="text-slate-500 font-medium text-lg">Manage deactivated properties and archived vendor profiles in one place.</p>
      </div>

      {/* Archived Vendors Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-primary/10 rounded-xl text-primary shadow-sm shadow-primary/5">
             <Users size={20} />
           </div>
           <h3 className="text-xl font-black text-foreground tracking-tight">Archived Vendor Profiles</h3>
        </div>

        <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                  <th className="p-8">Business Information</th>
                  <th className="p-8">Owner</th>
                  <th className="p-8">Archived On</th>
                  <th className="p-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {archivedVendors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No archived vendor profiles found</td>
                  </tr>
                ) : (
                  archivedVendors.map(vendor => (
                    <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-8">
                         <div className="font-black text-foreground text-base">{vendor.businessName}</div>
                         <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase">ID: {vendor.id.split('-')[0]}</div>
                      </td>
                      <td className="p-8">
                         <div className="flex items-center gap-2 font-black text-slate-700 text-sm">
                           <User size={14} className="text-slate-400" />
                           {vendor.user.name}
                         </div>
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1">
                           <Mail size={12} className="text-slate-400" />
                           {vendor.user.email}
                         </div>
                      </td>
                      <td className="p-8">
                         <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                           <Calendar size={14} />
                           {vendor.archivedAt ? new Date(vendor.archivedAt).toLocaleDateString() : 'N/A'}
                         </div>
                      </td>
                      <td className="p-8 text-right">
                         <button className="bg-primary/10 text-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all">
                            Restore Account
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Archived Hotels Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-rose-50 rounded-xl text-rose-600 shadow-sm shadow-rose-50">
             <Building size={20} />
           </div>
           <h3 className="text-xl font-black text-foreground tracking-tight">Suspended Properties</h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {archivedHotels.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-[2.5rem] p-20 text-center">
               <Archive className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No archived hotels in the system</p>
            </div>
          ) : (
            archivedHotels.map(hotel => (
              <div key={hotel.id} className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden border-l-8 border-l-rose-500">
                 <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                       <div>
                          <div className="flex items-center gap-3">
                             <h4 className="text-2xl font-black text-foreground tracking-tight">{hotel.name}</h4>
                             <span className="px-3 py-1 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm shadow-rose-100">Suspended</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 font-medium mt-2">
                             <MapPin size={16} />
                             <span>{hotel.city}, {hotel.country}</span>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleRestore(hotel.id)}
                            disabled={loadingId === hotel.id}
                            className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-primary-hover transition shadow-xl shadow-primary/20 disabled:opacity-50"
                          >
                             {loadingId === hotel.id ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />}
                             <span>{loadingId === hotel.id ? 'Restoring...' : 'Restore Property'}</span>
                          </button>
                          
                          <button 
                            onClick={() => setExpandedHotel(expandedHotel === hotel.id ? null : hotel.id)}
                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
                          >
                             {expandedHotel === hotel.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                       </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                       <StatCard icon={<Bed size={14} />} label="Rooms" value={hotel.rooms?.length || 0} color="primary" />
                       <StatCard icon={<Clock size={14} />} label="Bookings" value={hotel.rooms?.reduce((acc: number, room: any) => acc + (room.bookings?.length || 0), 0) || 0} color="emerald" />
                       <StatCard icon={<Star size={14} />} label="Reviews" value={hotel.reviews?.length || 0} color="amber" />
                       <StatCard icon={<ImageIcon size={14} />} label="Photos" value={hotel.images?.length || 0} color="rose" />
                    </div>

                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-border flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-slate-400">
                          <User size={16} />
                       </div>
                       <div className="text-xs font-bold text-slate-500">
                          Managed by <span className="text-foreground">{hotel.vendor.user.name}</span> — {hotel.vendor.businessName}
                       </div>
                    </div>

                    {expandedHotel === hotel.id && (
                      <div className="mt-10 pt-10 border-t border-border space-y-8 animate-in slide-in-from-top-4 duration-500">
                         <div>
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Inventory Overview</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {hotel.rooms.map((room: any) => (
                                 <div key={room.id} className="p-5 bg-slate-50 border border-border rounded-2xl">
                                    <div className="font-black text-foreground text-sm mb-1">{room.title}</div>
                                    <div className="text-[10px] font-black text-primary uppercase tracking-widest">{room.category}</div>
                                 </div>
                               ))}
                            </div>
                         </div>
                         
                         <div className="p-6 bg-slate-900 rounded-3xl text-white">
                            <div className="flex items-center gap-2 mb-2">
                               <Calendar size={14} className="text-primary" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Archival Log</span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed opacity-80">
                               This property was moved to the system archive on {hotel.archivedAt ? new Date(hotel.archivedAt).toLocaleDateString() : 'N/A'}. 
                               All associated rooms, booking history, and guest reviews are preserved but hidden from public results.
                            </p>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  const colors: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100"
  };

  return (
    <div className={`p-4 border rounded-2xl flex items-center gap-3 ${colors[color]}`}>
       <div className="p-2 bg-card rounded-xl shadow-sm border border-inherit/20">
          {icon}
       </div>
       <div>
          <div className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{label}</div>
          <div className="text-base font-black leading-none">{value}</div>
       </div>
    </div>
  );
}
