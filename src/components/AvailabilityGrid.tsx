"use client";

import React, { useState } from 'react';
import { format, addHours, startOfToday, isSameDay, parseISO, addDays, subDays } from 'date-fns';
import { User, Clock, CheckCircle2, AlertCircle, Plus, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { createManualBooking } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface AvailabilityGridProps {
  rooms: any[];
  initialDate: string;
}

export default function AvailabilityGrid({ rooms, initialDate }: AvailabilityGridProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const selectedDate = parseISO(initialDate);
  
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(`/dashboard/availability?date=${e.target.value}`);
  };

  const navigateDate = (amount: number) => {
    const nextDate = amount > 0 ? addDays(selectedDate, amount) : subDays(selectedDate, Math.abs(amount));
    router.push(`/dashboard/availability?date=${format(nextDate, 'yyyy-MM-dd')}`);
  };

  return (
    <div className="w-full space-y-6 md:space-y-8 animate-in fade-in duration-700 font-sans">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 bg-card p-1 rounded-xl md:rounded-2xl border border-border shadow-sm">
            <button 
              onClick={() => navigateDate(-1)}
              className="p-1.5 md:p-2 hover:bg-slate-50 rounded-lg md:rounded-xl transition-all text-slate-400 hover:text-primary"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center gap-2 px-1">
              <CalendarIcon size={14} className="text-primary" />
              <input 
                type="date" 
                value={initialDate} 
                onChange={handleDateChange}
                className="bg-transparent font-black text-foreground outline-none cursor-pointer text-[10px] md:text-xs tracking-tight"
              />
            </div>

            <button 
              onClick={() => navigateDate(1)}
              className="p-1.5 md:p-2 hover:bg-slate-50 rounded-lg md:rounded-xl transition-all text-slate-400 hover:text-primary"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex gap-3 text-[8px] font-black uppercase tracking-widest bg-white/50 px-3 py-2 rounded-xl border border-border/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
              <span className="text-slate-500">Live</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.3)]"></div>
              <span className="text-slate-500">Idle</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto bg-primary text-white px-5 py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs flex items-center justify-center gap-2 hover:bg-primary-hover transition shadow-lg shadow-primary/20"
        >
          <Plus size={16} />
          <span>Manual Entry</span>
        </button>
      </div>

      <div className="bg-card border border-border rounded-3xl md:rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[800px] md:min-w-full">
                {/* Grid Header */}
                <div className="flex border-b border-border bg-slate-50/50">
                  <div className="w-40 md:w-56 sticky left-0 z-30 bg-slate-50 font-black text-slate-400 uppercase text-[8px] md:text-[9px] tracking-widest px-4 md:px-6 py-4 md:py-6 border-r border-border shadow-sm">Room Status</div>
                  <div className="flex-1 flex relative py-4 md:py-6">
                    {hours.map(hour => (
                      <div 
                        key={hour} 
                        className="flex-1 text-center text-[7px] md:text-[8px] text-slate-400 font-black tracking-tighter border-l border-border/30 first:border-l-0"
                      >
                        {hour === 0 || hour % 2 === 0 ? format(addHours(startOfToday(), hour), 'HH:mm') : ''}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grid Rows */}
                <div className="divide-y divide-border">
                  {rooms.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest italic">No active rooms found</div>
                  ) : (
                    rooms.map((room) => (
                      <div key={room.id} className="flex group min-h-[3.5rem] md:min-h-[4.5rem]">
                        {/* Sticky Room Info */}
                        <div className="w-40 md:w-56 sticky left-0 z-30 px-4 md:px-6 py-3 md:py-4 border-r border-border bg-white group-hover:bg-slate-50/50 transition-colors shadow-sm">
                          <div className="font-black text-foreground text-[10px] md:text-xs tracking-tight truncate uppercase leading-none">{room.title}</div>
                          <div className="text-[7px] md:text-[8px] text-primary uppercase font-black tracking-widest mt-1 opacity-70">{room.category}</div>
                        </div>

                        {/* Timeline Area */}
                        <div className="flex-1 relative flex bg-white group-hover:bg-slate-50/10 transition-colors">
                          {hours.map(hour => (
                            <div key={hour} className="flex-1 border-l border-border/20 first:border-l-0 h-full"></div>
                          ))}

                          {room.bookings.map((booking: any) => {
                            const bStart = new Date(booking.startTime);
                            if (!isSameDay(bStart, selectedDate)) return null;

                            const startHour = bStart.getHours() + (bStart.getMinutes() / 60);
                            const duration = Math.min(24 - startHour, parseInt(booking.durationType.replace('hr', '')) || 24);
                            
                            const isArrived = booking.status === "CHECKED_IN";
                            const isNoShow = !isArrived && bStart < new Date();

                            return (
                              <div
                                key={booking.id}
                                className={`absolute top-2 bottom-2 rounded-lg flex flex-col justify-center cursor-pointer transition-all duration-300 transform hover:scale-[1.01] hover:z-20 border-l-4 shadow-sm group/booking ${
                                  isArrived 
                                    ? 'bg-emerald-500/90 border-emerald-700 text-white' 
                                    : isNoShow 
                                      ? 'bg-amber-400/90 border-amber-600 text-white'
                                      : 'bg-primary/90 border-primary-hover text-white'
                                }`}
                                style={{ 
                                  left: `${(startHour / 24) * 100}%`,
                                  width: `${(duration / 24) * 100}%`,
                                }}
                              >
                                <div className="px-2 overflow-hidden">
                                  <span className="text-[7px] md:text-[8px] font-black truncate block leading-none tracking-tighter uppercase">
                                    {booking.user?.name || 'Guest'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  ))}
                </div>
            </div>
        </div>
      </div>

      {/* Manual Entry Modal (Mobile Optimized) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg md:text-xl font-black text-foreground tracking-tight">Manual Walk-in</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-card border border-border flex items-center justify-center text-slate-400"><X size={16} /></button>
            </div>
            <form action={async (formData) => {
              setLoading(true);
              try {
                await createManualBooking(formData);
                setShowModal(false);
                window.location.reload();
              } catch (e: any) {
                alert(e.message);
              } finally {
                setLoading(false);
              }
            }} className="p-6 md:p-8 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Room Assignment</label>
                  <select name="roomId" required className="w-full p-4 bg-slate-50 border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm text-foreground">
                    <option value="">Select an available room...</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.title} ({r.category})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Arrival Time</label>
                  <input name="startTime" type="datetime-local" defaultValue={format(selectedDate, "yyyy-MM-dd'T'HH:mm")} required className="w-full p-4 bg-slate-50 border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm text-foreground" />
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Stay Duration</label>
                  <select name="durationType" required className="w-full p-4 bg-slate-50 border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm text-foreground">
                    <option value="3hr">3 Hours</option>
                    <option value="6hr">6 Hours</option>
                    <option value="12hr">12 Hours</option>
                    <option value="24hr">24 Hours (1 Day)</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 text-sm tracking-tight flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Record & Check-in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
