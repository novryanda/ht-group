# HT Group ERP System

Sistem ERP terintegrasi untuk mengelola operasional, HR, dan keuangan seluruh unit bisnis HT Group.

## 🏗️ Arsitektur Sistem

### 3-Tier Architecture
- **App API Layer** (`src/app/api/`) - Next.js API Routes
- **Server API Layer** (`src/server/api/`) - Business logic dan validasi
- **Server Services Layer** (`src/server/services/`) - Data access dan core business logic

### Database Schema
Menggunakan Prisma ORM dengan PostgreSQL, mencakup:
- **Core Models**: Company, Unit, Employee, User
- **Work Order Management**: WorkOrder, Asset, ChecklistTemplate, MaintenanceSchedule
- **Job/Project Management**: Job, Timesheet, MaterialIssue
- **HR & Payroll**: PayrollRun, PayrollItem, Payslip
- **Finance**: Invoice, Bill, Payment, Journal, ChartOfAccount

## 🏢 Struktur Organisasi

### Companies (PT)
- **PT NILO** - Unit: HVAC Rittal, HVAC Split, Fabrikasi, Efluen
- **PT ZTA** - Unit: HVAC Rittal, HVAC Split
- **PT TAM** - Unit: Fabrikasi
- **PT HTK** - Unit: Cutting Grass

### Unit Types
- `HVAC_RITTAL` - Maintenance AC Rittal
- `HVAC_SPLIT` - Maintenance AC Split
- `FABRIKASI` - Fabrication projects
- `EFLUEN` - Effluent treatment
- `CUTTING_GRASS` - Landscaping services

## 👥 Role-Based Access Control (RBAC)

### User Roles
- **GROUP_VIEWER / EXECUTIVE** - Dashboard HT-Group (konsolidasi)
- **PT_MANAGER** - Akses seluruh sub-menu di PT-nya
- **UNIT_SUPERVISOR** - Kelola WO/Job di unitnya
- **TECHNICIAN/OPERATOR** - Eksekusi WO, isi checklist, timesheet
- **HR** - Kelola employee, absensi, payroll
- **FINANCE_AR/AP** - Kelola invoice/bill, payment, rekonsil
- **GL_ACCOUNTANT** - Posting jurnal, month-end close

### Route Permissions
Sistem middleware mengatur akses berdasarkan role dan path URL.

## 🛠️ Fitur Utama

### 1. Work Order Management (HVAC)
- **Path**: `/pt-{company}/hvac-{type}/wo`
- **Features**:
  - Create/Update/Delete Work Orders
  - Asset management
  - Checklist dan PM scheduling
  - Parts & Material tracking
  - Status workflow: Draft → In Progress → Waiting Review → Approved → Billed → Closed

### 2. Job/Project Management
- **Path**: `/pt-{company}/{unit}/jobs`
- **Features**:
  - Project/Job Orders
  - Timesheet tracking
  - Material Issue
  - Progress monitoring
  - Status workflow: Open → In Progress → For Billing → Billed → Closed

### 3. HR & Payroll
- **Path**: `/pt-{company}/hr`
- **Features**:
  - Employee management
  - Attendance tracking
  - Payroll run processing
  - Payslip generation
  - Status workflow: Draft → In Review → Approved → Posted → Closed

### 4. Finance (AR/AP/GL)
- **Path**: `/pt-{company}/finance`
- **Features**:
  - Accounts Receivable (Customer invoices)
  - Accounts Payable (Vendor bills)
  - Payment processing
  - Journal entries
  - Bank reconciliation

## 🎨 UI Components

### Dashboard Components
- `DashboardShell` - Layout wrapper
- `DashboardHeader` - Page headers
- `DashboardCards` - Metric cards
- `RecentActivity` - Activity feed
- `OverviewCharts` - Chart placeholder

### Feature Components
- `WorkOrderList` - WO management table
- `JobList` - Job management table
- `HRDashboard` - HR overview with tabs
- `FinanceDashboard` - Finance overview with tabs

### Layout Components
- `AppSidebar` - Navigation sidebar
- `LoginForm` - Authentication form

## 🔐 Authentication

### Demo Credentials
```
Email: admin@ht-group.com
Password: password123
Role: PT_MANAGER

Email: supervisor@ht-group.com  
Password: password123
Role: UNIT_SUPERVISOR

Email: technician@ht-group.com
Password: password123
Role: TECHNICIAN
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm atau yarn

### Installation
```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Authentication pages
│   ├── (protected-pages)/      # Protected application pages
│   └── api/                    # API routes
├── components/
│   ├── auth/                   # Authentication components
│   ├── dashboard/              # Dashboard components
│   ├── finance/                # Finance components
│   ├── hr/                     # HR components
│   ├── jobs/                   # Job management components
│   ├── layout/                 # Layout components
│   ├── ui/                     # Shadcn/ui components
│   └── work-orders/            # Work order components
├── server/
│   ├── api/                    # Business logic layer
│   ├── auth/                   # Authentication config
│   ├── services/               # Data access layer
│   └── db.ts                   # Database connection
└── styles/                     # Global styles
```

## 🔄 Business Workflows

### Work Order Flow
1. Supervisor creates WO
2. Technician executes and fills checklist
3. Supervisor reviews and approves
4. Finance generates invoice (if billable)
5. GL posts journal entries

### Job/Project Flow
1. Supervisor creates Job Order
2. Team logs timesheet and material usage
3. Progress tracking and milestone updates
4. Billing based on completion
5. Job closure and cost analysis

### Payroll Flow
1. HR creates Payroll Run
2. System calculates based on timesheet/attendance
3. HR reviews and approves
4. GL posts payroll journals
5. Payslip generation and distribution

## 🎯 Next Steps

1. **Database Seeding** - Add master data (companies, units, employees)
2. **Real API Integration** - Replace mock data with actual API calls
3. **Chart Integration** - Add Recharts for analytics
4. **File Upload** - Add document/photo upload functionality
5. **Reporting** - Build comprehensive reporting system
6. **Mobile Responsive** - Optimize for mobile devices
7. **Testing** - Add unit and integration tests

## 📝 Notes

- Sistem menggunakan JWT strategy untuk session management
- Database schema sudah lengkap untuk semua modul
- UI menggunakan Shadcn/ui dengan Tailwind CSS
- Routing mengikuti struktur PT → Unit → Module
- RBAC terintegrasi di middleware level
