import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import AmenitiesClient from "./AmenitiesClient";
import { redirect } from "next/navigation";

export default async function AmenitiesPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const hotelAmenities = await db.hotelAmenity.findMany({
    orderBy: { name: "asc" }
  });

  const roomAmenities = await db.roomAmenity.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <AmenitiesClient 
      hotelAmenities={hotelAmenities} 
      roomAmenities={roomAmenities} 
    />
  );
}
