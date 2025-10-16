import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "../db";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Authorize called with:", { email: credentials?.email, hasPassword: !!credentials?.password });
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        try {
          // Find user by email and include employee data
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
            include: { 
              employee: {
                include: {
                  company: true
                }
              }
            }
          }) as any; // Type casting to avoid Prisma type issues

          console.log("Found user:", user ? {
            id: user.id,
            email: user.email,
            role: user.role,
            hasEmployee: !!user.employee
          } : null);

          if (!user?.password) {
            console.log("User not found or no password");
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          console.log("Authentication successful for:", user.email, "with role:", user.role);

          // Use the role from User table (primary source)
          const userRole = user.role;
          const isGroupLevel = userRole === "EXECUTIVE" || userRole === "GROUP_VIEWER";
          
          // Get company info from employee if exists
          const companyCode = user.employee?.company?.name || undefined;

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.employee?.nama || "User",
            role: userRole,
            companyCode: isGroupLevel ? undefined : companyCode,
            employeeId: user.employee?.id_karyawan,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
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
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};

declare module "next-auth" {
  interface User {
    role?: string;
    companyCode?: string;
    employeeId?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
      companyCode?: string;
      employeeId?: string;
    } & DefaultSession["user"];
  }
}
