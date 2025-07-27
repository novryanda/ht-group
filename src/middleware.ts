import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "@/generated/prisma"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login"]
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // If user is not authenticated, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Role-based route protection
    const userRole = token.role as UserRole

    // Admin routes - require ADMIN or SUPER_ADMIN role
    if (pathname.startsWith("/admin")) {
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Super admin routes - require SUPER_ADMIN role only
    if (pathname.startsWith("/super-admin")) {
      if (userRole !== UserRole.SUPER_ADMIN) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // Allow access to public routes
        const publicRoutes = ["/", "/login"]
        if (publicRoutes.includes(pathname)) {
          return true
        }

        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
