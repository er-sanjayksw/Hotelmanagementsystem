"use client";

import { useState } from "react";
import { Star, User, Building, Calendar, MessageSquare, Trash2, Edit2, X, Check, Loader2, Search, Filter } from "lucide-react";
import { updateReview, deleteReview } from "@/lib/actions";

export default function ReviewsClient({ reviews }: { reviews: any[] }) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const filteredReviews = reviews.filter(review => 
    review.user.name?.toLowerCase().includes(search.toLowerCase()) || 
    review.hotel.name?.toLowerCase().includes(search.toLowerCase()) ||
    review.comment?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setLoadingId(id);
    try {
      await deleteReview(id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdate = async () => {
    setLoadingId(editingReview.id);
    try {
      await updateReview(editingReview.id, { 
        rating: editRating, 
        comment: editComment 
      });
      setEditingReview(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Guest Reviews</h2>
          <p className="text-slate-500 font-medium text-lg">Monitor and manage guest feedback across all properties.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search reviews, hotels, or users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredReviews.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-[2.5rem] p-20 text-center">
             <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No reviews found matching your search</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
               <div className="p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                     <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shadow-inner overflow-hidden">
                           {review.user.image ? (
                             <img src={review.user.image} className="w-full h-full object-cover" />
                           ) : (
                             <span>{(review.user.name || 'U')[0]}</span>
                           )}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="font-black text-foreground text-lg">{review.user.name}</span>
                              <div className="flex gap-0.5">
                                 {[...Array(5)].map((_, i) => (
                                   <Star key={i} size={14} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                                 ))}
                              </div>
                           </div>
                           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                              <Calendar size={12} />
                              {new Date(review.createdAt).toLocaleDateString()}
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-3 ml-auto">
                        <button 
                          onClick={() => {
                            setEditingReview(review);
                            setEditRating(review.rating);
                            setEditComment(review.comment || "");
                          }}
                          className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                        >
                           <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(review.id)}
                          disabled={loadingId === review.id}
                          className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-50"
                        >
                           {loadingId === review.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                     </div>
                  </div>

                  <div className="mt-6">
                     <div className="p-5 bg-slate-50/50 rounded-2xl border border-border italic text-slate-600 font-medium leading-relaxed">
                        "{review.comment}"
                     </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4">
                     <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-border rounded-xl">
                        <Building size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{review.hotel.name}</span>
                     </div>
                     {review.room && (
                       <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-border rounded-xl">
                          <Star size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{review.room.title}</span>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-card rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-border flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-xl font-black text-foreground tracking-tight">Moderate Review</h3>
                 <button onClick={() => setEditingReview(null)} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all shadow-sm">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Rating Control</label>
                    <div className="flex gap-3">
                       {[1, 2, 3, 4, 5].map((star) => (
                         <button 
                           key={star} 
                           onClick={() => setEditRating(star)}
                           className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                             editRating >= star ? 'bg-amber-400 text-white shadow-lg shadow-amber-100' : 'bg-slate-100 text-slate-300'
                           }`}
                         >
                            <Star size={24} className={editRating >= star ? "fill-current" : ""} />
                         </button>
                       ))}
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Review Comment</label>
                    <textarea 
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={4}
                      className="w-full p-4 bg-slate-50 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-foreground resize-none"
                    />
                 </div>
                 <div className="pt-4">
                    <button 
                      onClick={handleUpdate}
                      disabled={loadingId === editingReview.id}
                      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 text-base tracking-tight"
                    >
                       {loadingId === editingReview.id ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Update Review"}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
