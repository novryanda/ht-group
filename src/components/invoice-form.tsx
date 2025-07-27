"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileText, Download } from "lucide-react"
import { InvoiceFormData } from "@/types/invoice"

const invoiceSchema = z.object({
  nomorReferensi: z.string().min(1, "Nomor Referensi is required"),
  nomorPR: z.string().min(1, "Nomor PR is required"),
  nomorPO: z.string().min(1, "Nomor PO is required"),
  nomorSes: z.string().min(1, "Nomor Ses is required"),
  jobDescription: z.string().min(1, "Job Description is required"),
  namaPekerjaan: z.string().min(1, "Nama Pekerjaan is required"),
  qty: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Rate must be positive"),
  totalTagihan: z.number().min(0, "Total Tagihan must be positive"),
  ttdApproval: z.string().min(1, "TTD Approval is required"),
  approvalName: z.string().optional(),
  approvalTitle: z.string().optional()
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  companyId: string
  companyName: string
  invoiceType?: 'pengajian' | 'tagihan' | 'biaya_operasional' | 'biaya_lain'
  onSuccess?: (invoiceId: string) => void
}

export function InvoiceForm({ companyId, companyName, invoiceType = 'pengajian', onSuccess }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      nomorReferensi: "",
      nomorPR: "",
      nomorPO: "",
      nomorSes: "",
      jobDescription: "",
      namaPekerjaan: "",
      qty: 1,
      rate: 0,
      totalTagihan: 0,
      ttdApproval: "",
      approvalName: "",
      approvalTitle: "Director"
    }
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form

  // Auto-calculate total when qty or rate changes
  const qty = watch("qty")
  const rate = watch("rate")

  React.useEffect(() => {
    const total = qty * rate
    setValue("totalTagihan", total)
  }, [qty, rate, setValue])

  const onSubmit = async (data: InvoiceFormValues) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const formData: InvoiceFormData = {
        ...data,
        type: invoiceType,
        companyId,
        companyName
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create invoice')
      }

      setGeneratedInvoiceId(result.invoice.id)
      setSuccess('Invoice created successfully!')
      
      if (onSuccess) {
        onSuccess(result.invoice.id)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generatePDF = async () => {
    if (!generatedInvoiceId) return

    setIsGeneratingPDF(true)
    setError(null)

    try {
      const response = await fetch(`/api/invoices/${generatedInvoiceId}/pdf`, {
        method: 'POST'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate PDF')
      }

      setPdfUrl(result.pdfUrl)
      setSuccess('PDF generated successfully!')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const downloadPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    }
  }

  const getInvoiceTitle = () => {
    const titles = {
      'pengajian': 'Create Pengajian Invoice',
      'tagihan': 'Create Tagihan Invoice',
      'biaya_operasional': 'Create Operational Cost Invoice',
      'biaya_lain': 'Create Miscellaneous Invoice'
    }
    return titles[invoiceType] || 'Create Invoice'
  }

  const getInvoiceDescription = () => {
    const descriptions = {
      'pengajian': 'Fill in the details below to generate a new invoice for religious education services.',
      'tagihan': 'Fill in the details below to generate a new invoice for billing services.',
      'biaya_operasional': 'Fill in the details below to generate a new invoice for operational costs.',
      'biaya_lain': 'Fill in the details below to generate a new invoice for miscellaneous expenses.'
    }
    return descriptions[invoiceType] || 'Fill in the details below to generate a new invoice.'
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {getInvoiceTitle()} - {companyName}
        </CardTitle>
        <CardDescription>
          {getInvoiceDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Reference Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomorReferensi">Nomor Referensi *</Label>
              <Input
                id="nomorReferensi"
                {...register("nomorReferensi")}
                placeholder="Enter reference number"
              />
              {errors.nomorReferensi && (
                <p className="text-sm text-red-600">{errors.nomorReferensi.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomorPR">Nomor PR *</Label>
              <Input
                id="nomorPR"
                {...register("nomorPR")}
                placeholder="Enter PR number"
              />
              {errors.nomorPR && (
                <p className="text-sm text-red-600">{errors.nomorPR.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomorPO">Nomor PO *</Label>
              <Input
                id="nomorPO"
                {...register("nomorPO")}
                placeholder="Enter PO number"
              />
              {errors.nomorPO && (
                <p className="text-sm text-red-600">{errors.nomorPO.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomorSes">Nomor Ses *</Label>
              <Input
                id="nomorSes"
                {...register("nomorSes")}
                placeholder="Enter session number"
              />
              {errors.nomorSes && (
                <p className="text-sm text-red-600">{errors.nomorSes.message}</p>
              )}
            </div>
          </div>

          {/* Job Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description *</Label>
              <Textarea
                id="jobDescription"
                {...register("jobDescription")}
                placeholder="Enter job description"
                rows={3}
              />
              {errors.jobDescription && (
                <p className="text-sm text-red-600">{errors.jobDescription.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="namaPekerjaan">Nama Pekerjaan *</Label>
              <Input
                id="namaPekerjaan"
                {...register("namaPekerjaan")}
                placeholder="Enter job name"
              />
              {errors.namaPekerjaan && (
                <p className="text-sm text-red-600">{errors.namaPekerjaan.message}</p>
              )}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">Qty *</Label>
              <Input
                id="qty"
                type="number"
                {...register("qty", { valueAsNumber: true })}
                placeholder="1"
                min="1"
              />
              {errors.qty && (
                <p className="text-sm text-red-600">{errors.qty.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate *</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                {...register("rate", { valueAsNumber: true })}
                placeholder="0.00"
                min="0"
              />
              {errors.rate && (
                <p className="text-sm text-red-600">{errors.rate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalTagihan">Total Tagihan *</Label>
              <Input
                id="totalTagihan"
                type="number"
                step="0.01"
                {...register("totalTagihan", { valueAsNumber: true })}
                placeholder="0.00"
                readOnly
                className="bg-gray-50"
              />
              {errors.totalTagihan && (
                <p className="text-sm text-red-600">{errors.totalTagihan.message}</p>
              )}
            </div>
          </div>

          {/* Approval Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ttdApproval">TTD Approval *</Label>
              <Input
                id="ttdApproval"
                {...register("ttdApproval")}
                placeholder="Enter approval signature name"
              />
              {errors.ttdApproval && (
                <p className="text-sm text-red-600">{errors.ttdApproval.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="approvalTitle">Approval Title</Label>
              <Input
                id="approvalTitle"
                {...register("approvalTitle")}
                placeholder="Director"
              />
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>

            {generatedInvoiceId && (
              <Button
                type="button"
                variant="outline"
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex-1"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </Button>
            )}

            {pdfUrl && (
              <Button
                type="button"
                variant="secondary"
                onClick={downloadPDF}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
