"use client";

import { useState, useRef } from "react";
import { User, ShieldCheck, Camera, Loader2 } from "lucide-react";
import { updateProfileImage } from "@/lib/actions";

export default function ProfileClient({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(profile.image);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const newUrl = await updateProfileImage(formData);
      setCurrentImage(newUrl);
      // Optional: window.location.reload() to force navbar update if session is stale
      // But revalidatePath should handle it on next navigation
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h2>
        <p className="text-slate-500 font-medium">Manage your personal information and business credentials.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
        <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-indigo-600 font-black text-3xl">
              {currentImage ? (
                <img src={currentImage} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{profile.name[0]}</span>
              )}
              {loading && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-3 rounded-2xl shadow-lg hover:scale-110 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="text-center md:text-left flex-1">
            <h3 className="text-2xl font-black text-slate-900 flex items-center justify-center md:justify-start tracking-tight">
              {profile.name}
              {profile.isVerified && (
                <div className="ml-3 p-1 bg-emerald-50 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
              )}
            </h3>
            <p className="text-slate-500 font-medium mt-1">{profile.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-full">
                {profile.phoneCode} {profile.phone}
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 font-bold text-[10px] uppercase tracking-widest rounded-full">
                {profile.vendorProfile?.approvalStatus || profile.role}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-10 bg-slate-50/30">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Business Profile Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Business Name</label>
              <div className="font-black text-slate-800 text-lg tracking-tight">{profile.vendorProfile?.businessName || 'N/A'}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Account Status</label>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${profile.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <div className="font-black text-slate-800 text-lg tracking-tight">
                  {profile.isVerified ? 'Verified Account' : 'Pending Verification'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
