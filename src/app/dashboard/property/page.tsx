import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { MapPin, Plus, Hotel as HotelIcon, ChevronRight, Star, Settings } from "lucide-react";
import Link from "next/link";

export default async function PropertyPage() {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  const hotels = await db.hotel.findMany({
    where: (!isSuperAdmin && vendorId) ? { vendorId } : undefined,
    include: { vendor: true, rooms: true }
  });

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-foreground tracking-tight">My Properties</h2>
          <p className="text-slate-500 font-medium text-xs md:text-lg">Manage your portfolio of accommodations.</p>
        </div>
        {isSuperAdmin && (
          <Link 
            href="/dashboard/property/add"
            className="w-full md:w-auto bg-primary text-white px-6 py-3.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs flex items-center justify-center gap-2 hover:bg-primary-hover transition shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            <span>Add Property</span>
          </Link>
        )}
      </div>

      {hotels.length === 0 ? (
        <div className="bg-card p-12 md:p-24 rounded-3xl md:rounded-[2.5rem] border border-border text-center shadow-sm">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <HotelIcon className="w-8 h-8 md:w-10 md:h-10 text-slate-200" />
          </div>
          <h3 className="text-lg md:text-xl font-black text-foreground">No Properties Found</h3>
          <p className="text-slate-500 mt-2 font-medium text-xs md:text-base max-w-sm mx-auto">Start by adding your first property to the platform.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
          {hotels.map(hotel => (
            <div key={hotel.id} className="bg-card border border-border rounded-3xl md:rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group">
              <div className="h-48 md:h-64 w-full relative overflow-hidden">
                {hotel.coverImage ? (
                  <img 
                    src={hotel.coverImage} 
                    alt={hotel.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-slate-100 text-slate-300">
                    <HotelIcon className="w-12 h-12 md:w-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                  <span className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20 ${
                    hotel.status === 'APPROVED' ? 'bg-emerald-500 text-white' : 
                    hotel.status === 'PENDING' ? 'bg-amber-400 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {hotel.status}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white">
                  <h3 className="text-lg md:text-2xl font-black tracking-tight leading-tight">{hotel.name}</h3>
                  <div className="flex items-center text-white/80 mt-1 text-[9px] md:text-xs font-bold uppercase tracking-widest">
                    <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1.5 text-primary" />
                    {hotel.city}, {hotel.country}
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div>
                    <div className="flex items-center gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className="w-2.5 h-2.5 md:w-3 md:h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">Property Rating</p>
                  </div>
                  <div className="text-right">
                    <div className="text-foreground font-black text-base md:text-xl leading-none">{hotel.rooms.length}</div>
                    <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1">Room Units</p>
                  </div>
                </div>

                <p className="text-slate-600 text-xs md:text-sm font-medium line-clamp-2 leading-relaxed mb-6 md:mb-8 flex-1 italic">
                  {hotel.description || "No property description available."}
                </p>

                <div className="flex items-center gap-2 md:gap-3 pt-4 md:pt-6 border-t border-border">
                  <Link 
                    href={`/dashboard/property/${hotel.id}`}
                    className="flex-1 bg-slate-900 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <Settings size={14} className="md:w-4 md:h-4" />
                    <span>Control Panel</span>
                  </Link>
                  <Link 
                    href={`/dashboard/property/${hotel.id}`}
                    className="px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-border text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <ChevronRight size={18} className="md:w-5 md:h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
