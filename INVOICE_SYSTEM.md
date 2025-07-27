# Invoice System for Pengajian (Religious Studies/Teaching)

## Overview

This document describes the complete invoice system implementation for the "Pengajian" section of the HT Group dashboard. The system allows users to create, manage, and generate PDF invoices for religious education services.

## Features

### ✅ **Complete Invoice Management**
- Create invoices with comprehensive form validation
- Generate professional PDF invoices matching the provided template
- Store invoice data in PostgreSQL database
- Role-based access control and permissions
- Company-specific invoice management

### ✅ **PDF Generation**
- High-quality PDF generation using Puppeteer
- Matches the exact format from the provided invoice example
- Includes company branding and professional layout
- Automatic tax calculations (PPN 11%, PPh 23 2%)
- Digital signature support

### ✅ **Form Fields**
All required fields are implemented:
- Nomor Referensi (Reference Number)
- Nomor PR (Purchase Request Number)
- Nomor PO (Purchase Order Number)
- Nomor Ses (Session Number)
- Job Description
- Nama Pekerjaan (Job Name)
- Qty (Quantity)
- Rate (Unit Rate)
- Total Tagihan (Total Bill Amount)
- TTD Approval (Approval Signature)

## Technical Architecture

### **Database Schema**
```sql
-- Invoice table with all required fields
model Invoice {
  id            String        @id @default(cuid())
  invoiceNumber String        @unique
  companyId     String
  companyName   String
  // ... all form fields
  status        InvoiceStatus @default(DRAFT)
  createdBy     String
  // Relations and metadata
}

-- Line items for detailed billing
model InvoiceLineItem {
  id          String  @id @default(cuid())
  invoiceId   String
  description String
  quantity    Int
  rate        Decimal
  amount      Decimal
}
```

### **API Endpoints**
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices?companyId=xxx` - List company invoices
- `POST /api/invoices/[id]/pdf` - Generate PDF
- `GET /api/invoices/[id]/pdf` - Get invoice details

### **Services**
- `InvoiceService` - Business logic for invoice operations
- `PDFGeneratorService` - PDF generation using Puppeteer
- Permission validation and role-based access control

## Usage

### **Accessing the Invoice System**
1. Navigate to any company in the sidebar
2. Click on "Pengajian" sub-menu item
3. Fill out the invoice form with required details
4. Click "Create Invoice" to save to database
5. Click "Generate PDF" to create downloadable PDF
6. Click "Download PDF" to view/save the generated invoice

### **URL Structure**
- `/companies/husni-tamrin-kerinci/pengajian`
- `/companies/tuah-andalan-melayu/pengajian`
- `/companies/nilo-eng/pengajian`
- `/companies/zakiyah-talita-anggun/pengajian`

## File Structure

```
src/
├── app/api/invoices/           # API endpoints
│   ├── route.ts               # Create/list invoices
│   └── [id]/pdf/route.ts      # PDF generation
├── components/
│   └── invoice-form.tsx       # Main invoice form component
├── service/
│   ├── invoice-service.ts     # Business logic
│   └── pdf-generator.ts       # PDF generation
├── types/
│   └── invoice.ts            # TypeScript interfaces
├── lib/
│   ├── invoice-permissions.ts # Permission validation
│   └── file-utils.ts         # File handling utilities
└── mock/
    └── companies.ts          # Company data structure
```

## PDF Invoice Format

The generated PDF matches the provided example with:
- Company header with "ANGGUN" branding
- Invoice details (number, date, PO, subject, period)
- Line items table with descriptions and amounts
- Tax calculations (PPN 11%, PPh 23 2%)
- Bank payment details
- Digital signature section
- Professional formatting and styling

## Security & Permissions

### **Authentication**
- All endpoints require valid NextAuth.js session
- User must be logged in to access invoice system

### **Role-Based Access**
- **Members**: Can create and view their own invoices
- **Admins**: Can edit and approve invoices
- **Super Admins**: Full access including deletion

### **Data Validation**
- Comprehensive form validation using Zod
- Server-side validation for all API endpoints
- Type safety with TypeScript throughout

## Dependencies Added

```json
{
  "puppeteer": "^21.x.x",
  "date-fns": "^2.x.x",
  "numeral": "^2.x.x",
  "zod": "^3.x.x",
  "react-hook-form": "^7.x.x",
  "@hookform/resolvers": "^3.x.x"
}
```

## Environment Setup

1. Ensure PostgreSQL database is running
2. Run database migrations: `npm run db:migrate`
3. Generate Prisma client: `npm run db:generate`
4. Start development server: `npm run dev`

## Testing the System

1. **Login** with any test account:
   - superadmin@htgroup.com / superadmin123
   - admin@htgroup.com / admin123
   - member@htgroup.com / member123

2. **Navigate** to any company's Pengajian section

3. **Fill the form** with sample data:
   - Nomor Referensi: "REF-001"
   - Nomor PR: "PR-2024-001"
   - Nomor PO: "PO-2024-001"
   - Nomor Ses: "SES-001"
   - Job Description: "Religious education services"
   - Nama Pekerjaan: "Pengajian Bulanan"
   - Qty: 1
   - Rate: 1000000
   - TTD Approval: "RONY AMALIA FARADILA"

4. **Create Invoice** and then **Generate PDF**

5. **Download** and verify the PDF matches the expected format

## Future Enhancements

- Invoice status workflow (Draft → Approved → Sent → Paid)
- Email integration for sending invoices
- Invoice templates for different services
- Bulk invoice generation
- Advanced reporting and analytics
- Invoice numbering customization per company

## Support

For technical issues or questions about the invoice system, refer to the main project documentation or contact the development team.
