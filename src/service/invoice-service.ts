import { prisma } from '@/lib/prisma'
import { PDFGeneratorService } from './pdf-generator'
import { InvoiceFormData, GeneratedInvoice, InvoiceType } from '@/types/invoice'
import { ensureUploadDirectory, sanitizeFileName } from '@/lib/file-utils'
import { format } from 'date-fns'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export class InvoiceService {
  private static generateInvoiceNumber(companyId: string, type: InvoiceType): string {
    const currentDate = new Date()
    const year = format(currentDate, 'yyyy')
    const month = format(currentDate, 'MM')
    const timestamp = Date.now().toString().slice(-6)

    // Generate different prefixes based on invoice type
    const typePrefix = {
      'pengajian': 'PY',
      'tagihan': 'TG',
      'biaya_operasional': 'BO',
      'biaya_lain': 'BL'
    }[type] || 'PY'

    return `INV/${typePrefix}/${companyId.toUpperCase()}/${year}${month}${timestamp}`
  }

  private static calculateTaxes(subtotal: number) {
    const ppn11 = subtotal * 0.11
    const ppn23 = subtotal * 0.02
    const netInvoice = subtotal + ppn11 - ppn23
    
    return {
      ppn11,
      ppn23,
      netInvoice
    }
  }

  static async createInvoice(
    formData: InvoiceFormData,
    userId: string
  ): Promise<GeneratedInvoice> {
    const invoiceNumber = this.generateInvoiceNumber(formData.companyId, formData.type)
    const taxes = this.calculateTaxes(formData.totalTagihan)

    // Map invoice type to Prisma enum
    const prismaType = {
      'pengajian': 'PENGAJIAN',
      'tagihan': 'TAGIHAN',
      'biaya_operasional': 'BIAYA_OPERASIONAL',
      'biaya_lain': 'BIAYA_LAIN'
    }[formData.type] as any

    // Create invoice in database
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        type: prismaType,
        companyId: formData.companyId,
        companyName: formData.companyName,
        nomorReferensi: formData.nomorReferensi,
        nomorPR: formData.nomorPR,
        nomorPO: formData.nomorPO,
        nomorSes: formData.nomorSes,
        jobDescription: formData.jobDescription,
        namaPekerjaan: formData.namaPekerjaan,
        qty: formData.qty,
        rate: formData.rate,
        subtotal: formData.totalTagihan,
        ppn11: taxes.ppn11,
        ppn23: taxes.ppn23,
        netInvoice: taxes.netInvoice,
        approvalSignature: formData.ttdApproval,
        approvalName: formData.approvalName || formData.ttdApproval,
        approvalTitle: formData.approvalTitle || 'Director',
        createdBy: userId,
        lineItems: {
          create: [
            {
              description: formData.namaPekerjaan,
              quantity: formData.qty,
              rate: formData.rate,
              amount: formData.totalTagihan
            }
          ]
        }
      },
      include: {
        lineItems: true,
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Map Prisma enum back to TypeScript type
    const invoiceType = {
      'PENGAJIAN': 'pengajian',
      'TAGIHAN': 'tagihan',
      'BIAYA_OPERASIONAL': 'biaya_operasional',
      'BIAYA_LAIN': 'biaya_lain'
    }[invoice.type] as InvoiceType

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      type: invoiceType,
      companyId: invoice.companyId,
      companyName: invoice.companyName,
      date: invoice.date.toISOString(),
      poNum: invoice.nomorPO,
      subject: invoice.jobDescription,
      periode: format(invoice.date, 'MMMM yyyy'),
      lineItems: invoice.lineItems.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        rate: Number(item.rate),
        amount: Number(item.amount)
      })),
      subtotal: Number(invoice.subtotal),
      ppn11: Number(invoice.ppn11),
      ppn23: Number(invoice.ppn23),
      netInvoice: Number(invoice.netInvoice),
      approvalSignature: invoice.approvalSignature,
      approvalName: invoice.approvalName || '',
      approvalTitle: invoice.approvalTitle || '',
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      createdBy: invoice.createdBy,
      status: invoice.status as 'draft' | 'approved' | 'sent' | 'paid'
    }
  }

  static async generatePDF(invoiceId: string): Promise<string> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { lineItems: true }
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    // Map Prisma enum to TypeScript type
    const invoiceType = {
      'PENGAJIAN': 'pengajian',
      'TAGIHAN': 'tagihan',
      'BIAYA_OPERASIONAL': 'biaya_operasional',
      'BIAYA_LAIN': 'biaya_lain'
    }[invoice.type] as InvoiceType

    // Prepare form data for PDF generation
    const formData: InvoiceFormData = {
      type: invoiceType,
      nomorReferensi: invoice.nomorReferensi,
      nomorPR: invoice.nomorPR,
      nomorPO: invoice.nomorPO,
      nomorSes: invoice.nomorSes,
      jobDescription: invoice.jobDescription,
      namaPekerjaan: invoice.namaPekerjaan,
      qty: invoice.qty,
      rate: Number(invoice.rate),
      totalTagihan: Number(invoice.subtotal),
      companyId: invoice.companyId,
      companyName: invoice.companyName,
      ttdApproval: invoice.approvalSignature,
      approvalName: invoice.approvalName || undefined,
      approvalTitle: invoice.approvalTitle || undefined
    }

    // Generate PDF
    const pdfBuffer = await PDFGeneratorService.generatePDF(formData)

    // Save PDF to file system
    const uploadsDir = await ensureUploadDirectory()

    const fileName = sanitizeFileName(`${invoice.invoiceNumber.replace(/\//g, '_')}.pdf`)
    const filePath = join(uploadsDir, fileName)
    
    await writeFile(filePath, pdfBuffer)

    // Update invoice with PDF path
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { pdfPath: `/uploads/invoices/${fileName}` }
    })

    return `/uploads/invoices/${fileName}`
  }

  static async getInvoicesByCompany(
    companyId: string,
    userId: string,
    type?: InvoiceType
  ) {
    const whereClause: any = {
      companyId,
      createdBy: userId
    }

    // Add type filter if provided
    if (type) {
      const prismaType = {
        'pengajian': 'PENGAJIAN',
        'tagihan': 'TAGIHAN',
        'biaya_operasional': 'BIAYA_OPERASIONAL',
        'biaya_lain': 'BIAYA_LAIN'
      }[type]

      whereClause.type = prismaType
    }

    return await prisma.invoice.findMany({
      where: whereClause,
      include: {
        lineItems: true,
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  static async getInvoiceById(invoiceId: string, userId: string) {
    return await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        createdBy: userId
      },
      include: {
        lineItems: true,
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
  }

  static async updateInvoiceStatus(
    invoiceId: string,
    status: 'draft' | 'approved' | 'sent' | 'paid',
    userId: string
  ) {
    // Map status to Prisma enum
    const prismaStatus = {
      'draft': 'DRAFT',
      'approved': 'APPROVED',
      'sent': 'SENT',
      'paid': 'PAID'
    }[status] as any

    return await prisma.invoice.update({
      where: {
        id: invoiceId,
        createdBy: userId
      },
      data: { status: prismaStatus }
    })
  }
}
