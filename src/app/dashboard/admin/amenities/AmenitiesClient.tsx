"use client";

import { useState } from "react";
import { LayoutGrid, Plus, Building, Bed, Search, Loader2, Edit2, Check, X } from "lucide-react";
import { createHotelAmenity, createRoomAmenity, updateHotelAmenity, updateRoomAmenity } from "@/lib/actions";

export default function AmenitiesClient({ hotelAmenities, roomAmenities }: { hotelAmenities: any[], roomAmenities: any[] }) {
  const [loading, setLoading] = useState(false);
  const [newHotelAmenity, setNewHotelAmenity] = useState("");
  const [newRoomAmenity, setNewRoomAmenity] = useState("");
  const [search, setSearch] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleCreateHotelAmenity = async () => {
    if (!newHotelAmenity) return;
    setLoading(true);
    try {
      await createHotelAmenity(newHotelAmenity);
      setNewHotelAmenity("");
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  const handleCreateRoomAmenity = async () => {
    if (!newRoomAmenity) return;
    setLoading(true);
    try {
      await createRoomAmenity(newRoomAmenity);
      setNewRoomAmenity("");
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  const handleSaveEdit = async (id: string, type: 'hotel' | 'room') => {
    setLoading(true);
    try {
      if (type === 'hotel') await updateHotelAmenity(id, editValue);
      else await updateRoomAmenity(id, editValue);
      setEditingId(null);
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  const filteredHotel = hotelAmenities.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  const filteredRoom = roomAmenities.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Platform Amenities</h2>
          <p className="text-slate-500 font-medium text-lg">Standardize features and services available across the platform.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search amenities..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Hotel Amenities */}
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Building className="text-primary w-5 h-5" />
                 <h3 className="font-black text-foreground uppercase text-xs tracking-widest">Hotel Amenities</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{hotelAmenities.length} Total</span>
           </div>

           <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Add Global Hotel Amenity..." 
               value={newHotelAmenity}
               onChange={(e) => setNewHotelAmenity(e.target.value)}
               className="flex-1 px-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
             />
             <button 
               onClick={handleCreateHotelAmenity}
               disabled={loading || !newHotelAmenity}
               className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition shadow-lg disabled:opacity-50"
             >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
             </button>
           </div>

           <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {filteredHotel.map(amenity => (
                <div 
                  key={amenity.id}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-border rounded-2xl group transition-all hover:bg-white hover:shadow-md"
                >
                  {editingId === amenity.id ? (
                    <div className="flex-1 flex gap-2">
                       <input 
                         autoFocus
                         value={editValue}
                         onChange={(e) => setEditValue(e.target.value)}
                         className="flex-1 px-3 py-1 bg-card border border-primary rounded-lg outline-none text-sm font-bold text-foreground"
                       />
                       <button onClick={() => handleSaveEdit(amenity.id, 'hotel')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md">
                          <Check size={18} />
                       </button>
                       <button onClick={() => setEditingId(null)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-md">
                          <X size={18} />
                       </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-foreground">{amenity.name}</span>
                      <button 
                        onClick={() => { setEditingId(amenity.id); setEditValue(amenity.name); }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-primary transition-all"
                      >
                         <Edit2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              ))}
           </div>
        </div>

        {/* Room Amenities */}
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Bed className="text-emerald-600 w-5 h-5" />
                 <h3 className="font-black text-foreground uppercase text-xs tracking-widest">Room Amenities</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{roomAmenities.length} Total</span>
           </div>

           <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Add Global Room Amenity..." 
               value={newRoomAmenity}
               onChange={(e) => setNewRoomAmenity(e.target.value)}
               className="flex-1 px-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
             />
             <button 
               onClick={handleCreateRoomAmenity}
               disabled={loading || !newRoomAmenity}
               className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-100 disabled:opacity-50"
             >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
             </button>
           </div>

           <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {filteredRoom.map(amenity => (
                <div 
                  key={amenity.id}
                  className="flex items-center justify-between p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl group transition-all hover:bg-white hover:shadow-md"
                >
                  {editingId === amenity.id ? (
                    <div className="flex-1 flex gap-2">
                       <input 
                         autoFocus
                         value={editValue}
                         onChange={(e) => setEditValue(e.target.value)}
                         className="flex-1 px-3 py-1 bg-card border border-emerald-200 rounded-lg outline-none text-sm font-bold text-emerald-900"
                       />
                       <button onClick={() => handleSaveEdit(amenity.id, 'room')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md">
                          <Check size={18} />
                       </button>
                       <button onClick={() => setEditingId(null)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-md">
                          <X size={18} />
                       </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-emerald-700">{amenity.name}</span>
                      <button 
                        onClick={() => { setEditingId(amenity.id); setEditValue(amenity.name); }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-emerald-400 hover:text-emerald-600 transition-all"
                      >
                         <Edit2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
