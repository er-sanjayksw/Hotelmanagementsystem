import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import BookingsListClient from "@/components/BookingsListClient";

export default async function BookingsPage() {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  const bookings = await db.booking.findMany({
    where: (!isSuperAdmin && vendorId) ? { room: { hotel: { vendorId } } } : undefined,
    orderBy: { startTime: 'desc' },
    include: { 
      room: true,
      user: true, 
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Booking Management</h2>
        <p className="text-slate-500 font-medium">Monitor reservations, manage guest check-ins, and export performance data.</p>
      </div>

      <BookingsListClient initialBookings={bookings} />
    </div>
  );
}
