import { NextResponse } from "next/server";
import { auth } from "~/server/auth";

// Define route permissions
const routePermissions: Record<string, string[]> = {
  // Dashboard - accessible to all authenticated users
  "/dashboard": ["GROUP_VIEWER", "EXECUTIVE", "PT_MANAGER", "UNIT_SUPERVISOR", "TECHNICIAN", "OPERATOR", "HR", "FINANCE_AR", "FINANCE_AP", "GL_ACCOUNTANT"],

  // PT NILO routes
  "/pt-nilo": ["PT_MANAGER", "UNIT_SUPERVISOR", "TECHNICIAN", "OPERATOR", "HR", "FINANCE_AR", "FINANCE_AP", "GL_ACCOUNTANT"],
  "/pt-nilo/hvac-rittal": ["PT_MANAGER", "UNIT_SUPERVISOR", "TECHNICIAN", "OPERATOR"],
  "/pt-nilo/hvac-split": ["PT_MANAGER", "UNIT_SUPERVISOR", "TECHNICIAN", "OPERATOR"],
  "/pt-nilo/fabrikasi": ["PT_MANAGER", "UNIT_SUPERVISOR", "TECHNICIAN", "OPERATOR"],
  "/pt-nilo/efluen": ["PT_MANAGER", "UNIT_SUPERVISOR", "TECHNICIAN", "OPERATOR"],
  "/pt-nilo/hr": ["PT_MANAGER", "HR"],
  "/pt-nilo/finance": ["PT_MANAGER", "FINANCE_AR", "FINANCE_AP", "GL_ACCOUNTANT"],
  "/pt-nilo/master": ["PT_MANAGER"],

  // Other PT routes
  "/pt-zta": ["PT_MANAGER", "UNIT_SUPERVISOR", "TECHNICIAN", "OPERATOR", "HR", "FINANCE_AR", "FINANCE_AP", "GL_ACCOUNTANT"],
  "/pt-tam": ["PT_MANAGER", "UNIT_SUPERVISOR", "TECHNICIAN", "OPERATOR", "HR", "FINANCE_AR", "FINANCE_AP", "GL_ACCOUNTANT"],
  "/pt-htk": ["PT_MANAGER", "UNIT_SUPERVISOR", "TECHNICIAN", "OPERATOR", "HR", "FINANCE_AR", "FINANCE_AP", "GL_ACCOUNTANT"],
};

function hasPermission(userRole: string, pathname: string): boolean {
  // Check exact match first
  if (routePermissions[pathname]) {
    return routePermissions[pathname].includes(userRole);
  }

  // Check parent paths
  const pathSegments = pathname.split("/").filter(Boolean);
  for (let i = pathSegments.length; i > 0; i--) {
    const parentPath = "/" + pathSegments.slice(0, i).join("/");
    if (routePermissions[parentPath]) {
      return routePermissions[parentPath].includes(userRole);
    }
  }

  // Default: allow access for authenticated users to dashboard
  return pathname === "/";
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

  // User is authenticated

  // If trying to access login page, redirect to dashboard
  if (isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Check role-based permissions for protected routes
  if (!isPublicRoute) {
    const userRole = req.auth.user?.role as string;

    if (!hasPermission(userRole, pathname)) {
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