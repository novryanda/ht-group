/**
 * RBAC Lite - Edge-compatible version for middleware
 * No external dependencies, pure TypeScript only
 * Optimized for Edge Runtime (Vercel Edge Functions)
 */

export type UserRole =
  | "GROUP_VIEWER"
  | "EXECUTIVE"
  | "PT_MANAGER"
  | "PT_NILO_ADMIN"
  | "PT_ZTA_ADMIN"
  | "PT_TAM_ADMIN"
  | "PT_HTK_ADMIN"
  | "PT_PKS_ADMIN"
  | "UNIT_SUPERVISOR"
  | "TECHNICIAN"
  | "OPERATOR"
  | "HR"
  | "FINANCE_AR"
  | "FINANCE_AP"
  | "GL_ACCOUNTANT";

export interface PTCompany {
  code: string;
  name: string;
  adminRole: UserRole;
  dashboardPath: string;
}

export const PT_COMPANIES: PTCompany[] = [
  {
    code: "PT-NILO",
    name: "PT NILO",
    adminRole: "PT_NILO_ADMIN",
    dashboardPath: "/dashboard/pt-nilo",
  },
  {
    code: "PT-ZTA",
    name: "PT ZTA",
    adminRole: "PT_ZTA_ADMIN",
    dashboardPath: "/dashboard/pt-zta",
  },
  {
    code: "PT-TAM",
    name: "PT TAM",
    adminRole: "PT_TAM_ADMIN",
    dashboardPath: "/dashboard/pt-tam",
  },
  {
    code: "PT-HTK",
    name: "PT HTK",
    adminRole: "PT_HTK_ADMIN",
    dashboardPath: "/dashboard/pt-htk",
  },
  {
    code: "PT-PKS",
    name: "PT PKS",
    adminRole: "PT_PKS_ADMIN",
    dashboardPath: "/dashboard/pt-pks",
  },
];

/**
 * Lightweight session type for middleware
 */
export interface LiteSession {
  user?: {
    role?: string;
    companyCode?: string;
  };
}

/**
 * Check if user has access to a specific PT company
 */
export function hasCompanyAccess(session: LiteSession | null, companyCode: string): boolean {
  if (!session?.user) return false;

  const { role, companyCode: userCompanyCode } = session.user;

  // Executives and group viewers can access all companies
  if (role === "EXECUTIVE" || role === "GROUP_VIEWER") {
    return true;
  }

  // PT-specific admins can only access their assigned company
  const ptCompany = PT_COMPANIES.find(pt => pt.code === companyCode);
  if (ptCompany && role === ptCompany.adminRole) {
    return true;
  }

  // Other roles can access if they belong to the company
  return userCompanyCode === companyCode;
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(session: LiteSession | null, route: string): boolean {
  if (!session?.user) return false;

  const { role } = session.user;

  // Executives and group viewers can access all routes
  if (role === "EXECUTIVE" || role === "GROUP_VIEWER") {
    return true;
  }

  // Check if route is PT-specific (now under /dashboard/pt-*)
  for (const pt of PT_COMPANIES) {
    if (route.startsWith(`/dashboard/${pt.code.toLowerCase()}`)) {
      return hasCompanyAccess(session, pt.code);
    }
  }

  // Allow access to general routes
  return true;
}

/**
 * Get the default redirect path for a user after login
 */
export function getDefaultRedirectPath(session: LiteSession | null): string {
  if (!session?.user) return "/login";

  const { role, companyCode } = session.user;

  // Executives go to main dashboard
  if (role === "EXECUTIVE" || role === "GROUP_VIEWER") {
    return "/dashboard";
  }

  // PT admins go to their specific dashboard
  const ptCompany = PT_COMPANIES.find(pt => pt.adminRole === role);
  if (ptCompany) {
    return ptCompany.dashboardPath;
  }

  // If user has company code, try to find matching PT
  if (companyCode) {
    const matchingPT = PT_COMPANIES.find(pt => pt.code === companyCode);
    if (matchingPT) {
      return matchingPT.dashboardPath;
    }
  }

  // Default fallback
  return "/dashboard";
}

/**
 * Get company code from route path
 */
export function getCompanyCodeFromRoute(route: string): string | null {
  for (const pt of PT_COMPANIES) {
    const ptPath = `/dashboard/${pt.code.toLowerCase()}`;
    if (route.startsWith(ptPath)) {
      return pt.code;
    }
  }
  return null;
}
