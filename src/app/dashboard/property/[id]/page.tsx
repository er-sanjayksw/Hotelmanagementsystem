import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { MapPin, Building, Star, Calendar, Users, ArrowLeft, Edit2, LayoutDashboard, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id) {
     return <ServerIssue message="Missing property identifier in request." />;
  }

  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  let hotel;
  try {
    hotel = await db.hotel.findUnique({
      where: { id: id },
      include: { 
        rooms: {
          include: { pricing: true, images: true }
        },
        vendor: {
          include: { user: true }
        }
      }
    });
  } catch (error) {
    console.error("Hotel Detail Fetch Error:", error);
    return <ServerIssue message="We encountered a problem retrieving property details from our database." />;
  }

  if (!hotel) return notFound();
  
  // Security check: Only admins or the property owner can view this page
  const isOwner = hotel.vendorId === (session?.user as any)?.vendorProfile?.id || hotel.vendorId === vendorId;
  if (!isSuperAdmin && !isOwner) return <ServerIssue message="You do not have administrative clearance to view this property's details." />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/property" className="p-3 bg-card border border-border rounded-2xl text-slate-400 hover:text-primary transition-all hover:border-primary/20 hover:shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">{hotel.name}</h2>
            <div className="flex items-center text-slate-500 mt-1 text-sm font-medium">
              <MapPin className="w-4 h-4 mr-1.5 text-primary" />
              {hotel.location}, {hotel.city}, {hotel.country}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-card border border-border text-foreground px-6 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-slate-50 transition shadow-sm">
            <Edit2 className="w-4 h-4" />
            <span>Edit Information</span>
          </button>
          <Link 
            href="/dashboard/availability"
            className="bg-primary text-primary-foreground px-6 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-primary-hover transition shadow-lg shadow-primary/20"
          >
            <Calendar className="w-4 h-4" />
            <span>Check Availability</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats & Image */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card p-4 rounded-[2.5rem] border border-border shadow-sm overflow-hidden group">
            <div className="h-[400px] rounded-[1.5rem] overflow-hidden relative">
               {hotel.coverImage ? (
                <img src={hotel.coverImage} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                   <Building className="w-20 h-20" />
                </div>
              )}
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl flex items-center gap-2">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  4.8 Rating
                </span>
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md ${
                  hotel.status === 'APPROVED' ? 'bg-emerald-500/90 text-white shadow-sm shadow-emerald-100' : 'bg-amber-400/90 text-white shadow-sm shadow-amber-100'
                }`}>
                  {hotel.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
            <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
               <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <LayoutDashboard className="w-4 h-4" />
               </div>
               <span>About Property</span>
            </h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              {hotel.description || "No detailed description available for this property."}
            </p>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200">
             <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-8">Performance Snapshot</h4>
             
             <div className="space-y-8">
               <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Building className="w-6 h-6" />
                 </div>
                 <div>
                   <div className="text-2xl font-black">{hotel.rooms.length}</div>
                   <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Rooms</div>
                 </div>
               </div>

               <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                 </div>
                 <div>
                   <div className="text-2xl font-black">248</div>
                   <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Monthly Guests</div>
                 </div>
               </div>

               <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Star className="w-6 h-6" />
                 </div>
                 <div>
                   <div className="text-2xl font-black">98%</div>
                   <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Occupancy Rate</div>
                 </div>
               </div>
             </div>
          </div>

          <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Staff Contact</h4>
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black">
                 {(hotel.vendor.businessName || 'H')[0]}
               </div>
               <div>
                 <div className="font-black text-foreground">{hotel.vendor.businessName}</div>
                 <div className="text-xs font-medium text-slate-500">Property Manager</div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Room Gallery Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-2xl font-black text-foreground tracking-tight">Available Room Inventory</h3>
           <Link href="/dashboard/rooms" className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-all">
             Manage Inventory <Plus className="w-4 h-4" />
           </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {hotel.rooms.map((room) => (
             <div key={room.id} className="bg-card p-5 rounded-[2rem] border border-border shadow-sm hover:shadow-lg transition-all group">
               <div className="h-40 rounded-2xl bg-slate-50 overflow-hidden mb-4 relative border border-slate-100">
                  {room.images?.[0]?.imageUrl ? (
                    <img src={room.images[0].imageUrl} alt={room.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Building className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase text-primary shadow-sm border border-primary/10">
                    {room.category}
                  </div>
               </div>
               <h4 className="font-black text-foreground mb-1">{room.title}</h4>
               <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <span className="text-lg font-black text-foreground">${room.pricing?.price24hr || 0}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">/ Night</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                    {room.quantity} Left
                  </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

function ServerIssue({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mb-6 shadow-xl shadow-rose-100/50">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-3xl font-black text-foreground tracking-tight mb-4">Server Issue Detected</h2>
      <p className="text-slate-500 font-medium max-w-md leading-relaxed mb-8">
        {message}
      </p>
      <Link 
        href="/dashboard"
        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
