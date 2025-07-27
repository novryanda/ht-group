import puppeteer from 'puppeteer'
import { format } from 'date-fns'
import numeral from 'numeral'
import { InvoiceFormData, InvoicePDFOptions, InvoiceType } from '@/types/invoice'

export class PDFGeneratorService {
  private static formatCurrency(amount: number): string {
    return numeral(amount).format('0,0.00')
  }

  private static formatDate(date: Date): string {
    return format(date, 'dd MMM yyyy')
  }

  private static generateInvoiceHTML(data: InvoiceFormData): string {
    const currentDate = new Date()

    // Generate invoice number based on type
    const typePrefix = {
      'pengajian': 'PY',
      'tagihan': 'TG',
      'biaya_operasional': 'BO',
      'biaya_lain': 'BL'
    }[data.type] || 'PY'

    const invoiceNumber = `INV/${typePrefix}/${data.companyId.toUpperCase()}/${format(currentDate, 'yyyy')}`

    // Get invoice title based on type
    const invoiceTitle = {
      'pengajian': 'INVOICE - PENGAJIAN',
      'tagihan': 'INVOICE - TAGIHAN',
      'biaya_operasional': 'INVOICE - BIAYA OPERASIONAL',
      'biaya_lain': 'INVOICE - BIAYA LAIN-LAIN'
    }[data.type] || 'INVOICE'
    
    // Calculate tax amounts
    const subtotal = data.totalTagihan
    const ppn11 = subtotal * 0.11
    const ppn23 = subtotal * 0.02
    const netInvoice = subtotal + ppn11 + ppn23

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                font-size: 12px;
                line-height: 1.4;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .company-name {
                background-color: #d3d3d3;
                padding: 8px;
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 5px;
            }
            .invoice-title {
                font-weight: bold;
                font-size: 16px;
                margin-top: 10px;
            }
            .invoice-details {
                margin-bottom: 30px;
            }
            .invoice-details table {
                width: 100%;
                border-collapse: collapse;
            }
            .invoice-details td {
                padding: 3px 0;
                vertical-align: top;
            }
            .invoice-details .label {
                width: 120px;
                font-weight: normal;
            }
            .invoice-details .colon {
                width: 10px;
                text-align: center;
            }
            .line-items {
                margin-bottom: 20px;
            }
            .line-items table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #000;
            }
            .line-items th,
            .line-items td {
                border: 1px solid #000;
                padding: 8px;
                text-align: left;
            }
            .line-items th {
                background-color: #f0f0f0;
                font-weight: bold;
            }
            .line-items .amount {
                text-align: right;
            }
            .totals {
                margin-top: 20px;
            }
            .totals table {
                width: 100%;
                border-collapse: collapse;
            }
            .totals td {
                padding: 5px 0;
                border-bottom: 1px solid #000;
            }
            .totals .label {
                text-align: center;
                font-weight: bold;
                width: 60%;
            }
            .totals .amount {
                text-align: right;
                width: 20%;
            }
            .totals .currency {
                text-align: left;
                width: 20%;
                padding-left: 10px;
            }
            .footer {
                margin-top: 40px;
            }
            .note {
                margin-bottom: 20px;
                font-size: 11px;
            }
            .signature {
                text-align: right;
                margin-top: 30px;
            }
            .signature-box {
                display: inline-block;
                text-align: center;
                margin-left: 200px;
            }
            .signature-line {
                border-bottom: 1px solid #000;
                width: 150px;
                height: 60px;
                margin-bottom: 5px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">ANGGUN</div>
            <div class="company-name">${data.companyName}</div>
            <div class="invoice-title">${invoiceTitle}</div>
        </div>

        <div class="invoice-details">
            <table>
                <tr>
                    <td class="label">Invoice Number</td>
                    <td class="colon">:</td>
                    <td>${invoiceNumber}</td>
                </tr>
                <tr>
                    <td class="label">Date</td>
                    <td class="colon">:</td>
                    <td>${this.formatDate(currentDate)}</td>
                </tr>
                <tr>
                    <td class="label">PO Num.</td>
                    <td class="colon">:</td>
                    <td>${data.nomorPO}</td>
                </tr>
                <tr>
                    <td class="label">Subject</td>
                    <td class="colon">:</td>
                    <td>${data.jobDescription}</td>
                </tr>
                <tr>
                    <td class="label">Periode</td>
                    <td class="colon">:</td>
                    <td>${format(currentDate, 'MMMM yyyy')}</td>
                </tr>
            </table>
        </div>

        <div class="line-items">
            <table>
                <thead>
                    <tr>
                        <th style="width: 10%">No.</th>
                        <th style="width: 60%">Description</th>
                        <th style="width: 10%">Qty</th>
                        <th style="width: 20%">Amount (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1.</td>
                        <td>${data.namaPekerjaan}</td>
                        <td>${data.qty}</td>
                        <td class="amount">${this.formatCurrency(data.totalTagihan)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="totals">
            <table>
                <tr>
                    <td class="label">Total</td>
                    <td class="currency">Rp</td>
                    <td class="amount">${this.formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                    <td class="label">PPN 11%</td>
                    <td class="currency">Rp</td>
                    <td class="amount">${this.formatCurrency(ppn11)}</td>
                </tr>
                <tr>
                    <td class="label">Sub Total</td>
                    <td class="currency">Rp</td>
                    <td class="amount">${this.formatCurrency(subtotal + ppn11)}</td>
                </tr>
                <tr>
                    <td class="label">PPh 23 - 2%</td>
                    <td class="currency">Rp</td>
                    <td class="amount">${this.formatCurrency(ppn23)}</td>
                </tr>
                <tr style="border-bottom: 2px solid #000;">
                    <td class="label"><strong>Net Invoice to be Paid</strong></td>
                    <td class="currency"><strong>Rp</strong></td>
                    <td class="amount"><strong>${this.formatCurrency(netInvoice)}</strong></td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <div class="note">
                <strong>Note :</strong><br>
                Kindly remit payment to our Bank<br>
                PT. ${data.companyName}<br>
                Bank BRI Cabang Pul Kerinci<br>
                A/C No. : 0843-01-019479
            </div>

            <div class="signature">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div><strong>${data.ttdApproval}</strong></div>
                    <div>Director</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `
  }

  static async generatePDF(
    data: InvoiceFormData,
    options: InvoicePDFOptions = {}
  ): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
      const page = await browser.newPage()
      const html = this.generateInvoiceHTML(data)
      
      await page.setContent(html, { waitUntil: 'networkidle0' })
      
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        printBackground: true,
        margin: options.margin || {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      })

      return Buffer.from(pdfBuffer)
    } finally {
      await browser.close()
    }
  }
}
