import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { InvoiceService } from '@/service/invoice-service'
import { InvoiceFormData } from '@/types/invoice'
import { canCreateInvoice, canViewInvoice, canAccessCompanyData } from '@/lib/invoice-permissions'
import { z } from 'zod'

// Validation schema
const invoiceSchema = z.object({
  type: z.enum(['pengajian', 'tagihan', 'biaya_operasional', 'biaya_lain']),
  nomorReferensi: z.string().min(1, 'Nomor Referensi is required'),
  nomorPR: z.string().min(1, 'Nomor PR is required'),
  nomorPO: z.string().min(1, 'Nomor PO is required'),
  nomorSes: z.string().min(1, 'Nomor Ses is required'),
  jobDescription: z.string().min(1, 'Job Description is required'),
  namaPekerjaan: z.string().min(1, 'Nama Pekerjaan is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate must be positive'),
  totalTagihan: z.number().min(0, 'Total Tagihan must be positive'),
  companyId: z.string().min(1, 'Company ID is required'),
  companyName: z.string().min(1, 'Company Name is required'),
  ttdApproval: z.string().min(1, 'TTD Approval is required'),
  approvalName: z.string().optional(),
  approvalTitle: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!canCreateInvoice(session)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create invoices' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validationResult = invoiceSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const formData: InvoiceFormData = validationResult.data

    // Check company access permissions
    if (!canAccessCompanyData(session, formData.companyId)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to access this company data' },
        { status: 403 }
      )
    }

    // Create invoice
    const invoice = await InvoiceService.createInvoice(formData, session.user.id)

    return NextResponse.json({
      success: true,
      invoice
    })

  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!canViewInvoice(session)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view invoices' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const invoiceType = searchParams.get('type') as 'pengajian' | 'tagihan' | 'biaya_operasional' | 'biaya_lain' | null

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    if (!canAccessCompanyData(session, companyId)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to access this company data' },
        { status: 403 }
      )
    }

    const invoices = await InvoiceService.getInvoicesByCompany(
      companyId,
      session.user.id,
      invoiceType || undefined
    )

    return NextResponse.json({
      success: true,
      invoices
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
