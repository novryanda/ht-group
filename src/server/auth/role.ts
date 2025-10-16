/**
 * Role-based access control utilities
 * Provides type-safe role validation and authorization
 */

export const USER_ROLES = [
  "GROUP_VIEWER",
  "EXECUTIVE",
  "PT_MANAGER",
  "PT_PKS_ADMIN",
  "UNIT_SUPERVISOR",
  "TECHNICIAN",
  "OPERATOR",
  "HR",
  "FINANCE_AR",
  "FINANCE_AP",
  "GL_ACCOUNTANT",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/**
 * Type guard to check if value is a valid UserRole
 */
export const isUserRole = (v: unknown): v is UserRole =>
  typeof v === "string" && (USER_ROLES as readonly string[]).includes(v);

/**
 * Safely converts unknown value to UserRole or null
 */
export function toUserRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;
  return (USER_ROLES as readonly string[]).includes(value)
    ? (value as UserRole)
    : null;
}

/**
 * Validates user role against allowed roles, throws if unauthorized
 * @throws Error with status 403 if role is not allowed
 */
export function ensureRoleOrThrow(
  role: unknown,
  allowed: readonly UserRole[]
): UserRole {
  if (!isUserRole(role) || !allowed.includes(role)) {
    const err = new Error("FORBIDDEN") as Error & { status?: number };
    err.status = 403;
    throw err;
  }
  return role;
}

/**
 * Checks if user has any of the allowed roles
 */
export function hasRole(role: unknown, allowed: readonly UserRole[]): boolean {
  return isUserRole(role) && allowed.includes(role);
}

