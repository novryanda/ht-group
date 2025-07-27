"use client"

import { useState, useCallback } from "react"
import { CompanyNavigationState, NavigationActions } from "@/types/navigation"

export function useCompanyNavigation(): [CompanyNavigationState, NavigationActions] {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set())
  const [activeItem, setActiveItemState] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompanyState] = useState<string | null>(null)

  const toggleCompany = useCallback((companyId: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(companyId)) {
        newSet.delete(companyId)
      } else {
        newSet.add(companyId)
      }
      return newSet
    })
  }, [])

  const setActiveItem = useCallback((itemId: string) => {
    setActiveItemState(itemId)
  }, [])

  const setSelectedCompany = useCallback((companyId: string | null) => {
    setSelectedCompanyState(companyId)
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedCompanies(new Set())
  }, [])

  const expandAll = useCallback(() => {
    // This would need to be populated with actual company IDs
    // For now, we'll leave it as a placeholder
    setExpandedCompanies(new Set())
  }, [])

  const state: CompanyNavigationState = {
    expandedCompanies,
    activeItem,
    selectedCompany
  }

  const actions: NavigationActions = {
    toggleCompany,
    setActiveItem,
    setSelectedCompany,
    collapseAll,
    expandAll
  }

  return [state, actions]
}
