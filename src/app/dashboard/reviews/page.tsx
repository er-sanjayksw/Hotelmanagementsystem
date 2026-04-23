import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Star, MessageSquare } from "lucide-react";

export default async function ReviewsPage() {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  const reviews = await db.review.findMany({
    where: (!isSuperAdmin && vendorId) ? { hotel: { vendorId } } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { hotel: true, user: true, room: true }
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customer Reviews</h2>
        <p className="text-gray-500 mt-1">Manage feedback across your properties</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No reviews have been submitted yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map(review => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{review.user.name}</h4>
                    <p className="text-sm text-gray-500">
                      {review.hotel.name} {review.room ? `• ${review.room.title}` : ''}
                    </p>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic mt-3 text-sm">"{review.comment}"</p>
                <div className="text-xs text-gray-400 mt-3">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
