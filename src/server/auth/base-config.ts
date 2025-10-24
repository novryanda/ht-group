/**
 * Base NextAuth configuration - Edge Runtime compatible
 * This file MUST NOT import Prisma, bcrypt, or any Node.js-only modules
 * Shared between main auth config and edge auth config
 */
import { type NextAuthConfig } from "next-auth";

export const baseAuthConfig = {
  // Trust host for production deployment (required for custom domains)
  trustHost: true,
  
  // Cookie configuration for production
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-authjs.session-token" 
        : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Add user ID to token
        token.role = (user as any).role;
        token.companyCode = (user as any).companyCode;
        token.employeeId = (user as any).employeeId;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id; // Add user ID to session
        (session.user as any).role = token.role;
        (session.user as any).companyCode = token.companyCode;
        (session.user as any).employeeId = token.employeeId;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
} satisfies Omit<NextAuthConfig, "providers">;
