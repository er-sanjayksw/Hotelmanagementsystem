import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return <div>Unauthorized</div>;

  const profile = await db.user.findUnique({
    where: { id: userId },
    include: { vendorProfile: true }
  });

  if (!profile) return <div>Access Restricted</div>;

  return <ProfileClient profile={profile} />;
}
