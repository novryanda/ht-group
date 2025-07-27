import { redirect } from "next/navigation"
import { companies, getCompanyById } from "@/mock/companies"
import { notFound } from "next/navigation"

interface CompanyPageProps {
  params: Promise<{
    company: string
    section: string
  }>
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { company: companyId, section } = await params
  const company = getCompanyById(companyId)

  if (!company) {
    notFound()
  }

  // Redirect to individual section pages
  redirect(`/companies/${companyId}/${section}`)
}
