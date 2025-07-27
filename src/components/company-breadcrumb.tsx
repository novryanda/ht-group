"use client"

import { usePathname } from "next/navigation"
import { Building2, ChevronRight } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getCompanyById } from "@/mock/companies"

const sectionTitles: Record<string, string> = {
  "tagihan": "Tagihan",
  "pengajian": "Pengajian", 
  "biaya-operasional": "Biaya Operasional",
  "biaya-lain": "Biaya Lain-lain"
}

export function CompanyBreadcrumb() {
  const pathname = usePathname()
  
  // Parse the pathname to extract company and section
  const pathParts = pathname.split('/').filter(Boolean)
  
  if (pathParts[0] !== 'companies' || pathParts.length < 3) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const companyId = pathParts[1]
  const sectionId = pathParts[2]
  const company = getCompanyById(companyId)
  const sectionTitle = sectionTitles[sectionId]

  if (!company) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink 
            href={`/companies/${companyId}`}
            className="flex items-center gap-1"
          >
            <Building2 className="h-3 w-3" />
            {company.shortName}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {sectionTitle && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{sectionTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
