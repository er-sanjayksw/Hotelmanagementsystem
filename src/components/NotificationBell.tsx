"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, ExternalLink, X, Info, AlertCircle } from "lucide-react";
import { markNotificationAsRead } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function NotificationBell({ notifications, unreadCount }: { notifications: any[], unreadCount: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mapLegacyLink = (link: string) => {
    if (!link) return link;
    
    // Map legacy vendor links
    if (link.includes('/dashboard/vendor?tab=BOOKINGS')) return '/dashboard/bookings';
    if (link.includes('/dashboard/vendor?tab=REVIEWS')) return '/dashboard/reviews';
    if (link.includes('/dashboard/vendor?tab=PROPERTY')) return '/dashboard/property';
    if (link.includes('/dashboard/vendor?tab=ROOMS')) return '/dashboard/rooms';
    
    // Map legacy admin links
    if (link.includes('/dashboard/admin/dashboard')) {
      if (link.includes('tab=VENDORS')) return '/dashboard/admin/vendors';
      if (link.includes('tab=VERIFICATIONS')) return '/dashboard/admin/verifications';
      if (link.includes('tab=LOCATIONS')) return '/dashboard/admin/locations';
      if (link.includes('tab=AMENITIES')) return '/dashboard/admin/amenities';
      if (link.includes('tab=ARCHIVED_DATA')) return '/dashboard/admin/archive';
      if (link.includes('tab=REVIEWS')) return '/dashboard/admin/reviews';
      if (link.includes('tab=ALL_USERS')) return '/dashboard/admin/users';
      return '/dashboard/admin/vendors'; // Fallback for admin
    }
    
    return link;
  };

  const handleNotificationClick = async (notif: any) => {
    // If notification is already read, the link is inactive
    if (notif.isRead) return;

    // Mark as read
    try {
      await markNotificationAsRead(notif.id);
    } catch (e) {
      console.error(e);
    }
    
    // Redirect if a link exists
    if (notif.link) {
      const targetLink = mapLegacyLink(notif.link);
      router.push(targetLink);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-2xl bg-slate-50 border border-border flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white hover:shadow-sm transition-all relative group"
      >
        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm shadow-rose-100 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 top-[85px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-4 sm:w-96 bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden z-[110] animate-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-border bg-slate-50/50 flex justify-between items-center">
             <h3 className="font-black text-foreground tracking-tight">Recent Notifications</h3>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{unreadCount} Unread</span>
                <button onClick={() => setIsOpen(false)} className="sm:hidden w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-slate-400">
                   <X size={14} />
                </button>
             </div>
          </div>

          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                 <Bell size={32} className="mx-auto mb-4 opacity-20" />
                 <p className="text-xs font-black uppercase tracking-widest">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-6 border-b border-border last:border-b-0 transition-all group relative ${
                    !notif.isRead 
                      ? 'bg-primary/5 cursor-pointer hover:bg-slate-50' 
                      : 'bg-white opacity-70 cursor-default'
                  }`}
                >
                   <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                        !notif.isRead ? 'bg-primary text-white shadow-lg shadow-primary/20 group-hover:scale-110' : 'bg-slate-100 text-slate-300'
                      }`}>
                         {notif.title.toLowerCase().includes('alert') ? <AlertCircle size={18} /> : <Info size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm font-black tracking-tight truncate pr-4 ${!notif.isRead ? 'text-foreground' : 'text-slate-500'}`}>{notif.title}</h4>
                            {!notif.isRead && (
                              <div className="w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/50 flex-shrink-0 mt-1.5" />
                            )}
                         </div>
                         <p className={`text-xs font-medium leading-relaxed mb-3 line-clamp-3 ${!notif.isRead ? 'text-slate-700' : 'text-slate-400'}`}>
                           {notif.message}
                         </p>
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {!notif.isRead && notif.link && (
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                View Details <ExternalLink size={10} />
                              </div>
                            )}
                            {notif.isRead && (
                              <div className="flex items-center gap-1 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                <Check size={10} /> Viewed
                              </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-slate-50/50 text-center border-t border-border">
             <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">Clear All History</button>
          </div>
        </div>
      )}
    </div>
  );
}
