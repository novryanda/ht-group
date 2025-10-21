/**
 * Edge-compatible auth config for middleware
 * This file MUST NOT import Prisma, bcrypt, or any Node.js-only modules
 * to keep Edge Function bundle size small
 */
import { type NextAuthConfig } from "next-auth";

export const edgeAuthConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
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
  // No providers here - they're only needed in the main config
  providers: [],
};
