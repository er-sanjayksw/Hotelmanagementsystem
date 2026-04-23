import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createRoom } from "@/lib/actions";
import AddRoomForm from "./AddRoomForm";

export default async function AddRoomPage() {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin && !vendorId) redirect("/auth/login");

  const hotels = await db.hotel.findMany({
    where: (!isSuperAdmin && vendorId) ? { vendorId } : undefined,
    select: { id: true, name: true }
  });
  
  const amenities = await db.roomAmenity.findMany({
    orderBy: { name: 'asc' }
  });

  if (hotels.length === 0) {
    redirect("/dashboard/property");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Room</h1>
        <p className="text-gray-500 mt-2">Create a new short-stay or long-stay room for your property.</p>
      </div>

      <AddRoomForm hotels={hotels} amenities={amenities} />
    </div>
  );
}
