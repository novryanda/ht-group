import { Session } from "next-auth"
import { UserRole } from "@/generated/prisma"

export function canCreateInvoice(session: Session | null): boolean {
  if (!session?.user) return false
  
  // All authenticated users can create invoices
  return true
}

export function canViewInvoice(session: Session | null): boolean {
  if (!session?.user) return false
  
  // All authenticated users can view their own invoices
  return true
}

export function canEditInvoice(session: Session | null): boolean {
  if (!session?.user) return false
  
  // Only admins and super admins can edit invoices
  return session.user.role === UserRole.ADMIN || session.user.role === UserRole.SUPER_ADMIN
}

export function canDeleteInvoice(session: Session | null): boolean {
  if (!session?.user) return false
  
  // Only super admins can delete invoices
  return session.user.role === UserRole.SUPER_ADMIN
}

export function canApproveInvoice(session: Session | null): boolean {
  if (!session?.user) return false
  
  // Only admins and super admins can approve invoices
  return session.user.role === UserRole.ADMIN || session.user.role === UserRole.SUPER_ADMIN
}

export function canAccessCompanyData(session: Session | null, companyId: string): boolean {
  if (!session?.user) return false
  
  // For now, all authenticated users can access all company data
  // You can implement more granular permissions here based on your business logic
  return true
}
