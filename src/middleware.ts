import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection rules:
 * - `/dashboard/*`  — requires authentication
 * - `/admin/*`      — requires authentication AND ADMIN role
 * Unauthenticated users are redirected to `/login`.
 * Authenticated non-admins accessing admin routes receive a 403.
 */
export default auth((req: NextRequest & { auth: Awaited<ReturnType<typeof auth>> }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isDashboardRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // Not authenticated — redirect to login, preserving the intended destination
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated but lacks ADMIN role for admin routes
  if (isAdminRoute && session.user?.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  // Avoid running middleware on Next.js internals, static assets, and API
  // routes that handle their own auth (e.g. the NextAuth handler itself).
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
