"use client"

import { Home, Settings, HelpCircle } from "lucide-react"
import { CompanyNav } from "@/components/company-nav"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { companies } from "@/mock/companies"
import { useCompanyNavigation } from "@/hooks/use-company-navigation"

interface CompanySidebarProps {
  variant?: "default" | "inset"
}

export function CompanySidebar({ variant = "default" }: CompanySidebarProps) {
  const [navigationState, navigationActions] = useCompanyNavigation()

  const handleSelectItem = (itemKey: string, companyId: string) => {
    navigationActions.setActiveItem(itemKey)
    navigationActions.setSelectedCompany(companyId)
  }

  return (
    <Sidebar variant={variant} className="border-r">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent">
              <a href="/dashboard" className="transition-colors duration-200">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">HT Group</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    Company Dashboard
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <CompanyNav
          companies={companies}
          expandedCompanies={navigationState.expandedCompanies}
          activeItem={navigationState.activeItem}
          onToggleCompany={navigationActions.toggleCompany}
          onSelectItem={handleSelectItem}
        />
        
        {/* Additional Navigation Items */}
        <div className="mt-auto border-t border-sidebar-border pt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
              >
                <a href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
              >
                <a href="/help" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}
