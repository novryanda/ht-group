# Material & Inventory Module - PT PKS

## Overview

Modul Material & Inventory adalah sistem manajemen persediaan gudang yang lengkap untuk PT PKS, dibangun dengan arsitektur 3-tier (Presentation → Controller → Service/Repository) menggunakan Next.js 15, Prisma ORM, dan PostgreSQL.

## Fitur Utama

### 1. Data Master
- **Unit of Measure (UoM)**: Kelola satuan ukuran (kg, liter, pcs, dll)
- **Kategori Material**: Klasifikasi dan pengelompokan material
- **Material**: Data master material dan barang
- **Gudang (Warehouse)**: Tempat penyimpanan utama
- **Lokasi Penyimpanan**: Lokasi detail dalam gudang (Zone, Rack, Bin)

### 2. Transaksi
- **Saldo Awal**: Input saldo awal stok material
- **Goods Receipt Note (GRN)**: Penerimaan barang masuk gudang
- **Goods Issue**: Pengeluaran barang dari gudang
- **Stock Transfer**: Transfer stok antar lokasi
- **Stock Adjustment**: Penyesuaian/koreksi stok
- **Stock Count (Opname)**: Perhitungan fisik dan posting selisih

### 3. Laporan
- **Laporan Stok**: Posisi stok per material dan lokasi
- **Kartu Stok (Stock Ledger)**: Mutasi dan riwayat pergerakan stok

## Arsitektur

### Database Layer (Prisma Schema)

**Enums:**
- `LocationType`: ZONE, RACK, BIN
- `LedgerType`: IN_OPENING, IN_GRN, IN_TRANSFER, IN_ADJUSTMENT, OUT_ISSUE, OUT_TRANSFER, OUT_ADJUSTMENT, COUNT_DIFF_IN, COUNT_DIFF_OUT

**Models:**
- `Uom` - Unit of Measure
- `UomConversion` - Konversi antar UoM
- `MaterialCategory` - Kategori material
- `Material` - Data master material
- `Warehouse` - Gudang
- `Location` - Lokasi penyimpanan (hierarchical)
- `Stock` - Saldo stok per material per lokasi
- `StockLedger` - Kartu stok (mutasi)
- `GoodsReceipt` + `GoodsReceiptItem` - GRN
- `GoodsIssue` + `GoodsIssueItem` - Pengeluaran
- `StockTransfer` - Transfer antar lokasi
- `StockAdjustment` + `StockAdjustmentItem` - Penyesuaian
- `StockCount` + `StockCountLine` - Stock opname

### Repository Layer

**Files:**
- `src/server/repositories/inventory.repo.ts` - UoM, Category, Material, Warehouse, Location
- `src/server/repositories/stock.repo.ts` - Stock, StockLedger
- `src/server/repositories/docs.repo.ts` - GRN, Issue, Transfer, Adjustment, Count

**Key Methods:**
- `findMany()` - List dengan pagination, search, sorting
- `findById()` - Get by ID dengan includes
- `create()` - Create entity
- `update()` - Update entity
- `delete()` - Soft/hard delete
- `getLastXXXNoForMonth()` - Get last document number untuk auto-generate

### Service Layer

**Files:**
- `src/server/services/stock.service.ts` - Core stock operations (atomic)
- `src/server/services/inventory.service.ts` - Master data services
- `src/server/services/inventory-docs.service.ts` - Document transaction services

**StockService (Critical):**
```typescript
// Atomic stock operations dengan Prisma transaction
increase(materialId, locationId, qty, ledgerType, refTable, refId, note)
decrease(materialId, locationId, qty, ledgerType, refTable, refId, note)
transfer(fromLocId, toLocId, materialId, qty, refTable, refId, note)
postOpeningBalance(lines[])
postStockCountDiff(lines[], refId)
```

**Business Rules:**
- Semua posting dokumen WAJIB: update Stock (upsert per lokasi) + tulis StockLedger (beforeQty/afterQty) dalam satu transaksi Prisma
- Stock tidak boleh negatif (throw error STOCK_INSUFFICIENT)
- Material dan Location harus aktif
- Transfer memerlukan stok cukup di lokasi asal
- Stock Count: OPEN → POSTED (generate diff ledgers)

### API Layer

**Files:**
- `src/server/api/inventory.ts` - Master data APIs
- `src/server/api/inventory-docs.ts` - Document transaction APIs

**Error Handling:**
- `VALIDATION_ERROR` → 400
- `NOT_FOUND` → 404
- `CODE_EXISTS` → 409
- `STOCK_INSUFFICIENT` → 409
- `INACTIVE` / `ALREADY_POSTED` → 422

### Controller Layer (API Routes)

**Structure:**
```
src/app/api/inventory/
├── uom/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (GET, PATCH, DELETE)
├── categories/
├── materials/
├── warehouses/
├── locations/
├── stock/route.ts (GET)
├── ledger/route.ts (GET)
├── grn/
├── issue/
├── transfer/
├── adjustment/
└── stock-count/
```

**Authorization:**
- Read: OPERATOR, UNIT_SUPERVISOR, PT_PKS_ADMIN, EXECUTIVE, GROUP_VIEWER
- Write: UNIT_SUPERVISOR, PT_PKS_ADMIN, EXECUTIVE, GROUP_VIEWER
- Delete: PT_PKS_ADMIN, EXECUTIVE

### Presentation Layer (UI)

**Landing Page:**
`src/app/(protected-pages)/dashboard/pt-pks/datamaster/material-inventory/page.tsx`

**Pages:**
- `/materials` - Material list & form
- `/stock` - Stock report
- `/grn` - GRN list & form
- `/issue` - Goods issue
- `/transfer` - Stock transfer
- `/adjustment` - Stock adjustment
- `/stock-count` - Stock opname
- `/ledger` - Kartu stok

**Components:**
```
src/components/pt-pks/inventory/
├── materials/
│   ├── material-list.tsx
│   └── material-form-dialog.tsx
├── transactions/
│   ├── grn-list.tsx
│   └── grn-form-dialog.tsx
└── reports/
    └── stock-report.tsx
```

## Document Numbering

Format: `PREFIX-YYYYMM-####`

- GRN: `GRN-202510-0001`
- Issue: `ISS-202510-0001`
- Transfer: `TRF-202510-0001`
- Adjustment: `ADJ-202510-0001`
- Count: `CNT-202510-0001`

Auto-reset sequence setiap bulan.

## Data Flow Example: GRN Posting

1. **User** submits GRN form via UI
2. **API Route** (`/api/inventory/grn`) validates auth & permissions
3. **InventoryAPI.createGrn()** validates input dengan Zod schema
4. **GrnService.create()** generates document number
5. **Prisma Transaction** starts:
   - Create GoodsReceipt + GoodsReceiptItem
   - For each item: call `StockService.increase()`
     - Get current stock
     - Calculate beforeQty, afterQty
     - Upsert Stock
     - Create StockLedger entry
6. **Transaction commits** - all or nothing
7. **Response** returns created GRN with updated stock
8. **UI** refetches data and shows success toast

## Testing Checklist

### Master Data
- [ ] Create/Edit/Delete UoM
- [ ] Create/Edit/Delete Category
- [ ] Create/Edit/Delete Material (with category & UoM validation)
- [ ] Create/Edit/Delete Warehouse
- [ ] Create/Edit/Delete Location (with hierarchy validation)

### Transactions
- [ ] Post Opening Balance (check stock & ledger created)
- [ ] Create GRN (check stock increased, ledger IN_GRN)
- [ ] Create Issue (check stock decreased, ledger OUT_ISSUE, error if insufficient)
- [ ] Create Transfer (check stock moved, 2 ledgers: OUT_TRANSFER + IN_TRANSFER)
- [ ] Create Adjustment (check stock adjusted, ledger IN/OUT_ADJUSTMENT)
- [ ] Create Stock Count OPEN → Post (check diff ledgers created)

### Reports
- [ ] Stock Report shows correct qtyOnHand
- [ ] Stock Ledger shows all movements with beforeQty/afterQty
- [ ] Low stock alert works (qty < minStock)

### Edge Cases
- [ ] Cannot issue more than available stock
- [ ] Cannot transfer from location with insufficient stock
- [ ] Cannot post opening balance if stock already exists
- [ ] Cannot post stock count twice
- [ ] Material/Location must be active for transactions
- [ ] Document numbers auto-increment correctly
- [ ] Month change resets sequence to 0001

## API Endpoints

### Master Data
- `GET /api/inventory/uom` - List UoMs
- `POST /api/inventory/uom` - Create UoM
- `GET /api/inventory/uom/[id]` - Get UoM
- `PATCH /api/inventory/uom/[id]` - Update UoM
- `DELETE /api/inventory/uom/[id]` - Delete UoM
- (Similar for categories, materials, warehouses, locations)

### Transactions
- `POST /api/inventory/opening-balance` - Post opening balance
- `GET /api/inventory/grn` - List GRNs
- `POST /api/inventory/grn` - Create GRN
- `GET /api/inventory/grn/[id]` - Get GRN detail
- (Similar for issue, transfer, adjustment, stock-count)

### Reports
- `GET /api/inventory/stock` - Stock report
- `GET /api/inventory/ledger` - Stock ledger

## Next Steps (Future Enhancements)

1. **Integration dengan Purchasing**: Link GRN dengan Purchase Order
2. **Integration dengan Finance**: Cost tracking per material
3. **Barcode/QR Code**: Scan untuk transaksi
4. **Batch/Serial Number**: Tracking per batch/serial
5. **Expiry Date Management**: Alert untuk material kadaluarsa
6. **Reservation System**: Reserve stock untuk production order
7. **Multi-UoM Conversion**: Auto-convert antar UoM
8. **Advanced Reports**: 
   - Stock aging
   - Movement analysis
   - ABC analysis
   - Reorder point calculation
9. **Mobile App**: Untuk warehouse staff
10. **Dashboard Analytics**: Real-time inventory metrics

## File Structure Summary

```
prisma/
└── schema.prisma (19 new models)

src/server/
├── lib/codegen.ts (document number generators)
├── schemas/inventory.ts (Zod validation schemas)
├── types/inventory.ts (TypeScript DTOs)
├── mappers/inventory.mapper.ts (Prisma ↔ DTO)
├── repositories/
│   ├── inventory.repo.ts
│   ├── stock.repo.ts
│   └── docs.repo.ts
├── services/
│   ├── stock.service.ts
│   ├── inventory.service.ts
│   └── inventory-docs.service.ts
└── api/
    ├── inventory.ts
    └── inventory-docs.ts

src/app/api/inventory/
├── uom/
├── materials/
├── grn/
└── stock/

src/app/(protected-pages)/dashboard/pt-pks/datamaster/material-inventory/
├── page.tsx (landing)
├── materials/page.tsx
├── stock/page.tsx
└── grn/page.tsx

src/components/pt-pks/inventory/
├── materials/
├── transactions/
└── reports/

docs/
└── INVENTORY_MODULE.md (this file)
```

## Deployment Notes

1. Run migration: `npx prisma db push` atau `npx prisma migrate dev`
2. Seed initial data (UoM, Categories) jika diperlukan
3. Test all endpoints dengan Postman/Thunder Client
4. Verify authorization rules
5. Test UI flows end-to-end
6. Monitor Prisma query performance
7. Setup database indexes untuk performance (materialId, locationId, date ranges)

---

**Author**: Augment Agent  
**Date**: 2025-10-15  
**Version**: 1.0.0

