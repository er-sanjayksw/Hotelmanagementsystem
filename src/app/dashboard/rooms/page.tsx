import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import RoomsListClient from "@/components/RoomsListClient";

export default async function RoomsPage() {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  const rooms = await db.room.findMany({
    where: (!isSuperAdmin && vendorId) ? { hotel: { vendorId } } : undefined,
    orderBy: { title: 'asc' },
    include: { 
      pricing: true, 
      images: true,
      amenities: {
        include: {
          amenity: true
        }
      }
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Room Management</h2>
        <p className="text-slate-500 font-medium">Create and manage your property's room inventory and pricing.</p>
      </div>

      <RoomsListClient initialRooms={rooms} />
    </div>
  );
}
