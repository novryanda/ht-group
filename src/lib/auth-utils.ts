import { UserRole } from "@/generated/prisma"
import { Session } from "next-auth"

// Role hierarchy: SUPER_ADMIN > ADMIN > MEMBER
const roleHierarchy: Record<UserRole, number> = {
  MEMBER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function isSuperAdmin(session: Session | null): boolean {
  return session?.user?.role === UserRole.SUPER_ADMIN
}

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === UserRole.ADMIN || isSuperAdmin(session)
}

export function isMember(session: Session | null): boolean {
  return !!session?.user
}

export function canAccessAdminPanel(session: Session | null): boolean {
  return isAdmin(session)
}

export function canManageUsers(session: Session | null): boolean {
  return isSuperAdmin(session)
}

export function canModerateContent(session: Session | null): boolean {
  return isAdmin(session)
}
