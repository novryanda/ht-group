import type { Session } from "next-auth";
import type { PTCompany } from "./rbac-lite";

// Re-export types and constants from rbac-lite for shared usage
export type {
  UserRole,
  PTCompany,
} from "./rbac-lite";

export {
  PT_COMPANIES,
} from "./rbac-lite";

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
  const { PT_COMPANIES } = require("./rbac-lite");
  const ptCompany = PT_COMPANIES.find((pt: any) => pt.code === companyCode);
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
  const { PT_COMPANIES } = require("./rbac-lite");

  // Find PT company by role
  const ptByRole = PT_COMPANIES.find((pt: any) => pt.adminRole === role);
  if (ptByRole) return ptByRole;

  // Find PT company by company code
  if (companyCode) {
    return PT_COMPANIES.find((pt: any) => pt.code === companyCode) || null;
  }

  return null;
}

/**
 * Get all PT companies the user can access
 */
export function getAccessiblePTCompanies(session: Session | null): PTCompany[] {
  if (!session?.user) return [];

  const { role } = session.user as any;
  const { PT_COMPANIES } = require("./rbac-lite");

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
  const { PT_COMPANIES } = require("./rbac-lite");
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
  const { PT_COMPANIES } = require("./rbac-lite");
  return PT_COMPANIES.some((pt: any) => pt.adminRole === role);
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

  const { PT_COMPANIES } = require("./rbac-lite");
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
  const { PT_COMPANIES } = require("./rbac-lite");
  for (const pt of PT_COMPANIES) {
    const ptPath = `/dashboard/${pt.code.toLowerCase()}`;
    if (route.startsWith(ptPath)) {
      return pt.code;
    }
  }
  return null;
}
