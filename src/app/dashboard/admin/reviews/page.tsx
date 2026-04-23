import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReviewsClient from "./ReviewsClient";

export default async function AdminReviewsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const reviews = await db.review.findMany({
    include: {
      user: true,
      hotel: true,
      room: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return <ReviewsClient reviews={reviews} />;
}
