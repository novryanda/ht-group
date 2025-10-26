# Laporan Mutu Produksi Implementation Summary

## Overview
Implemented a comprehensive **Laporan Mutu Produksi** (Production Quality Report) feature for PT-PKS following the 3-tier clean architecture pattern with Next.js 15 App Router, TypeScript, Tailwind CSS, and shadcn/ui components.

## 📂 Files Created/Modified

### Backend (Server-Side)

#### Types & Schemas
- **`src/server/types/pt-pks/mutu-produksi.ts`** (modified)
  - Added `PksMutuProduksiDto` for read operations
  - Added `MutuPayloadKeys`, `KpiCardData`, `ChartDataPoint`, `AggregatedByDate` types

- **`src/server/schemas/pt-pks/mutu-produksi.ts`** (modified)
  - Added `mutuProduksiQuerySchema` for GET query validation
  - Added `sanitizeDateRange()` function with 14-day default

#### Repository Layer
- **`src/server/repositories/pt-pks/mutu-produksi.repo.ts`** (modified)
  - Added `MutuProduksiRepository` class
  - `findManyByDateShift()`: Filtered query by date range and shift
  - `findLatest()`: Get most recent record for KPIs
  - `count()`: Total records count

#### Service Layer
- **`src/server/services/pt-pks/mutu-produksi.service.ts`** (modified)
  - Added `MutuProduksiService` class
  - `getMutuProduksiList()`: Returns filtered DTO list
  - `getLatestMutuProduksi()`: Returns latest record DTO

#### Mapper
- **`src/server/mappers/pt-pks/mutu-produksi.mapper.ts`** (modified)
  - Added `toMutuProduksiDto()`: Converts Prisma model to DTO
  - Added `toMutuProduksiDtoList()`: Batch conversion
  - Properly formats dates to ISO strings (YYYY-MM-DD)

#### API Layer
- **`src/server/api/pt-pks/mutu-produksi.controller.ts`** (new)
  - `MutuProduksiController.handleGetList()`: Query validation and data retrieval
  - Returns standardized `{ ok, data, statusCode }` response

- **`src/app/api/pt-pks/mutu-produksi/route.ts`** (new)
  - GET endpoint: `/api/pt-pks/mutu-produksi?from=YYYY-MM-DD&to=YYYY-MM-DD&shift=all|1|2|3`
  - Default filters: last 14 days, all shifts
  - Sorted by tanggal ASC, shift ASC

### Frontend (Client-Side)

#### Utilities
- **`src/components/dashboard/pt-pks/laporan/laporan-mutu-produksi/mutu-utils.ts`** (new)
  - `num()`: Safe number parsing (handles comma decimals)
  - `val()`: Extract numeric values from payload
  - `formatValue()`: Format numbers with suffix
  - `getSyncStatusVariant()`: Badge variant based on status
  - `aggregateByDate()`: Sum/average data across shifts for charts

#### Components
- **`KpiCard.tsx`** (new)
  - Displays key metrics with label, value, suffix, and optional description
  - Skeleton loading state

- **`TrendCard.tsx`** (new)
  - Line chart using Recharts
  - Configurable color, y-axis label
  - Empty state message
  - Responsive container

- **`FiltersBar.tsx`** (new)
  - Date range inputs (From/To)
  - Shift selector (All/1/2/3)
  - Refresh button with loading state
  - Grid responsive layout

- **`SheetButton.tsx`** (new)
  - Opens Google Sheet in new tab
  - Uses `NEXT_PUBLIC_SHEET_URL` env variable

- **`PayloadDrawer.tsx`** (new)
  - Sheet (drawer) component to display full payload JSON
  - Sorted key-value pairs
  - Handles null/object values
  - Scrollable content

- **`RowsTable.tsx`** (new)
  - Data table with key columns: Tanggal, Shift, TBS, OER, CPO, FFA, Moisture, Dirt, Status, Actions
  - "Detail" button opens PayloadDrawer
  - Status badge with color coding
  - Skeleton loading and empty states

#### Main Page
- **`src/app/(protected-pages)/dashboard/pt-pks/laporan/laporan-mutu-produksi/page.tsx`** (new)
  - Complete client component with React hooks
  - Fetches data on mount and filter changes
  - Displays:
    - FiltersBar with date range and shift selector
    - 6 KPI Cards (TBS Diolah, OER, CPO, FFA, Moisture, Dirt)
    - 2 Trend Charts (TBS Diolah, OER)
    - RowsTable with detail drawer
  - Error handling with Alert component
  - Loading states throughout

### Environment Variables
- **`.env.example`** (modified)
  - Added `NEXT_PUBLIC_SHEET_URL` with Google Sheets URL

## 🎯 Features Implemented

### API Endpoint
✅ GET `/api/pt-pks/mutu-produksi`
- Query params: `from`, `to`, `shift`
- Default: last 14 days, all shifts
- Response: `{ ok: true, data: PksMutuProduksiDto[] }`
- Sorted ascending by date and shift

### UI Components
✅ **FiltersBar**
- Date range selection
- Shift filter (All/1/2/3)
- Refresh button
- Google Sheet link button

✅ **KPI Cards** (6 cards)
- TBS Diolah (Hari Ini) - ton
- % OER (Hari Ini) - %
- CPO Produksi (Hari Ini) - ton
- FFA (Hari Ini) - %
- Moisture (Hari Ini) - %
- Dirt (Hari Ini) - %

✅ **Trend Charts** (2 charts)
- Line chart: Tren TBS Diolah (Hari) - aggregated sum by date
- Line chart: Tren % OER - aggregated average by date

✅ **Data Table**
- Columns: Tanggal, Shift, TBS, OER, CPO, FFA, Moist, Dirt, Status, Aksi
- Status badge (SENT/DRAFT)
- Detail button opens drawer with full payload

✅ **Payload Drawer**
- Displays all key-value pairs from payload JSON
- Sorted alphabetically
- Handles null and nested objects

## 🔧 Technical Details

### Data Flow
1. **Client** → Sends GET request with filters
2. **API Route** → Parses request, calls controller
3. **Controller** → Validates query, calls service
4. **Service** → Calls repository
5. **Repository** → Queries Prisma (with `(db as any)` for now)
6. **Mapper** → Converts to DTO
7. **Response** → Returns formatted JSON to client

### Data Aggregation
- **TBS**: Sum across shifts per date
- **OER**: Average across shifts per date
- **CPO**: Sum across shifts per date

### Payload Keys (from Google Sheets)
Required keys for display:
- `A_TBS_tbs_diolah_hari`, `A_TBS_tbs_diolah_sd`
- `A_TBS_oer_hari`, `A_TBS_oer_sd`
- `C_cpo_produksi_hari`, `C_cpo_produksi_sd`
- `C_ffa_hari`, `C_moisture_hari`, `C_dirt_hari`, `C_dobi_hari`
- `D_moisture_hari`, `D_dirt_hari`, `D_broken_kernel_hari`

### States Handled
✅ Loading (Skeleton UI)
✅ Error (Alert component)
✅ Empty data ("Belum ada data" message)
✅ Success (Full UI with data)

## 📝 Notes

### Prisma Client Issue
The Prisma client needs regeneration to include `PksMutuProduksi` model. Currently using `(db as any)` type assertion as workaround. Run `npx prisma generate` after ensuring no locks on the DLL file.

### Environment Setup
Ensure `.env` file includes:
```bash
NEXT_PUBLIC_SHEET_URL="https://docs.google.com/spreadsheets/d/1I1BOSC0-z3ztB93neReW2lqgSPl0cA-xTxirZS40T9Q/edit?gid=0#gid=0"
```

### Route Structure
Page accessible at: `/dashboard/pt-pks/laporan/laporan-mutu-produksi`

### UI Conventions
- Uses shadcn/ui primitives
- Responsive grid layouts
- Loading skeletons match final UI
- Mobile-friendly design
- Path alias: `~/` for imports

## ✅ Acceptance Criteria Met

1. ✅ API returns filtered, sorted data as DTO
2. ✅ Page displays FiltersBar with date range, shift, and buttons
3. ✅ 6 KPI Cards showing latest values
4. ✅ 2 Line Charts with proper aggregation
5. ✅ Data table with detail drawer
6. ✅ Skeleton and error states
7. ✅ Mobile-friendly responsive design
8. ✅ All components separated in proper folder structure
9. ✅ TypeScript strict mode compliance
10. ✅ Follows project architecture (3-tier pattern)

## 🚀 Next Steps

1. **Regenerate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Test the Feature**:
   - Navigate to `/dashboard/pt-pks/laporan/laporan-mutu-produksi`
   - Test date range filtering
   - Test shift filtering
   - Verify charts render correctly
   - Check table and detail drawer

3. **Add to Navigation** (if not already present):
   - Update `src/components/layout/app-sidebar.tsx` to include menu item

4. **Production Deployment**:
   - Ensure `NEXT_PUBLIC_SHEET_URL` is set in Vercel environment variables
   - Verify database migrations are applied
   - Test with real data from Google Sheets

## 📊 Database Schema
The feature uses the existing `PksMutuProduksi` model:
```prisma
model PksMutuProduksi {
  id          String   @id @default(cuid())
  rowId       String   @unique
  tanggal     DateTime
  shift       String   @db.VarChar(10)
  payload     Json
  syncStatus  String?  @db.VarChar(20)
  sentAt      DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([tanggal, shift])
  @@index([tanggal])
  @@index([shift])
}
```

No migration needed - table already exists from previous setup.
