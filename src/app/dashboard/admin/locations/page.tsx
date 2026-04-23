import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import LocationsClient from "./LocationsClient";
import { redirect } from "next/navigation";

export default async function LocationsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const countries = await db.locationCountry.findMany({
    include: {
      districts: {
        include: { cities: true }
      }
    },
    orderBy: { name: "asc" }
  });

  return <LocationsClient countries={countries} />;
}
