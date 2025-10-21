/**
 * Base NextAuth configuration - Edge Runtime compatible
 * This file MUST NOT import Prisma, bcrypt, or any Node.js-only modules
 * Shared between main auth config and edge auth config
 */
import { type NextAuthConfig } from "next-auth";

export const baseAuthConfig = {
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.companyCode = (user as any).companyCode;
        token.employeeId = (user as any).employeeId;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
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
