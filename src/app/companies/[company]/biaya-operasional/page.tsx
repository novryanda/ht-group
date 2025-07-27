"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CompanyPageLayout } from "@/components/company-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calculator, Plus, FileText, TrendingUp } from "lucide-react"
import { getCompanyById } from "@/mock/companies"
import { notFound } from "next/navigation"

export default function BiayaOperasionalPage() {
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

  return (
    <CompanyPageLayout
      title={`${company.name} - Biaya Operasional`}
      description="Track and manage operational costs for the company"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Biaya Operasional
                  <Badge variant="secondary">{company.shortName}</Badge>
                </CardTitle>
                <CardDescription>
                  Manage and track operational expenses for {company.name}
                </CardDescription>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp 0</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Expense entries</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average Monthly
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp 0</div>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Ready</Badge>
              <p className="text-xs text-muted-foreground mt-1">System ready for data</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Operational Expenses Management</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This section will allow you to track and manage all operational costs for {company.name}.
                Features will include expense categorization, budget tracking, and financial reporting.
              </p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CompanyPageLayout>
  )
}
