"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarItem({ href, icon, label, count }: { href: string, icon: React.ReactNode, label: string, count?: number }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <Link 
      href={href} 
      className={`flex items-center space-x-3 p-3.5 rounded-2xl transition-all duration-300 font-bold group relative ${
        isActive 
          ? 'bg-primary text-white shadow-xl shadow-primary/25 translate-x-1' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
      }`}
    >
      <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className="text-[14px] tracking-tight">{label}</span>
      
      {count && count > 0 ? (
        <span className={`ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-black transition-colors ${
          isActive 
            ? 'bg-white/20 text-white backdrop-blur-md border border-white/30' 
            : 'bg-primary text-white shadow-sm shadow-primary/20'
        }`}>
          {count}
        </span>
      ) : isActive ? (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)]"></div>
      ) : null}
    </Link>
  );
}
