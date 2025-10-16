# Monthly Report Module - Implementation Guide

## 📋 Overview

Modul laporan bulanan menyediakan ringkasan agregat untuk:
- **PB Import**: Total tonase, potongan, netto, harga rata-rata, pembayaran, PPh
- **Inventory**: Jumlah dokumen GRN, Issue, Transfer, Adjustment, Stock Count

## 🏗️ Architecture (3-Tier)

### Tier 1 - Controller (API Routes)
**File**: `src/app/api/reports/monthly/route.ts`
- Menerima HTTP request
- Validasi query parameters
- Memanggil API module
- Mengembalikan HTTP response

### Tier 2 - Application Service
**File**: `src/server/api/reports.ts`
- Validasi input dengan Zod
- Orkestrasi business logic
- Error handling
- Return standardized response

### Tier 3 - Domain Layer

**Services**: `src/server/services/reports.service.ts`
- Business logic untuk agregasi
- Koordinasi multiple repositories
- Data transformation

**Repositories**: `src/server/repositories/reports.repo.ts`
- `PbImportReportRepository`: Agregasi data PB Import
- `InventoryReportRepository`: Agregasi data Inventory
- Direct Prisma queries

**Types**: `src/server/types/reports.ts`
- DTOs untuk request/response
- Summary types
- Breakdown types

**Schemas**: `src/server/schemas/reports.ts`
- Zod validation schemas
- Input validation

**Utils**: `src/server/lib/date-utils.ts`
- `toMonthRange()`: Convert YYYY-MM to date range
- `formatDate()`: Format date to YYYY-MM-DD
- `getCurrentMonth()`: Get current month string

## 📊 API Endpoints

### GET /api/reports/monthly

**Query Parameters**:
- `month` (optional): Format YYYY-MM (e.g., "2025-01")
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `companyCode` (optional): Filter by company
- `includeBreakdown` (optional): Include detailed breakdowns (default: false)

**Note**: Either `month` OR both `startDate` and `endDate` must be provided.

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2025-01-01T00:00:00.000Z",
      "end": "2025-01-31T23:59:59.999Z"
    },
    "pbSummary": {
      "count": 150,
      "totalTerimaKg": 45000.50,
      "totalPotKg": 2250.25,
      "totalNettoKg": 42750.25,
      "avgPrice": 1500.00,
      "totalPayment": 64125375.00,
      "totalPph": 1923761.25
    },
    "inventorySummary": {
      "grn": 25,
      "issue": 30,
      "transfer": 15,
      "adjustment": 5,
      "count": 3
    },
    "pbDailyBreakdown": [...],
    "pbSupplierBreakdown": [...],
    "inventoryDailyBreakdown": [...],
    "inventoryMaterialBreakdown": [...]
  },
  "statusCode": 200
}
```

## 🎨 Frontend Components

### MonthlyReportCard
**File**: `src/components/reports/monthly-report-card.tsx`

**Features**:
- Month selector (input type="month")
- Toggle untuk include breakdown
- Export to CSV
- Summary cards untuk PB Import & Inventory
- Tabs untuk detailed breakdowns:
  - PB Harian
  - PB per Supplier
  - Inventory Harian
  - Material Movement

**Usage**:
```tsx
import { MonthlyReportCard } from "~/components/reports/monthly-report-card";

export default function ReportsPage() {
  return (
    <div className="container py-6">
      <MonthlyReportCard />
    </div>
  );
}
```

## 📁 File Structure

```
src/
├── app/api/reports/
│   └── monthly/
│       └── route.ts                    # API Controller
├── server/
│   ├── api/
│   │   └── reports.ts                  # Application Service
│   ├── services/
│   │   └── reports.service.ts          # Business Logic
│   ├── repositories/
│   │   └── reports.repo.ts             # Data Access
│   ├── types/
│   │   └── reports.ts                  # TypeScript Types
│   ├── schemas/
│   │   └── reports.ts                  # Zod Schemas
│   └── lib/
│       └── date-utils.ts               # Date Utilities
└── components/
    └── reports/
        └── monthly-report-card.tsx     # UI Component
```

## 🔧 Implementation Details

### PB Import Aggregation

```typescript
// Aggregate from PbTicket table
const rows = await db.pbTicket.findMany({
  where: { date: { gte: start, lte: end } },
  select: {
    receiveKg: true,
    potKg: true,
    netto1Kg: true,
    price: true,
    totalPay: true,
    pph: true,
  }
});

// Manual aggregation for accurate Decimal handling
let totalTerima = 0;
let totalPotKg = 0;
// ... sum all values
```

### Inventory Aggregation

```typescript
// Count documents in parallel
const [grn, issue, transfer, adjust, scount] = await Promise.all([
  db.goodsReceipt.count({ where: { date: dateFilter } }),
  db.goodsIssue.count({ where: { date: dateFilter } }),
  db.stockTransfer.count({ where: { date: dateFilter } }),
  db.stockAdjustment.count({ where: { date: dateFilter } }),
  db.stockCount.count({ where: { date: dateFilter } }),
]);
```

### Daily Breakdown

```typescript
// Group by date using Map
const grouped = new Map<string, Breakdown>();

for (const row of rows) {
  const dateKey = formatDate(row.date);
  const existing = grouped.get(dateKey);
  
  if (existing) {
    existing.count++;
    existing.totalTerimaKg += Number(row.receiveKg ?? 0);
    // ... accumulate other fields
  } else {
    grouped.set(dateKey, { /* new entry */ });
  }
}

return Array.from(grouped.values());
```

## 🧪 Testing

### Manual Testing

1. **Basic Report**:
```bash
curl "http://localhost:3000/api/reports/monthly?month=2025-01"
```

2. **With Breakdown**:
```bash
curl "http://localhost:3000/api/reports/monthly?month=2025-01&includeBreakdown=true"
```

3. **Date Range**:
```bash
curl "http://localhost:3000/api/reports/monthly?startDate=2025-01-01&endDate=2025-01-15"
```

4. **With Company Filter**:
```bash
curl "http://localhost:3000/api/reports/monthly?month=2025-01&companyCode=PT-PKS"
```

### Expected Behavior

- ✅ Returns summary for specified period
- ✅ Handles empty data gracefully (returns 0 counts)
- ✅ Validates input (400 if invalid month format)
- ✅ Includes breakdown only when requested
- ✅ Sorts breakdowns appropriately (daily by date, supplier by payment)

## 🚀 Usage Examples

### Example 1: Current Month Report
```typescript
const result = await getMonthlyReport({
  month: "2025-01",
  includeBreakdown: false,
});
```

### Example 2: Custom Date Range with Breakdown
```typescript
const result = await getMonthlyReport({
  startDate: "2025-01-01",
  endDate: "2025-01-15",
  includeBreakdown: true,
});
```

### Example 3: Company-Specific Report
```typescript
const result = await getMonthlyReport({
  month: "2025-01",
  companyCode: "PT-PKS",
  includeBreakdown: true,
});
```

## 📈 Performance Considerations

1. **Parallel Queries**: PB and Inventory summaries fetched in parallel
2. **Conditional Breakdown**: Detailed breakdowns only fetched when requested
3. **Indexed Queries**: Ensure indexes on `date` fields:
   ```sql
   CREATE INDEX idx_pb_ticket_date ON "PbTicket"("date");
   CREATE INDEX idx_goods_receipt_date ON "GoodsReceipt"("date");
   CREATE INDEX idx_goods_issue_date ON "GoodsIssue"("date");
   CREATE INDEX idx_stock_transfer_date ON "StockTransfer"("date");
   CREATE INDEX idx_stock_adjustment_date ON "StockAdjustment"("date");
   CREATE INDEX idx_stock_count_date ON "StockCount"("date");
   ```

## 🔐 Security & Authorization

**Recommended**: Add role-based access control in the API route:

```typescript
import { auth } from "~/server/auth";
import { hasRole } from "~/server/auth/role";

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", statusCode: 401 },
      { status: 401 }
    );
  }

  // Only allow certain roles to view reports
  if (!hasRole(session.user.role, ["EXECUTIVE", "PT_PKS_ADMIN", "GROUP_VIEWER"])) {
    return NextResponse.json(
      { success: false, error: "Forbidden", statusCode: 403 },
      { status: 403 }
    );
  }

  // ... rest of the handler
}
```

## 📝 Future Enhancements

1. **Export to Excel**: Add XLSX export with multiple sheets
2. **Charts**: Add visual charts using Recharts
3. **Email Reports**: Schedule and email monthly reports
4. **Comparison**: Compare current month vs previous month
5. **Filters**: Add more filters (warehouse, material category, etc.)
6. **Caching**: Cache reports for better performance

## ✅ Checklist

- [x] Types & DTOs defined
- [x] Zod schemas created
- [x] Date utilities implemented
- [x] Repositories implemented
- [x] Service layer implemented
- [x] API module implemented
- [x] API route implemented
- [x] Frontend component created
- [x] Documentation written
- [ ] Manual testing completed
- [ ] Database indexes added
- [ ] Authorization implemented
- [ ] Integration with existing pages

---

**Status**: ✅ Core implementation complete, ready for testing and integration

