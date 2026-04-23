import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Hotel</h1>
          <p className="text-gray-500">Sign in to manage your property</p>
        </div>
        <form
          action={async (formData) => {
            "use server";
            try {
              await signIn("credentials", formData, { redirectTo: "/dashboard" });
            } catch (error) {
              if (error instanceof AuthError) {
                // Ignore AuthError on UI for simplicity in this demo, it will just not redirect
                // A complete implementation would return { error: "Invalid credentials" } to the form
                return;
              }
              throw error; // Rethrow RedirectError
            }
          }}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              name="email" 
              type="email" 
              placeholder="admin@hourlyplace.com" 
              required 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white rounded-xl p-3 font-semibold text-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
