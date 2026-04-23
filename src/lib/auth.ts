import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await (db.user as any).findUnique({ 
          where: { email: credentials.email as string },
          include: { 
            vendorProfile: true,
            permissions: true 
          }
        });
        
        if (!user) return null;

        const isBcrypt = user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$");
        const isValid = isBcrypt 
          ? await bcryptjs.compare(credentials.password as string, user.passwordHash)
          : user.passwordHash === credentials.password;

        if (!isValid) return null;
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          vendorId: user.vendorProfile?.id || null,
          permissions: user.permissions?.map((p: any) => p.permission) || []
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.image = token.image as string | null;
        (session.user as any).role = token.role as string;
        (session.user as any).vendorId = token.vendorId as string | null;
        (session.user as any).permissions = token.permissions as string[] || [];
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.vendorId = (user as any).vendorId;
        token.image = (user as any).image;
        token.permissions = (user as any).permissions;
      }
      return token;
    }
  }
});
