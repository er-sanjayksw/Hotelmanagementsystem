import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Phone, Plus, Trash2, AlertTriangle, Shield, HeartPulse, HardHat } from "lucide-react";
import { createEmergencyContact, deleteEmergencyContact } from "@/lib/actions";

export default async function EmergencyContactsPage() {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;

  if (!vendorId) {
    return <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">Unauthorized</div>;
  }

  const contacts = await db.emergencyContact.findMany({
    where: { vendorId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Emergency Contacts</h2>
          <p className="text-slate-500 font-medium">Manage critical contact information for your property staff and guests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Add Contact Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-8">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>New Contact</span>
            </h3>
            
            <form action={createEmergencyContact} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contact Name</label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  placeholder="e.g., Local Police Station"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                <input 
                  name="phone" 
                  type="tel" 
                  required 
                  placeholder="e.g., 911 or Local Number"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Category</label>
                <select 
                  name="category" 
                  required 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                >
                  <option value="Police">Police / Security</option>
                  <option value="Hospital">Medical / Hospital</option>
                  <option value="Fire">Fire Department</option>
                  <option value="Maintenance">Maintenance / Utility</option>
                  <option value="Management">Management / Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Additional Notes (Optional)</label>
                <textarea 
                  name="notes" 
                  rows={3}
                  placeholder="Reference number, person to talk to, etc."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 text-base tracking-tight"
              >
                Add Contact
              </button>
            </form>
          </div>
        </div>

        {/* Contacts List */}
        <div className="lg:col-span-2 space-y-6">
          {contacts.length === 0 ? (
            <div className="bg-white p-20 rounded-[2.5rem] border border-slate-200 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-800">No Contacts Yet</h3>
              <p className="text-slate-500 mt-2 font-medium">Add your first emergency contact to have them ready in case of need.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contacts.map((contact) => (
                <div key={contact.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <CategoryIcon category={contact.category} />
                      <form action={async () => { "use server"; await deleteEmergencyContact(contact.id); }}>
                        <button type="submit" className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 leading-tight mb-1">{contact.name}</h4>
                    <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">{contact.category}</p>
                    
                    <div className="flex items-center gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-lg shadow-slate-200">
                      <Phone className="w-5 h-5 text-indigo-400" />
                      <span className="text-lg font-black tracking-tight">{contact.phone}</span>
                    </div>

                    {contact.notes && (
                      <p className="mt-4 text-xs font-medium text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{contact.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-sm text-amber-900">
              <p className="font-black text-lg tracking-tight mb-1">Stay Prepared</p>
              <p className="font-medium text-amber-700/80 max-w-xl">
                Always keep your emergency contacts up to date. These numbers are vital for guest safety and rapid response during critical incidents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case 'Police':
      return <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Shield className="w-6 h-6" /></div>;
    case 'Hospital':
      return <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><HeartPulse className="w-6 h-6" /></div>;
    case 'Fire':
      return <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>;
    case 'Maintenance':
      return <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><HardHat className="w-6 h-6" /></div>;
    default:
      return <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl"><Phone className="w-6 h-6" /></div>;
  }
}
