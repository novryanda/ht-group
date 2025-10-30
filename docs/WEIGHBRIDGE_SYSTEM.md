# Weighbridge Ticket System - PT PKS

## 📋 Overview

Sistem timbangan supplier TBS (Tandan Buah Segar) dengan 2 tahap input:
1. **PB Harian** - Input data timbangan (weighing)
2. **Timbangan** - Input harga & kalkulasi pembayaran

## 🏗️ Architecture

### Database Schema Changes

```prisma
model WeighbridgeTicket {
  // Removed: relasiNama, beneficiaryNm
  // Added relations to:
  vehicleId   String      // → Vehicle (plateNo)
  supplierId  String      // → SupplierTBS (nama, bank)
  itemId      String      // → Item (produk)
  
  // Supplier bank info auto-filled from SupplierTBS
  // lokasiKebun auto-filled from SupplierTBS.profilKebun
}
```

### 3-Tier Architecture

**Tier 1 - Controllers** (`src/app/api/pt-pks/`)
- `/pb-harian/route.ts` - GET (list), POST (bulk create)
- `/timbangan/route.ts` - GET (list), PATCH (update pricing)
- `/timbangan/[id]/route.ts` - GET (detail), DELETE
- `/timbangan/lookups/route.ts` - GET lookups (vehicles, suppliers, items)

**Tier 2 - API Module** (`src/server/api/pt-pks/weighbridge.ts`)
- Zod validation
- Error handling
- Business logic orchestration

**Tier 3 - Domain Layer** (`src/server/`)
- `services/pt-pks/weighbridge.service.ts` - Business logic
- `repositories/pt-pks/weighbridge.repo.ts` - Prisma queries
- `mappers/pt-pks/weighbridge.mapper.ts` - DTO transformations
- `schemas/pt-pks/weighbridge.ts` - Zod schemas
- `types/pt-pks/weighbridge.ts` - TypeScript types

## 📊 Data Flow

### Phase 1: PB Harian (Weighing Station)

**Input Fields:**
```typescript
{
  noSeri: string;           // Auto-generated: YYYYMMDD-001
  vehicleId: string;        // Select dari Vehicle.plateNo
  supplierId: string;       // Select dari SupplierTBS.namaPemilik
  itemId: string;           // Select dari Item.name (produk)
  tanggal: Date;
  jamMasuk: DateTime;
  jamKeluar: DateTime | null;
  timbang1: number;         // Timbangan pertama (kg)
  timbang2: number;         // Timbangan kedua (kg)
  netto1: number;           // |timbang1 - timbang2|
  potPercent: number;       // Potongan % (0-1)
  potKg: number;            // netto1 * potPercent
  beratTerima: number;      // netto1 - potKg
  lokasiKebun: string | null; // Auto from supplier
  penimbang: string | null;
}
```

**Auto-Calculated Fields:**
- `lokasiKebun` - From `SupplierTBS.profilKebun.lokasi`
- Bank info (bankName, bankAccountNo, bankAccountName) - From SupplierTBS

**Validations:**
```typescript
✅ netto1 = |timbang1 - timbang2|
✅ potKg = netto1 * potPercent
✅ beratTerima = netto1 - potKg
✅ No duplicate noSeri per company
```

**Status:** `DRAFT` (pricing fields = 0)

### Phase 2: Timbangan (Pricing Input)

**Input Fields:**
```typescript
{
  id: string;              // Ticket ID from Phase 1
  hargaPerKg: number;      // Price per kg
  pphRate: number;         // PPh rate (0-1)
  upahBongkarPerKg: number; // Unloading cost per kg
}
```

**Auto-Calculated Fields:**
```typescript
total = beratTerima * hargaPerKg
totalUpahBongkar = beratTerima * upahBongkarPerKg
totalPph = total * pphRate
totalPembayaranSupplier = total - totalPph
```

**Status:** Still `DRAFT` (ready for posting)

## 🔌 API Endpoints

### 1. PB Harian

#### GET `/api/pt-pks/pb-harian`
List weighbridge tickets with filters.

**Query Params:**
```
?startDate=YYYY-MM-DD
&endDate=YYYY-MM-DD
&supplierId=xxx
&vehicleId=xxx
&itemId=xxx
&status=DRAFT|APPROVED|POSTED
&page=1
&pageSize=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "noSeri": "20250115-001",
      "tanggal": "2025-01-15",
      "jamMasuk": "2025-01-15T08:00:00Z",
      "vehicle": {
        "plateNo": "B 1234 XY",
        "type": "Truk Gandeng"
      },
      "supplier": {
        "namaPemilik": "Pak Budi",
        "lokasiKebun": "Kebun Sawit A",
        "bankName": "BCA",
        "bankAccountNo": "1234567890"
      },
      "item": {
        "name": "TBS Grade A"
      },
      "beratTerima": 25000,
      "hargaPerKg": 0,
      "status": "DRAFT"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### POST `/api/pt-pks/pb-harian`
Bulk create tickets (inline table).

**Request Body:**
```json
{
  "tickets": [
    {
      "companyId": "xxx",
      "noSeri": "20250115-001",
      "vehicleId": "vehicle_id",
      "supplierId": "supplier_id",
      "itemId": "item_id",
      "tanggal": "2025-01-15",
      "jamMasuk": "2025-01-15T08:00:00Z",
      "timbang1": 30000,
      "timbang2": 5000,
      "netto1": 25000,
      "potPercent": 0.05,
      "potKg": 1250,
      "beratTerima": 23750
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": 5,
    "failed": 0,
    "errors": []
  },
  "message": "5 tiket berhasil dibuat, 0 gagal"
}
```

### 2. Timbangan

#### GET `/api/pt-pks/timbangan`
Same as PB Harian, but used for pricing view.

#### PATCH `/api/pt-pks/timbangan`
Update pricing for a ticket.

**Request Body:**
```json
{
  "id": "ticket_id",
  "hargaPerKg": 2500,
  "pphRate": 0.015,
  "upahBongkarPerKg": 150
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ticket_id",
    "beratTerima": 23750,
    "hargaPerKg": 2500,
    "total": 59375000,
    "totalPph": 890625,
    "totalUpahBongkar": 3562500,
    "totalPembayaranSupplier": 58484375
  },
  "message": "Harga berhasil diupdate"
}
```

#### DELETE `/api/pt-pks/timbangan/:id`
Delete ticket (only DRAFT status).

### 3. Lookups

#### GET `/api/pt-pks/timbangan/lookups?type=vehicles`
Get vehicles for dropdown.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "plateNo": "B 1234 XY",
      "type": "Truk Gandeng",
      "transporterId": "xxx",
      "transporterName": "PT Transporter ABC"
    }
  ]
}
```

#### GET `/api/pt-pks/timbangan/lookups?type=suppliers`
Get suppliers for dropdown.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "namaPemilik": "Pak Budi",
      "namaPerusahaan": "CV Sawit Makmur",
      "typeSupplier": "RAMP_PERON",
      "lokasiKebun": "Kebun A",
      "bankName": "BCA",
      "bankAccountNo": "1234567890"
    }
  ]
}
```

#### GET `/api/pt-pks/timbangan/lookups?type=items`
Get items (products) for dropdown.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "sku": "TBS-001",
      "name": "TBS Grade A",
      "categoryName": "Raw Material"
    }
  ]
}
```

## 🎨 UI Components (To Implement)

### 1. PB Harian Table (Inline Editable)

**File:** `src/components/dashboard/pt-pks/timbangan-supplier/pb-harian/PBHarianTable.tsx`

**Features:**
- Inline editable table with add/delete rows
- Each row is a form
- Auto-complete dropdowns for:
  - Vehicle (plateNo)
  - Supplier (namaPemilik) → auto-fills lokasiKebun, bank info
  - Item (name)
- Auto-calculate fields:
  - netto1 = |timbang1 - timbang2|
  - potKg = netto1 * potPercent
  - beratTerima = netto1 - potKg
- Bulk save button
- Delete row button per row

**Column Structure:**
```
No Seri | Tanggal | Jam Masuk | Jam Keluar | Kendaraan | Supplier | Produk | 
Timbang 1 | Timbang 2 | Netto 1 | Pot % | Pot Kg | Berat Terima | 
Lokasi Kebun | Penimbang | Aksi
```

### 2. Timbangan Table (Pricing Input)

**File:** `src/components/dashboard/pt-pks/timbangan-supplier/timbangan/TimbanganTable.tsx`

**Features:**
- Display tickets from PB Harian (status DRAFT)
- Editable columns:
  - Harga Per Kg
  - PPh Rate
  - Upah Bongkar Per Kg
- Auto-calculate on change:
  - Total
  - Total PPh
  - Total Upah Bongkar
  - Total Pembayaran Supplier
- Save button per row
- Posting button (separate feature)

**Column Structure:**
```
No Seri | Tanggal | Supplier | Produk | Berat Terima | 
Harga/Kg | Upah Bongkar/Kg | PPh % | 
Total | Total PPh | Total Upah | Pembayaran Supplier | Aksi
```

## 🧪 Testing

### Test Calculations

```typescript
// Test Case 1: Basic calculation
timbang1 = 30000
timbang2 = 5000
netto1 = 25000 ✅
potPercent = 0.05 (5%)
potKg = 1250 ✅
beratTerima = 23750 ✅

// Test Case 2: Pricing
beratTerima = 23750
hargaPerKg = 2500
upahBongkarPerKg = 150
pphRate = 0.015 (1.5%)

total = 23750 * 2500 = 59,375,000 ✅
totalUpahBongkar = 23750 * 150 = 3,562,500 ✅
totalPph = 59,375,000 * 0.015 = 890,625 ✅
totalPembayaranSupplier = 59,375,000 - 890,625 = 58,484,375 ✅
```

### Test Validations

```bash
# 1. Test duplicate noSeri
POST /api/pt-pks/pb-harian
{
  "tickets": [
    { "noSeri": "20250115-001", ... },
    { "noSeri": "20250115-001", ... } # Should fail
  ]
}

# 2. Test calculation validation
{
  "timbang1": 30000,
  "timbang2": 5000,
  "netto1": 20000, # Wrong! Should be 25000
  ...
}
# Should return: "Netto 1 (20000) harus sama dengan |Timbang1 - Timbang2| (25000)"

# 3. Test pricing on non-DRAFT ticket
PATCH /api/pt-pks/timbangan
{
  "id": "approved_ticket_id",
  "hargaPerKg": 2500
}
# Should return: "Hanya tiket dengan status DRAFT yang dapat diupdate"
```

## 📝 Access Control

### Roles

**PB Harian:**
- View: PT_PKS_ADMIN, FINANCE_AP, FINANCE_AR, GL_ACCOUNTANT, OPERATOR, EXECUTIVE, GROUP_VIEWER
- Create/Edit: PT_PKS_ADMIN, FINANCE_AP, OPERATOR

**Timbangan:**
- View: Same as PB Harian
- Edit Pricing: PT_PKS_ADMIN, FINANCE_AP
- Delete: PT_PKS_ADMIN, FINANCE_AP

## 🚀 Next Steps

1. ✅ Schema updated
2. ✅ Backend implementation complete
3. ⏳ UI Components:
   - PBHarianTable (inline editable)
   - TimbanganTable (pricing input)
4. ⏳ Testing & validation
5. ⏳ GL Entry integration (for posting)

## 📚 Related Documentation

- [ACCOUNTING_SEED_DATA.md](./ACCOUNTING_SEED_DATA.md) - COA mapping
- [PEMINJAMAN_BARANG_FIX.md](./PEMINJAMAN_BARANG_FIX.md) - Similar GL entry pattern

---

**Created:** 2025-01-30  
**Module:** PT-PKS Timbangan Supplier  
**Status:** Backend Complete, UI Pending

