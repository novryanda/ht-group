export type InvoiceType = 'pengajian' | 'tagihan' | 'biaya_operasional' | 'biaya_lain'

export interface InvoiceFormData {
  // Invoice Type
  type: InvoiceType

  // Basic Information
  nomorReferensi: string
  nomorPR: string
  nomorPO: string
  nomorSes: string
  jobDescription: string
  namaPekerjaan: string
  qty: number
  rate: number
  totalTagihan: number

  // Company Information
  companyId: string
  companyName: string

  // Additional Invoice Details
  invoiceNumber?: string
  date?: string
  poNum?: string
  subject?: string
  periode?: string

  // Approval
  ttdApproval: string
  approvalName?: string
  approvalTitle?: string
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface InvoiceTaxCalculation {
  subtotal: number
  ppn11: number
  ppn23: number
  netInvoice: number
}

export interface GeneratedInvoice {
  id: string
  invoiceNumber: string
  type: InvoiceType
  companyId: string
  companyName: string
  date: string
  poNum: string
  subject: string
  periode: string

  // Line Items
  lineItems: InvoiceLineItem[]

  // Calculations
  subtotal: number
  ppn11: number
  ppn23: number
  netInvoice: number

  // Approval
  approvalSignature: string
  approvalName: string
  approvalTitle: string

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  status: 'draft' | 'approved' | 'sent' | 'paid'
}

export interface InvoicePDFOptions {
  format?: 'A4' | 'Letter'
  orientation?: 'portrait' | 'landscape'
  margin?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface InvoiceGenerationRequest {
  formData: InvoiceFormData
  options?: InvoicePDFOptions
}

export interface InvoiceGenerationResponse {
  success: boolean
  invoiceId?: string
  pdfUrl?: string
  error?: string
}
