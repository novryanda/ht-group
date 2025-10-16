import type { Session } from "next-auth";

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
 * Check if user has access to a specific PT company
 */
export function hasCompanyAccess(session: Session | null, companyCode: string): boolean {
  if (!session?.user) return false;

  const { role, companyCode: userCompanyCode } = session.user as any;

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
 * Get the user's assigned PT company
 */
export function getUserPTCompany(session: Session | null): PTCompany | null {
  if (!session?.user) return null;

  const { role, companyCode } = session.user as any;

  // Find PT company by role
  const ptByRole = PT_COMPANIES.find(pt => pt.adminRole === role);
  if (ptByRole) return ptByRole;

  // Find PT company by company code
  if (companyCode) {
    return PT_COMPANIES.find(pt => pt.code === companyCode) || null;
  }

  return null;
}

/**
 * Get all PT companies the user can access
 */
export function getAccessiblePTCompanies(session: Session | null): PTCompany[] {
  if (!session?.user) return [];

  const { role } = session.user as any;

  // Executives and group viewers can access all companies
  if (role === "EXECUTIVE" || role === "GROUP_VIEWER") {
    return PT_COMPANIES;
  }

  // PT-specific admins can only access their assigned company
  const userPT = getUserPTCompany(session);
  return userPT ? [userPT] : [];
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(session: Session | null, route: string): boolean {
  if (!session?.user) return false;

  const { role } = session.user as any;

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
export function getDefaultRedirectPath(session: Session | null): string {
  if (!session?.user) return "/login";

  const { role } = session.user as any;

  // Executives go to main dashboard
  if (role === "EXECUTIVE" || role === "GROUP_VIEWER") {
    return "/dashboard";
  }

  // PT admins go to their specific dashboard
  const userPT = getUserPTCompany(session);
  if (userPT) {
    return userPT.dashboardPath;
  }

  // Default fallback
  return "/dashboard";
}

/**
 * Check if user has admin privileges for any PT
 */
export function isPTAdmin(session: Session | null): boolean {
  if (!session?.user) return false;

  const { role } = session.user as any;
  return PT_COMPANIES.some(pt => pt.adminRole === role);
}

/**
 * Check if user is a group-level user (can see all PTs)
 */
export function isGroupLevelUser(session: Session | null): boolean {
  if (!session?.user) return false;

  const { role } = session.user as any;
  return role === "EXECUTIVE" || role === "GROUP_VIEWER";
}

/**
 * Filter menu items based on user's access
 */
export function filterMenuItemsByAccess(session: Session | null, menuItems: any[]): any[] {
  if (!session?.user) return [];

  const accessiblePTs = getAccessiblePTCompanies(session);
  
  // If user can access all PTs, return all menu items
  if (isGroupLevelUser(session)) {
    return menuItems;
  }

  // Filter menu items to only include accessible PTs
  return menuItems.filter(item => {
    // Check if this is a PT-specific menu item
    const ptCode = extractPTCodeFromMenuItem(item);
    if (ptCode) {
      return accessiblePTs.some(pt => pt.code === ptCode);
    }
    
    // Include non-PT specific items
    return true;
  });
}

/**
 * Extract PT code from menu item (helper function)
 */
function extractPTCodeFromMenuItem(item: any): string | null {
  if (!item.title) return null;

  for (const pt of PT_COMPANIES) {
    if (item.title.includes(pt.name)) {
      return pt.code;
    }
  }
  
  return null;
}

/**
 * Validate if user can access a specific company's data
 */
export function validateCompanyAccess(session: Session | null, companyCode: string): void {
  if (!hasCompanyAccess(session, companyCode)) {
    throw new Error(`Access denied to company ${companyCode}`);
  }
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

