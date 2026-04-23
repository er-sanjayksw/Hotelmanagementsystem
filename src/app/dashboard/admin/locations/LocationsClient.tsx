"use client";

import { useState } from "react";
import { Map, Plus, Globe, Landmark, Building2, ChevronRight, Loader2, Trash2, Edit2, Check, X } from "lucide-react";
import { createCountry, createDistrict, createCity, updateCountry, updateDistrict, updateCity } from "@/lib/actions";

export default function LocationsClient({ countries }: { countries: any[] }) {
  const [loading, setLoading] = useState(false);
  const [newCountry, setNewCountry] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newCity, setNewCity] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleCreateCountry = async () => {
    if (!newCountry) return;
    setLoading(true);
    try {
      await createCountry(newCountry);
      setNewCountry("");
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  const handleCreateDistrict = async () => {
    if (!newDistrict || !selectedCountryId) return;
    setLoading(true);
    try {
      await createDistrict(selectedCountryId, newDistrict);
      setNewDistrict("");
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  const handleCreateCity = async () => {
    if (!newCity || !selectedDistrictId) return;
    setLoading(true);
    try {
      await createCity(selectedDistrictId, newCity);
      setNewCity("");
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  const handleSaveEdit = async (id: string, type: 'country' | 'district' | 'city') => {
    setLoading(true);
    try {
      if (type === 'country') await updateCountry(id, editValue);
      else if (type === 'district') await updateDistrict(id, editValue);
      else await updateCity(id, editValue);
      setEditingId(null);
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  const selectedCountry = countries.find(c => c.id === selectedCountryId);
  const selectedDistrict = selectedCountry?.districts.find((d: any) => d.id === selectedDistrictId);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black text-foreground tracking-tight">Global Locations</h2>
        <p className="text-slate-500 font-medium text-lg">Manage the geographical hierarchy for platform listings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Countries Column */}
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6 flex flex-col">
           <div className="flex items-center gap-3 mb-2">
              <Globe className="text-primary w-5 h-5" />
              <h3 className="font-black text-foreground uppercase text-xs tracking-widest">Countries</h3>
           </div>
           
           <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="New Country..." 
               value={newCountry}
               onChange={(e) => setNewCountry(e.target.value)}
               className="flex-1 px-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
             />
             <button 
               onClick={handleCreateCountry}
               disabled={loading || !newCountry}
               className="bg-primary text-primary-foreground p-3 rounded-xl hover:bg-primary-hover transition shadow-lg shadow-primary/20 disabled:opacity-50"
             >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
             </button>
           </div>

           <div className="space-y-2 flex-1 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {countries.map(country => (
                <div key={country.id} className="relative group">
                  {editingId === country.id ? (
                    <div className="flex items-center gap-2 p-3 bg-card border-2 border-primary rounded-2xl shadow-lg z-10 relative">
                       <input 
                         autoFocus
                         value={editValue}
                         onChange={(e) => setEditValue(e.target.value)}
                         className="flex-1 px-2 py-1 bg-slate-50 rounded-lg outline-none text-sm font-bold text-foreground"
                       />
                       <button onClick={() => handleSaveEdit(country.id, 'country')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md">
                          <Check size={18} />
                       </button>
                       <button onClick={() => setEditingId(null)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-md">
                          <X size={18} />
                       </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setSelectedCountryId(country.id); setSelectedDistrictId(""); }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm ${
                        selectedCountryId === country.id ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{country.name}</span>
                        <Edit2 
                          size={12} 
                          className={`opacity-0 group-hover:opacity-60 transition-opacity hover:text-primary cursor-pointer p-0.5`} 
                          onClick={(e) => { e.stopPropagation(); setEditingId(country.id); setEditValue(country.name); }}
                        />
                      </div>
                      <ChevronRight size={14} className={selectedCountryId === country.id ? 'text-primary-foreground/60' : 'text-slate-300'} />
                    </button>
                  )}
                </div>
              ))}
           </div>
        </div>

        {/* Districts Column */}
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6 flex flex-col">
           <div className="flex items-center gap-3 mb-2">
              <Landmark className="text-emerald-500 w-5 h-5" />
              <h3 className="font-black text-foreground uppercase text-xs tracking-widest">Districts / States</h3>
           </div>

           {selectedCountryId ? (
             <>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   placeholder={`New in ${selectedCountry?.name}...`} 
                   value={newDistrict}
                   onChange={(e) => setNewDistrict(e.target.value)}
                   className="flex-1 px-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                 />
                 <button 
                   onClick={handleCreateDistrict}
                   disabled={loading || !newDistrict}
                   className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-100 disabled:opacity-50"
                 >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                 </button>
               </div>

               <div className="space-y-2 flex-1 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {selectedCountry?.districts.map((district: any) => (
                    <div key={district.id} className="relative group">
                       {editingId === district.id ? (
                         <div className="flex items-center gap-2 p-3 bg-card border-2 border-emerald-500 rounded-2xl shadow-lg z-10 relative">
                            <input 
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-2 py-1 bg-slate-50 rounded-lg outline-none text-sm font-bold text-foreground"
                            />
                            <button onClick={() => handleSaveEdit(district.id, 'district')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md">
                               <Check size={18} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-md">
                               <X size={18} />
                            </button>
                         </div>
                       ) : (
                        <button 
                          onClick={() => setSelectedDistrictId(district.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm ${
                            selectedDistrictId === district.id ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{district.name}</span>
                            <Edit2 
                              size={12} 
                              className={`opacity-0 group-hover:opacity-60 transition-opacity hover:text-emerald-400 cursor-pointer p-0.5`} 
                              onClick={(e) => { e.stopPropagation(); setEditingId(district.id); setEditValue(district.name); }}
                            />
                          </div>
                          <ChevronRight size={14} className={selectedDistrictId === district.id ? 'text-white/60' : 'text-slate-300'} />
                        </button>
                       )}
                    </div>
                  ))}
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20 text-center">
                <Landmark className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest px-8">Select a country to manage districts</p>
             </div>
           )}
        </div>

        {/* Cities Column */}
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6 flex flex-col">
           <div className="flex items-center gap-3 mb-2">
              <Building2 className="text-amber-500 w-5 h-5" />
              <h3 className="font-black text-foreground uppercase text-xs tracking-widest">Cities</h3>
           </div>

           {selectedDistrictId ? (
             <>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   placeholder={`New in ${selectedDistrict?.name}...`} 
                   value={newCity}
                   onChange={(e) => setNewCity(e.target.value)}
                   className="flex-1 px-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                 />
                 <button 
                   onClick={handleCreateCity}
                   disabled={loading || !newCity}
                   className="bg-amber-400 text-white p-3 rounded-xl hover:bg-amber-500 transition shadow-lg shadow-amber-100 disabled:opacity-50"
                 >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                 </button>
               </div>

               <div className="space-y-2 flex-1 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {selectedDistrict?.cities.map((city: any) => (
                    <div key={city.id} className="relative group">
                       {editingId === city.id ? (
                         <div className="flex items-center gap-2 p-3 bg-card border-2 border-amber-400 rounded-2xl shadow-lg z-10 relative">
                            <input 
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-2 py-1 bg-slate-50 rounded-lg outline-none text-sm font-bold text-foreground"
                            />
                            <button onClick={() => handleSaveEdit(city.id, 'city')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md">
                               <Check size={18} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-md">
                               <X size={18} />
                            </button>
                         </div>
                       ) : (
                        <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-slate-600 font-bold text-sm">
                          <div className="flex items-center gap-2">
                            <span>{city.name}</span>
                            <Edit2 
                              size={12} 
                              className={`opacity-0 group-hover:opacity-60 transition-opacity hover:text-amber-400 cursor-pointer p-0.5`} 
                              onClick={() => { setEditingId(city.id); setEditValue(city.name); }}
                            />
                          </div>
                        </div>
                       )}
                    </div>
                  ))}
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20 text-center">
                <Building2 className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest px-8">Select a district to manage cities</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
