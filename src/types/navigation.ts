import { LucideIcon } from "lucide-react"

export interface NavigationItem {
  id: string
  label: string
  icon: LucideIcon
  href?: string
  isActive?: boolean
  children?: NavigationItem[]
  isExpanded?: boolean
  description?: string
  badge?: string | number
}

export interface CompanyNavigationState {
  expandedCompanies: Set<string>
  activeItem: string | null
  selectedCompany: string | null
}

export interface NavigationActions {
  toggleCompany: (companyId: string) => void
  setActiveItem: (itemId: string) => void
  setSelectedCompany: (companyId: string | null) => void
  collapseAll: () => void
  expandAll: () => void
}

export interface SidebarProps {
  variant?: "default" | "inset"
  className?: string
  collapsible?: "icon" | "none"
}

export interface CompanySidebarProps extends SidebarProps {
  companies: NavigationItem[]
  state: CompanyNavigationState
  actions: NavigationActions
}
