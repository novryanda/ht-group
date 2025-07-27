"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { UserRole } from "@/generated/prisma"
import { hasRole } from "@/lib/auth-utils"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole
  fallbackUrl?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole = UserRole.MEMBER,
  fallbackUrl = "/login" 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push(fallbackUrl)
      return
    }

    if (requiredRole && !hasRole(session.user.role, requiredRole)) {
      router.push("/dashboard") // Redirect to dashboard if insufficient permissions
      return
    }
  }, [session, status, router, requiredRole, fallbackUrl])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (requiredRole && !hasRole(session.user.role, requiredRole)) {
    return null
  }

  return <>{children}</>
}
