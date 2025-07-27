"use client"

import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Company } from "@/mock/companies"

interface CompanyNavProps {
  companies: Company[]
  expandedCompanies: Set<string>
  activeItem: string | null
  onToggleCompany: (companyId: string) => void
  onSelectItem: (itemId: string, companyId: string) => void
}

export function CompanyNav({
  companies,
  expandedCompanies,
  activeItem,
  onToggleCompany,
  onSelectItem,
}: CompanyNavProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Companies</SidebarGroupLabel>
      <SidebarMenu>
        {companies.map((company) => {
          const isExpanded = expandedCompanies.has(company.id)
          const Icon = company.icon

          return (
            <Collapsible
              key={company.id}
              asChild
              open={isExpanded}
              onOpenChange={() => onToggleCompany(company.id)}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={company.name}
                    className={cn(
                      "w-full justify-between transition-all duration-200",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate text-sm font-medium">
                        {company.shortName}
                      </span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <SidebarMenuSub>
                    {company.subMenuItems.map((item) => {
                      const SubIcon = item.icon
                      const itemKey = `${company.id}-${item.id}`
                      const isActive = activeItem === itemKey

                      return (
                        <SidebarMenuSubItem key={item.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive}
                            className={cn(
                              "transition-all duration-150",
                              "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                              isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            )}
                          >
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault()
                                onSelectItem(itemKey, company.id)
                                // You can add navigation logic here
                                window.history.pushState({}, '', item.href)
                              }}
                              className="flex items-center gap-2 min-w-0"
                            >
                              <SubIcon className="h-4 w-4 shrink-0" />
                              <span className="truncate text-sm">{item.label}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
