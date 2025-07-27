"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CompanyPageLayout } from "@/components/company-page-layout"
import { InvoiceForm } from "@/components/invoice-form"
import { getCompanyById } from "@/mock/companies"
import { notFound } from "next/navigation"

export default function TagihanPage() {
  const params = useParams()
  const companyId = params.company as string
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundCompany = getCompanyById(companyId)
    if (!foundCompany) {
      notFound()
    }
    setCompany(foundCompany)
    setLoading(false)
  }, [companyId])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!company) {
    notFound()
  }

  const handleSuccess = (invoiceId: string) => {
    console.log('Tagihan invoice created:', invoiceId)
  }

  return (
    <CompanyPageLayout
      title={`${company.name} - Tagihan`}
      description="Manage bills and invoices - Create and manage invoices for billing services"
    >
      <div className="space-y-6">
        <InvoiceForm
          companyId={company.id}
          companyName={company.name}
          invoiceType="tagihan"
          onSuccess={handleSuccess}
        />
      </div>
    </CompanyPageLayout>
  )
}
