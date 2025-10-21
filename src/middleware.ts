/**
 * Optimized middleware for Edge Runtime
 * Uses lightweight RBAC functions and minimal dependencies
 * Middleware automatically runs on Edge Runtime in Next.js
 * 
 * IMPORTANT: This middleware must be Edge-compatible.
 * Do NOT import Prisma, bcryptjs, or any Node.js-only modules here.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API routes and static files - allow through
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  const isLoginPage = pathname === "/login";
  const isUnauthorizedPage = pathname === "/unauthorized";
  const isPublicRoute = isLoginPage || isUnauthorizedPage;

  // Get session from NextAuth using auth-token cookie
  // NextAuth v5 stores session in encrypted JWT cookie
  const sessionCookie = req.cookies.get("authjs.session-token") || 
                        req.cookies.get("__Secure-authjs.session-token");

  // If no session cookie exists
  if (!sessionCookie) {
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

  // For authenticated routes, we need to decode the JWT
  // Use Edge-compatible auth that doesn't import Prisma/bcryptjs
  try {
    // Import edgeAuth which is safe for Edge Runtime
    const { edgeAuth } = await import("~/server/auth/edge");
    
    // Get session using NextAuth's Edge-compatible auth helper
    const session = await edgeAuth();

    // If session doesn't exist despite cookie (expired/invalid)
    if (!session) {
      if (isPublicRoute) {
        return NextResponse.next();
      }

      const loginUrl = new URL("/login", req.url);
      if (pathname !== "/") {
        loginUrl.searchParams.set("callbackUrl", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    // Cast to lightweight session type
    const liteSession: LiteSession = session;

    // If trying to access login page, redirect to user's default dashboard
    if (isLoginPage) {
      const defaultPath = getDefaultRedirectPath(liteSession);
      return NextResponse.redirect(new URL(defaultPath, req.url));
    }

    // If accessing root, redirect to user's default dashboard
    if (pathname === "/") {
      const defaultPath = getDefaultRedirectPath(liteSession);
      return NextResponse.redirect(new URL(defaultPath, req.url));
    }

    // Check role-based permissions for protected routes
    if (!isPublicRoute) {
      if (!hasRouteAccess(liteSession, pathname)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("❌ Middleware error:", error);
    
    // If there's an error in middleware, allow public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }
    
    // For protected routes, redirect to login on error
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

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