/**
 * Optimized middleware for Edge Runtime
 * Uses lightweight RBAC functions and minimal dependencies
 * Middleware automatically runs on Edge Runtime in Next.js
 */
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { 
  canAccessRoute, 
  getDefaultRedirectPath,
  type LiteSession 
} from "~/lib/rbac-lite";

function hasRouteAccess(session: LiteSession, pathname: string): boolean {
  // Allow access to general routes
  if (pathname === "/" || pathname === "/dashboard" || pathname === "/unauthorized") {
    return true;
  }

  // Check PT-specific route access using RBAC
  return canAccessRoute(session, pathname);
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // API routes and static files - allow through
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  const isLoginPage = pathname === "/login";
  const isUnauthorizedPage = pathname === "/unauthorized";
  const isPublicRoute = isLoginPage || isUnauthorizedPage;

  // If user is not authenticated
  if (!req.auth) {
    // Allow access to public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Redirect to login for all other routes
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated - cast to lightweight session type
  const session: LiteSession = req.auth;

  // If trying to access login page, redirect to user's default dashboard
  if (isLoginPage) {
    const defaultPath = getDefaultRedirectPath(session);
    return NextResponse.redirect(new URL(defaultPath, req.url));
  }

  // If accessing root, redirect to user's default dashboard
  if (pathname === "/") {
    const defaultPath = getDefaultRedirectPath(session);
    return NextResponse.redirect(new URL(defaultPath, req.url));
  }

  // Check role-based permissions for protected routes
  if (!isPublicRoute) {
    if (!hasRouteAccess(session, pathname)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};