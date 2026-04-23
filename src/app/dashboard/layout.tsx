import Link from 'next/link';
import { Home, Users, Building, Calendar, Settings, LogOut, Star, FileText, User, Clock, Phone, ShieldCheck, UserCheck, Map, LayoutGrid, AlertCircle, Archive, MessageSquare } from 'lucide-react';
import { auth, signOut } from '@/lib/auth';
import SidebarItem from '@/components/SidebarItem';
import NotificationBell from '@/components/NotificationBell';
import { db } from '@/lib/db';
import DashboardMobileNav from '@/components/DashboardMobileNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;
  const role = (user as any)?.role;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN' || isSuperAdmin;
  const vendorId = (user as any)?.vendorProfile?.id;
  const permissions = (user as any)?.permissions || [];

  const hasPermission = (perm: string) => isSuperAdmin || permissions.includes(perm);

  // Initialize counts with safe defaults
  let pendingVendors = 0;
  let pendingVerifications = 0;
  let pendingBookings = 0;
  let notifications: any[] = [];
  let unreadNotifications = 0;

  try {
    if (isAdmin) {
      if (hasPermission('MANAGE_VENDORS')) {
        pendingVendors = await db.vendor.count({ where: { approvalStatus: 'PENDING' } }).catch(() => 0);
      }
      if (hasPermission('MANAGE_VERIFICATIONS')) {
        pendingVerifications = await db.userDocument.count({ where: { verificationStatus: 'PENDING' } }).catch(() => 0);
      }
      pendingBookings = await db.booking.count({ where: { status: 'PENDING' } }).catch(() => 0);
    } else if (vendorId) {
      pendingBookings = await db.booking.count({ 
        where: { 
          status: 'PENDING',
          room: { hotel: { vendorId } }
        } 
      }).catch(() => 0);
    }

    if (user?.id) {
      notifications = await db.notification.findMany({
        where: { userId: (user as any).id },
        orderBy: { createdAt: 'desc' },
        take: 10
      }).catch(() => []);
      
      unreadNotifications = await db.notification.count({
        where: { userId: (user as any).id, isRead: false }
      }).catch(() => 0);
    }
  } catch (error) {
    console.error("Dashboard layout data fetch error:", error);
  }

  const mainTabs = [
    { href: "/dashboard", icon: <Home size={18} />, label: "Overview" },
    { href: "/dashboard/bookings", icon: <Calendar size={18} />, label: "Bookings" },
    { href: "/dashboard/availability", icon: <Clock size={18} />, label: "Availability Grid" },
  ];

  const adminTabs = [
    { href: "/dashboard/admin/vendors", icon: <ShieldCheck size={18} />, label: "Vendor Requests", permission: 'MANAGE_VENDORS' },
    { href: "/dashboard/admin/users", icon: <Users size={18} />, label: "Platform Users", permission: 'MANAGE_USERS' },
    { href: "/dashboard/admin/verifications", icon: <UserCheck size={18} />, label: "User Verifications", permission: 'MANAGE_VERIFICATIONS' },
    { href: "/dashboard/admin/reviews", icon: <MessageSquare size={18} />, label: "Review Moderation", permission: 'MANAGE_REVIEWS' },
    { href: "/dashboard/admin/locations", icon: <Map size={18} />, label: "Global Locations", permission: 'MANAGE_LOCATIONS' },
    { href: "/dashboard/admin/amenities", icon: <LayoutGrid size={18} />, label: "Global Amenities", permission: 'MANAGE_AMENITIES' },
    { href: "/dashboard/admin/archive", icon: <Archive size={18} />, label: "System Archive", permission: 'MANAGE_ARCHIVE' },
  ];

  const vendorTabs = [
    { href: "/dashboard/property", icon: <Building size={18} />, label: "My Property" },
    { href: "/dashboard/rooms", icon: <Users size={18} />, label: "Manage Rooms" },
  ];

  const otherTabs = [
    { href: "/dashboard/reviews", icon: <Star size={18} />, label: "Guest Reviews" },
    { href: "/dashboard/blogs", icon: <FileText size={18} />, label: "Marketing Blogs", permission: 'MANAGE_BLOGS' },
    { href: "/dashboard/emergency", icon: <Phone size={18} />, label: "Emergency Contacts" },
    { href: "/dashboard/profile", icon: <User size={18} />, label: "Account Settings" },
  ];

  const filteredAdminTabs = adminTabs.filter(tab => hasPermission(tab.permission));
  const filteredOtherTabs = otherTabs.filter(tab => !tab.permission || hasPermission(tab.permission));

  const allMobileTabs = [...mainTabs, ...(isAdmin ? filteredAdminTabs : vendorTabs), ...filteredOtherTabs];

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-primary/20 selection:text-primary">
      {/* Sidebar (Desktop) */}
      <aside className="w-72 bg-card border-r border-border hidden xl:block shadow-sm z-[50]">
        <div className="h-full flex flex-col">
          <div className="p-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Building className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black text-foreground tracking-tight">SmartHotel</h1>
            </div>
          </div>
          
          <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Main Menu</div>
            {mainTabs.map(tab => (
              <SidebarItem key={tab.href} href={tab.href} icon={tab.icon} label={tab.label} count={tab.href === '/dashboard/bookings' ? pendingBookings : undefined} />
            ))}
            
            {isAdmin ? (
              <>
                {filteredAdminTabs.length > 0 && (
                  <>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-6 mb-2">Platform Control</div>
                    {hasPermission('MANAGE_VENDORS') && <SidebarItem href="/dashboard/admin/vendors" icon={<ShieldCheck className="w-5 h-5" />} label="Vendor Requests" count={pendingVendors} />}
                    {hasPermission('MANAGE_USERS') && <SidebarItem href="/dashboard/admin/users" icon={<Users className="w-5 h-5" />} label="Platform Users" />}
                    {hasPermission('MANAGE_VERIFICATIONS') && <SidebarItem href="/dashboard/admin/verifications" icon={<UserCheck className="w-5 h-5" />} label="User Verifications" count={pendingVerifications} />}
                    {hasPermission('MANAGE_REVIEWS') && <SidebarItem href="/dashboard/admin/reviews" icon={<MessageSquare className="w-5 h-5" />} label="Review Moderation" />}
                    
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-6 mb-2">Platform Setup</div>
                    {hasPermission('MANAGE_LOCATIONS') && <SidebarItem href="/dashboard/admin/locations" icon={<Map className="w-5 h-5" />} label="Global Locations" />}
                    {hasPermission('MANAGE_AMENITIES') && <SidebarItem href="/dashboard/admin/amenities" icon={<LayoutGrid className="w-5 h-5" />} label="Global Amenities" />}
                    {hasPermission('MANAGE_ARCHIVE') && <SidebarItem href="/dashboard/admin/archive" icon={<Archive className="w-5 h-5" />} label="System Archive" />}
                  </>
                )}
              </>
            ) : (
              <>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-6 mb-2">Inventory</div>
                <SidebarItem href="/dashboard/property" icon={<Building className="w-5 h-5" />} label="My Property" />
                <SidebarItem href="/dashboard/rooms" icon={<Users className="w-5 h-5" />} label="Manage Rooms" />
              </>
            )}
            
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-6 mb-2">Content & Safety</div>
            {!isAdmin && <SidebarItem href="/dashboard/reviews" icon={<Star className="w-5 h-5" />} label="Guest Reviews" />}
            {hasPermission('MANAGE_BLOGS') && <SidebarItem href="/dashboard/blogs" icon={<FileText className="w-5 h-5" />} label="Marketing Blogs" />}
            <SidebarItem href="/dashboard/emergency" icon={<Phone className="w-5 h-5" />} label="Emergency Contacts" />
            <SidebarItem href="/dashboard/profile" icon={<User className="w-5 h-5" />} label="Account Settings" />
          </nav>

          <div className="p-4 border-t border-border bg-slate-50/50">
            <div className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border shadow-sm mb-3">
               <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center text-primary font-black shadow-inner">
                {user?.image ? (
                  <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span>{(user?.name || 'U')[0]}</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-black text-foreground truncate leading-none">{user?.name || 'Guest'}</span>
                <span className={`text-[8px] font-black uppercase tracking-widest mt-1.5 ${isSuperAdmin ? 'text-rose-500' : 'text-primary'}`}>
                  {isSuperAdmin ? 'Super Admin' : role === 'ADMIN' ? 'Admin' : 'Vendor'}
                </span>
              </div>
            </div>

            <form action={async () => {
              "use server";
              await signOut();
            }}>
              <button type="submit" className="flex items-center space-x-3 text-slate-600 p-2.5 hover:bg-red-50 hover:text-red-600 rounded-xl w-full transition-all duration-200 font-semibold group text-xs">
                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Sticky Header (App-like) */}
        <header className="sticky top-0 z-[60] h-16 md:h-20 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 md:px-8 flex-shrink-0 transition-all">
          <div className="flex items-center gap-3">
            <div className="xl:hidden flex items-center justify-center w-9 h-9 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
              <Building className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm md:text-lg font-black text-foreground tracking-tight leading-none">
                {user?.name ? user.name : 'Dashboard'}
              </h2>
              <span className="text-[9px] md:hidden font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Portal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationBell notifications={notifications} unreadCount={unreadNotifications} />
            
            <Link href="/dashboard/profile" className="flex items-center gap-3 bg-slate-100/50 p-1 md:pl-4 md:pr-1.5 md:py-1.5 rounded-2xl border border-border/50 hover:bg-white hover:shadow-sm transition-all">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[11px] font-black text-foreground leading-none">{user?.name || 'Guest'}</span>
                <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${isSuperAdmin ? 'text-rose-500' : 'text-primary'}`}>
                  {isSuperAdmin ? 'Super' : 'Staff'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center text-primary font-black shadow-inner flex-shrink-0">
                {user?.image ? (
                  <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm">{(user?.name || 'U')[0]}</span>
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          {/* Mobile Tab Selector (App-like) */}
          <div className="xl:hidden mt-4 px-4 sticky top-0 z-[40]">
             <DashboardMobileNav tabs={allMobileTabs} />
          </div>

          <div className="p-4 md:p-8 lg:p-12 xl:p-16 max-w-[1920px] mx-auto animate-in fade-in duration-700">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
