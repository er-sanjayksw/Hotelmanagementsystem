"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardMobileNav({ tabs }: { tabs: { href: string, label: string, icon: React.ReactNode }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find(tab => tab.href === pathname || (tab.href !== '/dashboard' && pathname.startsWith(tab.href))) || tabs[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="lg:hidden relative w-full px-4 mb-6" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            {activeTab.icon}
          </div>
          <div className="flex flex-col items-start">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Current View</span>
             <span className="font-black text-foreground tracking-tight">{activeTab.label}</span>
          </div>
        </div>
        <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-border rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in slide-in-from-top-2 duration-200">
           <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              {tabs.map((tab) => {
                const isActive = tab.href === pathname || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
                return (
                  <Link 
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-2xl transition-colors ${
                      isActive 
                        ? 'bg-primary text-white font-black' 
                        : 'text-slate-600 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
                    <span className="text-sm tracking-tight">{tab.label}</span>
                    {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-white" />}
                  </Link>
                );
              })}
           </div>
        </div>
      )}
    </div>
  );
}
