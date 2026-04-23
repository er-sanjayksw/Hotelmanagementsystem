"use client";

import { useState } from "react";
import { Users, Mail, Phone, Calendar, Shield, Search, MoreVertical, Trash2, UserCheck, UserMinus, Edit2, X, Loader2, Plus, Lock, CheckCircle2 } from "lucide-react";
import { updateUser, createAdminUser, updateAdminPermissions } from "@/lib/actions";
import { ADMIN_PERMISSIONS } from "@/lib/constants";

export default function UsersClient({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(search.toLowerCase()) || 
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      isVerified: formData.get('isVerified') === 'true'
    };

    try {
      await updateUser(editingUser.id, data);
      if (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN') {
        await updateAdminPermissions(editingUser.id, selectedPermissions);
      }
      setEditingUser(null);
      setSelectedPermissions([]);
      window.location.reload(); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      permissions: selectedPermissions
    };

    try {
      await createAdminUser(data);
      setIsCreatingAdmin(false);
      setSelectedPermissions([]);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      setSelectedPermissions(user.permissions?.map((p: any) => p.permission) || []);
    } else {
      setSelectedPermissions([]);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      {/* Dynamic Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-foreground tracking-tight">Platform Users</h2>
          <p className="text-slate-500 font-medium text-xs md:text-lg">Manage all accounts and administrative permissions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 md:py-4 bg-card border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-medium text-sm"
            />
          </div>
          <button 
            onClick={() => setIsCreatingAdmin(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            <Plus size={16} className="md:w-[18px] md:h-[18px]" />
            Provision Admin
          </button>
        </div>
      </div>

      {/* Desktop View: Advanced Table */}
      <div className="hidden lg:block bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                <th className="p-8">User Details</th>
                <th className="p-8">Contact Info</th>
                <th className="p-8">Role & Status</th>
                <th className="p-8">Privileges</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-500 font-medium">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-border flex items-center justify-center text-slate-400 font-black">
                           {user.image ? <img src={user.image} className="w-full h-full object-cover rounded-2xl" /> : <span>{user.name[0]}</span>}
                        </div>
                        <div>
                          <div className="font-black text-foreground leading-none">{user.name}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase">ID: {user.id.split('-')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-600">
                        <div className="flex items-center gap-2"><Mail size={12} className="text-slate-400" /> {user.email}</div>
                        <div className="flex items-center gap-2"><Phone size={12} className="text-slate-400" /> {user.phoneCode} {user.phone}</div>
                      </div>
                    </td>
                    <td className="p-8">
                       <div className="flex flex-col gap-2">
                         <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                           user.role === 'SUPER_ADMIN' ? 'bg-rose-50 text-rose-600' : 
                           user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' :
                           user.role === 'VENDOR' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                         }`}>
                           {user.role === 'ADMIN' ? 'STAFF ADMIN' : user.role}
                         </span>
                         <div className="flex items-center gap-1.5 px-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.isVerified ? 'Verified' : 'Unverified'}</span>
                         </div>
                       </div>
                    </td>
                    <td className="p-8">
                       {user.role.includes('ADMIN') ? (
                         <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {user.permissions?.map((p: any) => (
                               <span key={p.id} className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">{p.permission.split('_')[1]}</span>
                            ))}
                         </div>
                       ) : <span className="text-[9px] font-bold text-slate-300 italic">N/A</span>}
                    </td>
                    <td className="p-8 text-right">
                       <button onClick={() => openEdit(user)} className="p-3 rounded-2xl text-primary hover:bg-primary/10 transition-all"><Edit2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View: High-Density Cards */}
      <div className="lg:hidden space-y-4">
         {filteredUsers.length === 0 ? (
           <div className="p-12 text-center bg-card border border-border rounded-3xl text-slate-400 text-xs font-bold uppercase tracking-widest italic">No users found</div>
         ) : (
           filteredUsers.map((user) => (
             <div key={user.id} className="bg-card border border-border rounded-3xl p-5 shadow-sm active:scale-[0.98] transition-transform">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-border flex items-center justify-center text-slate-400 font-black text-xs">
                         {user.image ? <img src={user.image} className="w-full h-full object-cover rounded-xl" /> : <span>{user.name[0]}</span>}
                      </div>
                      <div>
                         <div className="font-black text-foreground text-sm leading-none">{user.name}</div>
                         <div className={`text-[8px] font-black uppercase tracking-widest mt-1.5 px-2 py-0.5 rounded-full w-fit ${
                            user.role === 'SUPER_ADMIN' ? 'bg-rose-50 text-rose-600' : 
                            user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' :
                            user.role === 'VENDOR' ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-500'
                         }`}>
                            {user.role}
                         </div>
                      </div>
                   </div>
                   <button onClick={() => openEdit(user)} className="w-10 h-10 rounded-xl bg-slate-50 border border-border flex items-center justify-center text-primary">
                      <Edit2 size={16} />
                   </button>
                </div>
                
                <div className="grid grid-cols-1 gap-3 py-3 border-t border-border/50 mt-4">
                   <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                      <Mail size={12} className="text-slate-400" /> {user.email}
                   </div>
                   <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                      <Phone size={12} className="text-slate-400" /> {user.phoneCode} {user.phone}
                   </div>
                </div>

                {user.role.includes('ADMIN') && user.permissions?.length > 0 && (
                   <div className="mt-2 pt-3 border-t border-border/50 flex flex-wrap gap-1">
                      {user.permissions.map((p: any) => (
                        <span key={p.id} className="text-[7px] font-black bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          {p.permission.replace('MANAGE_', '')}
                        </span>
                      ))}
                   </div>
                )}
             </div>
           ))
         )}
      </div>

      {/* Provision Admin Modal (Mobile Optimized) */}
      {isCreatingAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[110] flex items-center justify-center p-4">
           <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              <div className="p-5 md:p-8 border-b border-border flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                 <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white">
                       <Shield size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                       <h3 className="text-base md:text-xl font-black text-foreground tracking-tight">Provision Admin</h3>
                       <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Role Provisioning</p>
                    </div>
                 </div>
                 <button onClick={() => setIsCreatingAdmin(false)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-card border border-border flex items-center justify-center text-slate-400">
                    <X size={16} className="md:w-5 md:h-5" />
                 </button>
              </div>
              <form onSubmit={handleCreateAdmin} className="p-5 md:p-8 overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-4 md:space-y-6">
                       <div>
                          <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Full Name</label>
                          <input name="name" type="text" required className="w-full p-3 md:p-4 bg-slate-50 border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm text-foreground" />
                       </div>
                       <div>
                          <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Email Address</label>
                          <input name="email" type="email" required className="w-full p-3 md:p-4 bg-slate-50 border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm text-foreground" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Phone</label>
                             <input name="phone" type="text" required className="w-full p-3 md:p-4 bg-slate-50 border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm text-foreground" />
                          </div>
                          <div>
                             <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Password</label>
                             <input name="password" type="password" required className="w-full p-3 md:p-4 bg-slate-50 border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm text-foreground" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                       <div>
                          <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Assign Privileges</label>
                          <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-border max-h-[200px] overflow-y-auto custom-scrollbar">
                             {ADMIN_PERMISSIONS.map(perm => (
                               <button key={perm} type="button" onClick={() => togglePermission(perm)} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left ${selectedPermissions.includes(perm) ? 'bg-primary border-primary text-white' : 'bg-white border-border text-slate-600'}`}>
                                  {selectedPermissions.includes(perm) ? <CheckCircle2 size={14} /> : <div className="w-3 h-3 rounded-full border border-slate-200" />}
                                  <span className="text-[9px] font-black uppercase tracking-tight">{perm.replace('MANAGE_', '').replace('_', ' ')}</span>
                               </button>
                             ))}
                          </div>
                       </div>
                       <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 text-sm tracking-tight flex items-center justify-center gap-2">
                          {loading ? <Loader2 className="animate-spin" size={20} /> : "Provision Account"}
                       </button>
                    </div>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Edit Modal (Mobile Optimized) */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[110] flex items-center justify-center p-4">
           <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              <div className="p-5 md:p-8 border-b border-border flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-base md:text-xl font-black text-foreground tracking-tight">Edit Profile</h3>
                 <button onClick={() => setEditingUser(null)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-card border border-border flex items-center justify-center text-slate-400"><X size={16} /></button>
              </div>
              <form onSubmit={handleUpdate} className="p-5 md:p-8 overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-4 md:space-y-6">
                       <div>
                          <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Full Name</label>
                          <input name="name" type="text" defaultValue={editingUser.name} required className="w-full p-3 md:p-4 bg-slate-50 border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm text-foreground" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Role</label>
                             <select name="role" defaultValue={editingUser.role} onChange={(e) => setSelectedRole(e.target.value)} className="w-full p-3 md:p-4 bg-slate-50 border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-xs text-foreground">
                                <option value="USER">User</option>
                                <option value="VENDOR">Vendor</option>
                                <option value="ADMIN">Staff Admin</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                             </select>
                          </div>
                          <div>
                             <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Verification</label>
                             <select name="isVerified" defaultValue={editingUser.isVerified ? 'true' : 'false'} className="w-full p-3 md:p-4 bg-slate-50 border border-border rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-xs text-foreground">
                                <option value="true">Verified</option>
                                <option value="false">Unverified</option>
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                       {(selectedRole === 'ADMIN' || selectedRole === 'SUPER_ADMIN') && (
                          <div>
                             <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Privileges</label>
                             <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-border max-h-[180px] overflow-y-auto custom-scrollbar">
                                {ADMIN_PERMISSIONS.map(perm => (
                                  <button key={perm} type="button" onClick={() => togglePermission(perm)} className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${selectedPermissions.includes(perm) ? 'bg-primary border-primary text-white' : 'bg-white border-border text-slate-600'}`}>
                                     {selectedPermissions.includes(perm) ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-200" />}
                                     <span className="text-[9px] font-black uppercase tracking-tight">{perm.replace('MANAGE_', '').replace('_', ' ')}</span>
                                  </button>
                                ))}
                             </div>
                          </div>
                       )}
                       <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 text-sm tracking-tight">
                          {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Update Profile"}
                       </button>
                    </div>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
