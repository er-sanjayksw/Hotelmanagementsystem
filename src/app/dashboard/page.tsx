import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";

export default async function DashboardPage() {
  const session = await auth();
  
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  // Calculate active bookings dynamically
  const activeBookingsCount = await db.booking.count({
    where: Object.assign({ status: { in: ['CONFIRMED', 'ACCEPTED', 'PENDING'] } }, 
        (!isSuperAdmin && vendorId) ? { room: { hotel: { vendorId } } } : {})
  });
  
  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-foreground tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-slate-500 font-medium text-xs md:text-base">
            Welcome back, <span className="text-primary">{session?.user?.name || 'Admin'}</span>. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl md:rounded-2xl border border-border shadow-sm self-start">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard 
          title="Revenue" 
          value="$12.8k" 
          trend="+14%" 
          trendUp={true} 
          icon={<DollarSign className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <KPICard 
          title="Bookings" 
          value={activeBookingsCount.toString()} 
          trend="+8" 
          trendUp={true} 
          icon={<TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
          iconBg="bg-primary/10"
        />
        <KPICard 
          title="Guests" 
          value="1,240" 
          trend="+120" 
          trendUp={true} 
          icon={<Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <KPICard 
          title="Occupancy" 
          value="78%" 
          trend="-2%" 
          trendUp={false} 
          icon={<Activity className="w-5 h-5 md:w-6 md:h-6 text-rose-600" />}
          iconBg="bg-rose-50"
        />
      </div>

      <div className="bg-card p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
        <DashboardCharts />
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, trendUp, icon, iconBg }: any) {
  return (
    <div className="bg-card p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${iconBg} group-hover:rotate-12 transition-transform`}>
          {icon}
        </div>
        <div className={`px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider ${
          trendUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
        }`}>
          {trend}
        </div>
      </div>
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.1em]">{title}</h3>
      <p className="text-xl md:text-3xl font-black text-foreground mt-0.5 md:mt-1 tracking-tighter">{value}</p>
    </div>
  );
}
