import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');

  if (isApiAuthRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', req.nextUrl));
    }
    return;
  }

  if (!isLoggedIn && isDashboardRoute) {
    return Response.redirect(new URL('/auth/login', req.nextUrl));
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
