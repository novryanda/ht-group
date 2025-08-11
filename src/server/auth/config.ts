import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";

// Define UserRole enum locally for now
type UserRole =
  | "GROUP_VIEWER"
  | "EXECUTIVE"
  | "PT_MANAGER"
  | "UNIT_SUPERVISOR"
  | "TECHNICIAN"
  | "OPERATOR"
  | "HR"
  | "FINANCE_AR"
  | "FINANCE_AP"
  | "GL_ACCOUNTANT";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      employeeId?: string;
      companyId?: string;
      unitId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    employeeId?: string;
    companyId?: string;
    unitId?: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For demo purposes, we'll use hardcoded users
        // In production, you should query the database and verify hashed passwords
        const demoUsers = [
          {
            id: "1",
            email: "admin@ht-group.com",
            name: "Administrator",
            role: "PT_MANAGER" as UserRole,
            employeeId: "emp-001",
            companyId: "comp-001",
            unitId: "unit-001",
          },
          {
            id: "2",
            email: "supervisor@ht-group.com",
            name: "Unit Supervisor",
            role: "UNIT_SUPERVISOR" as UserRole,
            employeeId: "emp-002",
            companyId: "comp-001",
            unitId: "unit-001",
          },
          {
            id: "3",
            email: "technician@ht-group.com",
            name: "Technician",
            role: "TECHNICIAN" as UserRole,
            employeeId: "emp-003",
            companyId: "comp-001",
            unitId: "unit-001",
          },
        ];

        const user = demoUsers.find(u => u.email === credentials.email);

        if (!user) {
          return null;
        }

        // Simple password check for demo
        const isPasswordValid = credentials.password === "password123";

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null,
          role: user.role,
          employeeId: user.employeeId,
          companyId: user.companyId,
          unitId: user.unitId,
        };
      },
    }),
    DiscordProvider,
  ],
  // adapter: PrismaAdapter(db), // Disabled for JWT strategy
  callbacks: {
    session: ({ session, user, token }) => {
      if (token) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub!,
            role: token.role as UserRole,
            employeeId: token.employeeId as string,
            companyId: token.companyId as string,
            unitId: token.unitId as string,
          },
        };
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: (user as any).role,
          employeeId: (user as any).employeeId,
          companyId: (user as any).companyId,
          unitId: (user as any).unitId,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.role = (user as any).role;
        token.employeeId = (user as any).employeeId;
        token.companyId = (user as any).companyId;
        token.unitId = (user as any).unitId;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
