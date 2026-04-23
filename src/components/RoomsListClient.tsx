"use client";

import React, { useState } from 'react';
import { Building, Plus, Search, MoreVertical, Edit2, Trash2, Eye, EyeOff, Wind, Coffee, Wifi, Tv } from "lucide-react";
import Link from "next/link";
import { toggleRoomVisibility } from "@/lib/actions";

export default function RoomsListClient({ initialRooms }: { initialRooms: any[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL, HOURLY, DAILY
  const [rooms, setRooms] = useState(initialRooms);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(search.toLowerCase()) || 
                         room.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || 
                         (filter === "HOURLY" && room.stayType === "SHORT") ||
                         (filter === "DAILY" && room.stayType === "LONG");
    return matchesSearch && matchesFilter;
  });

  const handleToggleVisibility = async (roomId: string, currentStatus: boolean) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isVisible: !currentStatus } : r));
    try {
      await toggleRoomVisibility(roomId, currentStatus);
    } catch (e) {
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isVisible: currentStatus } : r));
      alert("Failed to update visibility");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 font-sans">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search rooms..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 md:py-4 bg-card border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-medium text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 bg-card border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-black text-[10px] uppercase tracking-widest text-slate-500 whitespace-nowrap"
          >
            <option value="ALL">All Units</option>
            <option value="HOURLY">Short Stay</option>
            <option value="DAILY">Full Day</option>
          </select>

          <Link 
            href="/dashboard/rooms/add"
            className="bg-primary text-white px-5 py-3 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary-hover transition shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Add Room</span>
          </Link>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                <th className="p-8">Unit Details</th>
                <th className="p-8">Amenities</th>
                <th className="p-8 text-center">Type</th>
                <th className="p-8 text-center">Pricing</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Building className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-black text-foreground">No units found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-border group-hover:scale-105 transition-transform shadow-sm">
                          {room.images?.[0]?.imageUrl ? (
                            <img src={room.images[0].imageUrl} alt={room.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Building size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-black text-foreground text-base leading-tight">{room.title}</div>
                          <div className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{room.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                       <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {room.amenities?.length > 0 ? (
                            room.amenities.map((a: any) => (
                              <span key={a.id} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[8px] font-black uppercase tracking-widest border border-slate-200">
                                {a.amenity.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold italic">No amenities</span>
                          )}
                       </div>
                    </td>
                    <td className="p-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                        room.stayType === 'SHORT' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {room.stayType === 'SHORT' ? 'Hourly' : 'Full Day'}
                      </span>
                    </td>
                    <td className="p-8 text-center">
                      <div className="font-black text-foreground text-base">${room.pricing?.price24hr || 0}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Rate / 24h</div>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-2">
                        <RoomActions room={room} onToggleVisibility={handleToggleVisibility} />
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
        {filteredRooms.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No records</div>
        ) : (
          filteredRooms.map((room) => (
            <div key={room.id} className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-border shadow-sm">
                      {room.images?.[0]?.imageUrl ? (
                        <img src={room.images[0].imageUrl} alt={room.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Building size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-black text-foreground text-sm leading-tight">{room.title}</div>
                      <div className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">{room.category}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border ${
                    room.isVisible ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {room.isVisible ? "Live" : "Hidden"}
                  </span>
               </div>

               <div className="py-3 border-y border-border/50">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities?.length > 0 ? (
                      room.amenities.map((a: any) => (
                        <span key={a.id} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[8px] font-black uppercase tracking-widest border border-slate-200">
                          {a.amenity.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] text-slate-300 font-bold">Default features</span>
                    )}
                  </div>
               </div>

               <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Stay Type</span>
                    <div className="text-xs font-black text-foreground uppercase tracking-wider">{room.stayType === 'SHORT' ? 'Hourly' : 'Daily'}</div>
                  </div>
                  <div className="flex gap-2">
                    <RoomActions room={room} onToggleVisibility={handleToggleVisibility} isMobile />
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RoomActions({ room, onToggleVisibility, isMobile = false }: any) {
  const btnBase = "p-2.5 rounded-xl border border-border flex items-center justify-center transition-all hover:bg-slate-50";
  const size = isMobile ? 18 : 20;

  return (
    <>
      <button 
        onClick={() => onToggleVisibility(room.id, room.isVisible)}
        className={`${btnBase} ${room.isVisible ? 'text-amber-600 border-amber-100' : 'text-emerald-600 border-emerald-100'}`}
        title={room.isVisible ? 'Hide Room' : 'Show Room'}
      >
        {room.isVisible ? <EyeOff size={size} /> : <Eye size={size} />}
      </button>
      <button className={`${btnBase} text-blue-600 border-blue-100`} title="Edit">
        <Edit2 size={size} />
      </button>
      <button className={`${btnBase} text-rose-600 border-rose-100`} title="Delete">
        <Trash2 size={size} />
      </button>
    </>
  );
}
