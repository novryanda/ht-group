# ✅ Weighbridge System - Implementation Status

## 🎯 What Has Been Completed

### 1. ✅ Database Schema (Prisma)

**Modified:** `prisma/schema.prisma`

**Changes:**
- ❌ Removed: `relasiNama`, `beneficiaryNm` 
- ✅ Added Relations:
  - `vehicleId` → `Vehicle` (plateNo)
  - `supplierId` → `SupplierTBS` (nama, bank info, lokasi kebun)
  - `itemId` → `Item` (produk)
- ✅ Added `createdById` field
- ✅ Default values for pricing fields (0)
- ✅ Back-relations added to Vehicle, SupplierTBS, Item models

**Migration Required:**
```bash
npx prisma migrate dev --name add_weighbridge_relations
# atau
npx prisma db push
```

### 2. ✅ Type Definitions

**Created:** `src/server/types/pt-pks/weighbridge.ts`

Includes:
- `WeighbridgeTicketDTO` - Full ticket with relations
- `CreatePBHarianDTO` - Phase 1 input
- `UpdateTimbanganPricingDTO` - Phase 2 input
- `BulkCreatePBHarianDTO` - Bulk operations
- `WeighbridgeQueryDTO` - Filtering
- `VehicleLookupDTO`, `SupplierLookupDTO`, `ItemLookupDTO` - Dropdowns
- `WeighbridgeCalculation` - Calculated fields

### 3. ✅ Validation Schemas

**Created:** `src/server/schemas/pt-pks/weighbridge.ts`

Features:
- Zod schemas for all input DTOs
- `validateCalculations()` - Validates weighing formulas
- `calculatePricing()` - Auto-calculates totals

Validations:
```typescript
✅ netto1 = |timbang1 - timbang2|
✅ potKg = netto1 * potPercent  
✅ beratTerima = netto1 - potKg
✅ total = beratTerima * hargaPerKg
✅ totalUpahBongkar = beratTerima * upahBongkarPerKg
✅ totalPph = total * pphRate
✅ totalPembayaranSupplier = total - totalPph
```

### 4. ✅ Mapper Layer

**Created:** `src/server/mappers/pt-pks/weighbridge.mapper.ts`

Features:
- `toDTO()` - Convert Prisma model to DTO
- `toDTOList()` - Batch conversion
- Relation mappers for Vehicle, Supplier, Item
- Lookup mappers for dropdown options
- Auto-extract `lokasiKebun` from `SupplierTBS.profilKebun` JSON

### 5. ✅ Repository Layer

**Created:** `src/server/repositories/pt-pks/weighbridge.repo.ts`

Features:
- `findMany()` - List with filters & pagination
- `findById()` - Get single ticket with relations
- `findByNoSeri()` - Check duplicate
- `create()` - Create single ticket
- `createMany()` - Bulk create
- `updatePricing()` - Update pricing fields
- `updateStatus()` - Change status
- `delete()` - Delete ticket
- `generateNoSeri()` - Auto-generate serial number (YYYYMMDD-###)
- Lookup helpers: `getActiveVehicles()`, `getActiveSuppliers()`, `getActiveItems()`

### 6. ✅ Service Layer

**Created:** `src/server/services/pt-pks/weighbridge.service.ts`

Features:
- `getList()` - With pagination
- `getById()` - Single ticket
- `createPBHarian()` - Phase 1 create with validation
- `bulkCreatePBHarian()` - Phase 1 bulk create
- `updatePricing()` - Phase 2 pricing update
- `delete()` - Only DRAFT status
- `generateNoSeri()` - Serial number generation
- Lookup methods: `getVehicles()`, `getSuppliers()`, `getItems()`

Business Rules:
- ✅ Validate calculations before create
- ✅ Check duplicate noSeri
- ✅ Only DRAFT status can be updated/deleted
- ✅ Auto-fill pricing fields with 0 on create

### 7. ✅ API Module

**Created:** `src/server/api/pt-pks/weighbridge.ts`

Features:
- `getList()` - List with filters
- `getById()` - Single ticket
- `createPBHarian()` - Phase 1 create
- `bulkCreatePBHarian()` - Phase 1 bulk
- `updatePricing()` - Phase 2 update
- `delete()` - Delete ticket
- `generateNoSeri()` - Generate serial
- Lookup methods for all dropdowns
- Standardized error handling

### 8. ✅ API Routes

**Created/Updated:**
1. `src/app/api/pt-pks/pb-harian/route.ts`
   - GET: List tickets
   - POST: Bulk create tickets

2. `src/app/api/pt-pks/timbangan/route.ts`
   - GET: List tickets for pricing
   - PATCH: Update pricing

3. `src/app/api/pt-pks/timbangan/[id]/route.ts`
   - GET: Get single ticket
   - DELETE: Delete ticket

4. `src/app/api/pt-pks/timbangan/lookups/route.ts`
   - GET: Get vehicles/suppliers/items for dropdowns

**RBAC:**
- View: PT_PKS_ADMIN, FINANCE_AP, FINANCE_AR, GL_ACCOUNTANT, OPERATOR, EXECUTIVE, GROUP_VIEWER
- Create (PB Harian): PT_PKS_ADMIN, FINANCE_AP, OPERATOR
- Edit (Timbangan): PT_PKS_ADMIN, FINANCE_AP
- Delete: PT_PKS_ADMIN, FINANCE_AP

### 9. ✅ Documentation

**Created:**
- `docs/WEIGHBRIDGE_SYSTEM.md` - Complete system documentation
- `docs/WEIGHBRIDGE_IMPLEMENTATION_STATUS.md` - This file

---

## ⏳ What's Pending

### 1. UI Components (Need Implementation)

#### A. PB Harian Inline Editable Table

**File:** `src/components/dashboard/pt-pks/timbangan-supplier/pb-harian/PBHarianTable.tsx`

**Requirements:**
- Inline editable table
- Add/Delete row buttons
- Columns:
  - No Seri (input)
  - Tanggal (date picker)
  - Jam Masuk (datetime picker)
  - Jam Keluar (datetime picker, optional)
  - Kendaraan (dropdown → Vehicle.plateNo)
  - Supplier (dropdown → SupplierTBS.namaPemilik)
  - Produk (dropdown → Item.name)
  - Timbang 1 (number input)
  - Timbang 2 (number input)
  - Netto 1 (auto-calculated, readonly)
  - Potongan % (number input)
  - Potongan Kg (auto-calculated, readonly)
  - Berat Terima (auto-calculated, readonly)
  - Lokasi Kebun (auto-filled from supplier, readonly)
  - Penimbang (input, optional)
  - Aksi (save, delete)

**Auto-Calculations:**
```typescript
netto1 = Math.abs(timbang1 - timbang2)
potKg = netto1 * potPercent
beratTerima = netto1 - potKg
```

**When Supplier Selected:**
```typescript
// Auto-fill from SupplierTBS:
lokasiKebun = supplier.lokasiKebun (from profilKebun JSON)
// Bank info is stored in DB, not shown in form
```

**Bulk Save:**
- Collect all rows
- Validate each row
- POST to `/api/pt-pks/pb-harian` with `{ tickets: [...] }`
- Show success/error per row

#### B. Timbangan Pricing Table

**File:** `src/components/dashboard/pt-pks/timbangan-supplier/timbangan/TimbanganTable.tsx`

**Requirements:**
- Display tickets with status DRAFT
- Editable columns:
  - Harga Per Kg (number input)
  - PPh Rate (number input, %)
  - Upah Bongkar Per Kg (number input)
- Read-only columns:
  - No Seri
  - Tanggal
  - Supplier (name)
  - Produk (name)
  - Berat Terima
  - Total (auto-calculated)
  - Total PPh (auto-calculated)
  - Total Upah Bongkar (auto-calculated)
  - Total Pembayaran Supplier (auto-calculated)
- Actions:
  - Save button per row
  - Posting button (for later implementation)

**Auto-Calculations:**
```typescript
total = beratTerima * hargaPerKg
totalUpahBongkar = beratTerima * upahBongkarPerKg
totalPph = total * pphRate
totalPembayaranSupplier = total - totalPph
```

**Save Per Row:**
- PATCH `/api/pt-pks/timbangan` with `{ id, hargaPerKg, pphRate, upahBongkarPerKg }`
- Update calculations in table

### 2. Migration & Testing

**Steps:**
1. Run Prisma migration:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. Test API endpoints:
   ```bash
   # Get vehicles
   GET /api/pt-pks/timbangan/lookups?type=vehicles
   
   # Get suppliers
   GET /api/pt-pks/timbangan/lookups?type=suppliers
   
   # Get items
   GET /api/pt-pks/timbangan/lookups?type=items
   
   # Create tickets
   POST /api/pt-pks/pb-harian
   
   # Update pricing
   PATCH /api/pt-pks/timbangan
   ```

3. Test calculations in browser console

4. Test validations

---

## 📊 Summary

**Backend:** ✅ 100% Complete
- ✅ Database schema
- ✅ Types & DTOs
- ✅ Validation schemas
- ✅ Mappers
- ✅ Repositories
- ✅ Services
- ✅ API modules
- ✅ API routes
- ✅ Documentation

**Frontend:** ⏳ 0% Complete
- ⏳ PBHarianTable component (inline editable)
- ⏳ TimbanganTable component (pricing input)
- ⏳ Integration with backend APIs
- ⏳ Auto-calculations in UI
- ⏳ Form validations

**Testing:** ⏳ 0% Complete
- ⏳ Database migration
- ⏳ API endpoint testing
- ⏳ Calculation testing
- ⏳ Validation testing
- ⏳ End-to-end testing

---

## 🚀 Next Steps

1. **Run Migration:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Test Backend:**
   - Use Postman/cURL to test all endpoints
   - Verify calculations
   - Check validations

3. **Implement UI:**
   - Start with PBHarianTable (simpler, inline edit)
   - Then TimbanganTable (pricing input)
   - Use shadcn/ui components
   - Implement auto-calculations with `useEffect`

4. **Integration Testing:**
   - Test full flow: PB Harian → Timbangan → Posting
   - Verify data consistency
   - Test edge cases

---

**Status:** Backend Ready for Testing  
**Next:** UI Component Implementation  
**Estimated:** 4-6 hours for UI components


