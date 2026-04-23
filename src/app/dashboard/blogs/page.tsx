import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { FileText, Plus } from "lucide-react";

export default async function BlogsPage() {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  const blogs = await db.blog.findMany({
    where: (!isSuperAdmin && vendorId) ? { vendorId } : undefined,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Content Blog</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" />
          <span>Write Post</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {blogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>You have not published any promotional blogs yet.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Published</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blogs.map(blog => (
                <tr key={blog.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-900">{blog.title}</td>
                  <td className="p-4 text-gray-600">{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button className="text-blue-600 font-medium text-sm hover:underline mr-3">Edit</button>
                    <button className="text-red-600 font-medium text-sm hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
