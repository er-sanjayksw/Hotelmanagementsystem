import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import AvailabilityGrid from "@/components/AvailabilityGrid";
import { Building, Calendar } from "lucide-react";

export default async function AvailabilityPage({ searchParams }: { searchParams: any }) {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  const { date } = await searchParams;
  const selectedDate = date ? new Date(date) : new Date();

  if (!isSuperAdmin && !vendorId) {
    return <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">Unauthorized</div>;
  }

  // Fetch all rooms for this vendor
  const rooms = await db.room.findMany({
    where: !isSuperAdmin ? { hotel: { vendorId } } : undefined,
    include: {
      bookings: {
        where: {
          status: { in: ["PENDING", "ACCEPTED", "CHECKED_IN", "CONFIRMED"] }
        },
        include: { user: true }
      },
      hotel: true
    }
  });

  if (rooms.length === 0) {
    return (
      <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
        <Building className="w-16 h-16 text-slate-200 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">No Rooms Found</h2>
        <p className="text-slate-500 mt-2 font-medium">Add some rooms first to see their availability.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Availability Grid</h2>
          <p className="text-slate-500 font-medium">Live timeline of your property's occupancy</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-x-auto overflow-y-visible">
        <AvailabilityGrid rooms={rooms} initialDate={selectedDate.toISOString().split('T')[0]} />
      </div>
    </div>
  );
}
