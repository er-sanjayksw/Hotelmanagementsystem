import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import VerificationsClient from "./VerificationsClient";
import { redirect } from "next/navigation";

export default async function VerificationsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const documents = await db.userDocument.findMany({
    include: { user: true },
    orderBy: { uploadedAt: "desc" }
  });

  return <VerificationsClient documents={documents} />;
}
