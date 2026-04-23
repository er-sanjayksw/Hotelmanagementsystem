import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import UsersClient from "./UsersClient";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const users = await (db.user as any).findMany({
    orderBy: { createdAt: "desc" },
    include: {
      permissions: true
    }
  });

  return <UsersClient users={users} />;
}
