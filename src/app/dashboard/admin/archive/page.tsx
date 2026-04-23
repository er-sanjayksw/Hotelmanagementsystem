import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import ArchiveClient from "./ArchiveClient";
import { redirect } from "next/navigation";

export default async function ArchivePage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const archivedHotels = await db.hotel.findMany({
    where: { isArchived: true },
    include: { 
      vendor: {
        include: { user: true }
      },
      rooms: {
        include: { bookings: true }
      },
      reviews: true,
      images: true
    },
    orderBy: { archivedAt: "desc" }
  });

  const archivedVendors = await db.vendor.findMany({
    where: { isArchived: true },
    include: { user: true },
    orderBy: { archivedAt: "desc" }
  });

  return (
    <ArchiveClient 
      archivedHotels={archivedHotels} 
      archivedVendors={archivedVendors} 
    />
  );
}
