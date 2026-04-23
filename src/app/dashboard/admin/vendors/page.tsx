import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import VendorsClient from "./VendorsClient";
import { redirect } from "next/navigation";

export default async function VendorsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const vendors = await db.vendor.findMany({
    include: { 
      user: true,
      hotels: true 
    },
    orderBy: { createdAt: "desc" }
  });

  return <VendorsClient vendors={vendors} />;
}
