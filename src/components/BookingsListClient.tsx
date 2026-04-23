"use client";

import React, { useState, useRef } from 'react';
import { 
  Calendar, Search, Download, Upload, Filter, MoreHorizontal, CheckCircle2, 
  XCircle, Clock, ChevronRight, AlertCircle, FileText, Mail, Phone, DollarSign
} from "lucide-react";
import { updateBookingStatus, bulkImportBookings } from "@/lib/actions";
import Papa from 'papaparse';

export default function BookingsListClient({ initialBookings }: { initialBookings: any[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [bookings, setBookings] = useState(initialBookings);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = ["ALL", "PENDING", "ACCEPTED", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"];

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.user?.phone || "").includes(search) ||
      (b.room?.title || "").toLowerCase().includes(search.toLowerCase()) ||
      b.id.includes(search);
    
    const matchesTab = activeTab === "ALL" || b.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleExport = () => {
    const exportData = bookings.map(b => ({
      BookingID: b.id,
      Guest: b.user?.name,
      Email: b.user?.email,
      Phone: b.user?.phone,
      Room: b.room?.title,
      StartTime: b.startTime,
      Duration: b.durationType,
      Status: b.status,
      Payment: b.paymentStatus,
      Price: b.totalPrice,
      CheckedIn: b.checkedInAt,
      CheckedOut: b.checkedOutAt
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const mappedData = results.data.map((row: any) => ({
            id: row.BookingID,
            guestName: row.Guest,
            guestEmail: row.Email,
            guestPhone: row.Phone,
            roomTitle: row.Room,
            startTime: row.StartTime,
            durationType: row.Duration,
            status: row.Status,
            paymentStatus: row.Payment,
            totalPrice: row.Price,
            checkedInAt: row.CheckedIn,
            checkedOutAt: row.CheckedOut
          }));

          const response = await bulkImportBookings(mappedData);
          alert(`Import Finished!\nSuccess: ${response.success}\nFailed: ${response.failed}`);
          window.location.reload();
        } catch (err: any) {
          alert("Import failed: " + err.message);
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    });
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 font-sans">
      {/* Search & Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search guest or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 md:py-4 bg-card border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-medium text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
          <button 
            onClick={handleImportClick}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl md:rounded-2xl font-black text-[10px] text-slate-500 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 whitespace-nowrap"
          >
            <Upload className="w-4 h-4 text-primary" />
            <span>{isImporting ? "Importing..." : "Import"}</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-xl md:rounded-2xl font-black text-[10px] hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Responsive Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab 
              ? 'bg-slate-900 text-white shadow-md' 
              : 'bg-white text-slate-400 border border-border hover:border-primary/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                <th className="p-8">Guest</th>
                <th className="p-8">Room</th>
                <th className="p-8">Schedule</th>
                <th className="p-8 text-center">Status</th>
                <th className="p-8 text-center">Payment</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-black text-foreground">No bookings found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black">
                          {(booking.user?.name || "G")[0]}
                        </div>
                        <div>
                          <div className="font-black text-foreground">{booking.user?.name || "N/A"}</div>
                          <div className="text-[10px] font-bold text-slate-400">ID: {booking.id.split('-')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="font-black text-foreground">{booking.room?.title || "N/A"}</div>
                      <div className="text-[10px] font-black text-primary uppercase tracking-widest">{booking.room?.category}</div>
                    </td>
                    <td className="p-8">
                      <div className="font-bold text-foreground">{new Date(booking.startTime).toLocaleDateString()}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.durationType}</div>
                    </td>
                    <td className="p-8 text-center">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="p-8 text-center">
                      <div className={`text-[10px] font-black uppercase tracking-widest ${booking.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {booking.paymentStatus}
                      </div>
                      <div className="text-xs font-black mt-1">${booking.totalPrice}</div>
                    </td>
                    <td className="p-8 text-right">
                       <div className="flex justify-end gap-2">
                          <BookingActions booking={booking} onUpdate={handleStatusUpdate} />
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
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No records</div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                      {(booking.user?.name || "G")[0]}
                    </div>
                    <div>
                      <div className="font-black text-foreground text-sm leading-none">{booking.user?.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">ID: {booking.id.split('-')[0]}</div>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
               </div>

               <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Schedule</span>
                    <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                       <Clock size={12} className="text-primary" />
                       {new Date(booking.startTime).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Room</span>
                    <div className="text-xs font-black text-foreground truncate">{booking.room?.title}</div>
                  </div>
               </div>

               <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Amount</span>
                    <div className="text-sm font-black text-foreground">${booking.totalPrice}</div>
                  </div>
                  <div className="flex gap-2">
                    <BookingActions booking={booking} onUpdate={handleStatusUpdate} isMobile />
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BookingActions({ booking, onUpdate, isMobile = false }: any) {
  const btnClass = isMobile ? "p-3 rounded-xl border border-border flex items-center justify-center" : "p-2.5 rounded-xl border border-border flex items-center justify-center hover:bg-slate-50 transition-all";
  
  return (
    <div className="flex gap-2">
      {booking.status === 'PENDING' && (
        <>
          <button onClick={() => onUpdate(booking.id, 'ACCEPTED')} className={`${btnClass} text-emerald-600 border-emerald-100 bg-emerald-50/30`}>
            <CheckCircle2 size={isMobile ? 18 : 20} />
          </button>
          <button onClick={() => onUpdate(booking.id, 'REJECTED')} className={`${btnClass} text-rose-600 border-rose-100 bg-rose-50/30`}>
            <XCircle size={isMobile ? 18 : 20} />
          </button>
        </>
      )}
      {(booking.status === 'ACCEPTED' || booking.status === 'CONFIRMED') && (
        <button onClick={() => onUpdate(booking.id, 'CHECKED_IN')} className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-black text-[10px] uppercase tracking-widest">
          Check In
        </button>
      )}
      {booking.status === 'CHECKED_IN' && (
        <button onClick={() => onUpdate(booking.id, 'COMPLETED')} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200">
          Check Out
        </button>
      )}
      <button className={`${btnClass} text-slate-400`}>
        <MoreHorizontal size={isMobile ? 18 : 20} />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
    ACCEPTED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-100',
    CHECKED_IN: 'bg-primary/10 text-primary border-primary/20',
    COMPLETED: 'bg-slate-50 text-slate-400 border-slate-200',
    CANCELLED: 'bg-rose-50 text-rose-600 border-rose-100',
    REJECTED: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${styles[status] || 'bg-slate-50 text-slate-500'}`}>
      {status}
    </span>
  );
}
