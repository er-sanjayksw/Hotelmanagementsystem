import Link from "next/link";
import { Home, ArrowLeft, Search, Building } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Visual Element */}
        <div className="relative">
          <div className="text-[20rem] font-black text-slate-100 leading-none select-none">404</div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <div className="w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-primary/40 mb-6 rotate-12">
                <Building size={48} />
             </div>
             <h1 className="text-5xl font-black text-slate-900 tracking-tight">Lost in the Lobby?</h1>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 max-w-md mx-auto">
          <p className="text-xl text-slate-500 font-medium leading-relaxed">
            We couldn't find the page you're looking for. It might have been moved or archived.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
           <Link 
             href="/dashboard" 
             className="group flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
           >
             <Home size={22} className="group-hover:-translate-y-1 transition-transform" />
             Back to Dashboard
           </Link>
           
           <Link 
             href="/" 
             className="flex items-center gap-3 px-8 py-5 bg-white border border-border text-slate-600 rounded-[2rem] font-black text-lg hover:bg-slate-50 transition-all shadow-sm"
           >
             <ArrowLeft size={22} />
             Return Home
           </Link>
        </div>

        {/* Search Suggestion */}
        <div className="pt-12 border-t border-slate-200 inline-block px-12">
           <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
              <Search size={14} />
              Need help? Contact support or try searching again.
           </div>
        </div>
      </div>
    </div>
  );
}
