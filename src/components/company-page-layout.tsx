"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { CompanySidebar } from "@/components/company-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { UserRole } from "@/generated/prisma"
import { ReactNode } from "react"

interface CompanyPageLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function CompanyPageLayout({ 
  children, 
  title = "Company Dashboard",
  description = "Manage your company data and operations"
}: CompanyPageLayoutProps) {
  return (
    <ProtectedRoute requiredRole={UserRole.MEMBER}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <CompanySidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                  </div>
                  {children}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
