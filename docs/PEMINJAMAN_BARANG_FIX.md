# 🔧 Fix: Peminjaman Barang Form - Error 404 & COA Mapping

## 📋 Masalah yang Diperbaiki

### 1. ❌ **Error 404 - Endpoint Tidak Ditemukan**
**Penyebab:**
- Form memanggil endpoint yang salah: `/api/pt-pks/transaksi-gudang/peminjaman-barang`
- Endpoint yang benar adalah: `/api/pt-pks/peminjaman-barang`

**Solusi:** ✅ URL API sudah diperbaiki

---

### 2. ❌ **Struktur Data Tidak Sesuai dengan API**
**Penyebab:**
API `LoanIssueAPI.create()` membutuhkan field yang tidak ada di form:

| Field Required | Status Sebelumnya | Status Sekarang |
|----------------|-------------------|-----------------|
| `warehouseId`  | ❌ Tidak ada       | ✅ Sudah ditambahkan |
| `unitId` (per line) | ❌ Tidak ada  | ✅ Sudah ditambahkan |
| `pickerName`   | ❌ Tidak ada       | ✅ Sudah ditambahkan |
| `loanNotes`    | ❌ Tidak ada       | ✅ Sudah ditambahkan |

**Solusi:** ✅ Semua field wajib dan opsional sudah disesuaikan dengan API schema

---

### 3. ❌ **UX Buruk: Tidak Ada Pilihan Gudang**
**Penyebab:**
- User langsung memilih barang tanpa pilih gudang terlebih dahulu
- Dalam sistem inventory, barang harus dikaitkan dengan gudang spesifik

**Solusi:** ✅ **Flow baru yang lebih baik:**
1. Pilih **Gudang** terlebih dahulu (wajib)
2. Baru bisa pilih **Barang** (hanya setelah gudang dipilih)
3. **Satuan** otomatis terisi dari `defaultIssueUnit` atau `baseUnit` barang

---

## 🧾 COA System Mapping untuk Peminjaman Barang

### 📊 Jurnal Akuntansi Otomatis

Ketika peminjaman barang dicatat, sistem **otomatis** membuat jurnal:

```
Tanggal: [Tanggal Peminjaman]
Memo: Loan issue - [No. Dokumen]

┌─────────────────────────────────────────┬─────────────┬─────────────┐
│ Akun                                    │ Debit       │ Credit      │
├─────────────────────────────────────────┼─────────────┼─────────────┤
│ 1-1305 Persediaan Dipinjamkan          │ Rp XXX,XXX  │             │
│ 1-1304 Persediaan Material             │             │ Rp XXX,XXX  │
└─────────────────────────────────────────┴─────────────┴─────────────┘
```

### 🔑 System Account Keys

| Key COA System | Kode Akun | Nama Akun | Fungsi |
|----------------|-----------|-----------|--------|
| `INVENTORY_ON_LOAN` | **1-1305** | Persediaan Dipinjamkan | **Debit** - Aset yang keluar dari gudang untuk dipinjamkan |
| `INVENTORY_GENERAL` | **1-1304** | Persediaan Material | **Credit** - Pengurangan dari persediaan gudang |

### 📝 Penjelasan Transaksi

#### Saat Peminjaman (Goods Issue - LOAN):
```sql
-- Service: LoanIssueService.generateGLEntry()
-- File: src/server/services/pt-pks/loan-issue.service.ts

Dr. Persediaan Dipinjamkan (1-1305)  Rp 1,000,000
   Cr. Persediaan Material (1-1304)               Rp 1,000,000
   
Deskripsi: "Loan to [Nama Peminjam]"
```

**Flow Lengkap:**
1. User membuat peminjaman barang di form
2. Sistem menghitung nilai barang berdasarkan `avgCost` dari `StockBalance`
3. Sistem membuat `GoodsIssue` dengan `purpose = "LOAN"`
4. Sistem otomatis membuat `JournalEntry` dengan status `POSTED`
5. Field `glStatus` di `GoodsIssue` berubah menjadi `POSTED`

---

#### Saat Pengembalian (Goods Receipt - LOAN_RETURN):
```sql
-- Jika barang dikembalikan SEMUA:
Dr. Persediaan Material (1-1304)      Rp 1,000,000
   Cr. Persediaan Dipinjamkan (1-1305)           Rp 1,000,000

-- Jika barang dikembalikan SEBAGIAN (ada yang hilang):
Dr. Persediaan Material (1-1304)      Rp   800,000  [qty kembali]
Dr. Kerugian/Scrap (6-5001)          Rp   200,000  [qty hilang]
   Cr. Persediaan Dipinjamkan (1-1305)           Rp 1,000,000
```

**Keterangan:**
- `INVENTORY_ADJUSTMENT_LOSS` (6-5001) = Kerugian barang yang tidak kembali
- Sistem akan tracking `qtyReturned` per line item
- Field `isLoanFullyReturned` di `GoodsIssue` akan `true` jika semua sudah kembali

---

## 🔄 Perubahan yang Dilakukan

### File: `peminjaman-barang-form.tsx`

#### 1. **Schema Validation** - Ditambahkan field wajib:
```typescript
const schema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  warehouseId: z.string().min(1, "Gudang wajib dipilih"), // ✅ BARU
  loanReceiver: z.string().min(2, "Nama peminjam wajib diisi"),
  targetDept: z.string().min(2, "Dept/Unit wajib diisi"),
  expectedReturnAt: z.string().min(1, "Tanggal jatuh tempo wajib diisi"),
  pickerName: z.string().optional(), // ✅ BARU
  loanNotes: z.string().optional(),  // ✅ BARU
  note: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string().min(1, "Barang wajib dipilih"),
      unitId: z.string().min(1, "Satuan wajib dipilih"), // ✅ BARU
      qty: z.string().min(1, "Jumlah wajib diisi"),
      note: z.string().optional(),
    })
  ).min(1),
});
```

#### 2. **Type Definition** - Update tipe data:
```typescript
type ItemOption = {
  id: string;
  sku: string;
  name: string;
  baseUnit: {
    id: string;      // ✅ BARU
    name: string;
  };
  defaultIssueUnit?: {  // ✅ BARU
    id: string;
    name: string;
  };
};
```

#### 3. **State Management** - Warehouse tracking:
```typescript
const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");

// Watch warehouse changes
const watchedWarehouse = form.watch("warehouseId");
useEffect(() => {
  setSelectedWarehouse(watchedWarehouse);
  if (watchedWarehouse) {
    form.setValue("items", [{ itemId: "", unitId: "", qty: "", note: "" }]);
  }
}, [watchedWarehouse, form]);
```

#### 4. **Data Fetching** - Fetch warehouses & conditional items:
```typescript
// Fetch active warehouses
const { data: warehousesData } = useQuery({
  queryKey: ["warehouses-active"],
  queryFn: async () => {
    const res = await fetch("/api/pt-pks/material-inventory/warehouses/active");
    // ...
  },
});

// Only fetch items when warehouse is selected
const { data: itemsData } = useQuery({
  queryKey: ["items", "all", selectedWarehouse],
  queryFn: async () => { /* ... */ },
  enabled: !!selectedWarehouse, // ✅ Conditional fetching
});
```

#### 5. **API Call Fix** - Endpoint & payload yang benar:
```typescript
const mutation = useMutation({
  mutationFn: async (data: PeminjamanFormValues) => {
    const response = await fetch("/api/pt-pks/peminjaman-barang", { // ✅ URL DIPERBAIKI
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: data.date,
        warehouseId: data.warehouseId,           // ✅ BARU
        loanReceiver: data.loanReceiver,
        targetDept: data.targetDept,
        expectedReturnAt: data.expectedReturnAt,
        pickerName: data.pickerName,             // ✅ BARU
        loanNotes: data.loanNotes,               // ✅ BARU
        note: data.note,
        lines: data.items.map((item) => ({
          itemId: item.itemId,
          unitId: item.unitId,                   // ✅ BARU
          qty: Number(item.qty),
          note: item.note,
        })),
      }),
    });
    // ... error handling
  },
  // ...
});
```

#### 6. **UI Improvements** - Better UX:

**a) Alert Info COA Mapping:**
```tsx
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>
    <strong>Jurnal Akuntansi:</strong> 
    Debit: Persediaan Dipinjamkan (1-1305) → Credit: Persediaan Material (1-1304)
  </AlertDescription>
</Alert>
```

**b) Warehouse Selection First:**
```tsx
<FormField
  control={form.control}
  name="warehouseId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Lokasi Gudang *</FormLabel>
      {/* ... */}
      <FormDescription>
        Pilih gudang terlebih dahulu sebelum memilih barang
      </FormDescription>
    </FormItem>
  )}
/>
```

**c) Auto-select Unit:**
```tsx
<Select 
  onValueChange={(value) => {
    field.onChange(value);
    // Auto-select unit when item changes
    const item = itemsData?.find((i) => i.id === value);
    if (item) {
      const unitId = item.defaultIssueUnit?.id || item.baseUnit.id;
      form.setValue(`items.${index}.unitId`, unitId);
    }
  }} 
  value={field.value}
  disabled={!selectedWarehouse} // ✅ Disabled sampai gudang dipilih
>
```

**d) Disabled State Handling:**
```tsx
{!selectedWarehouse && (
  <Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      Pilih gudang terlebih dahulu untuk dapat menambahkan barang
    </AlertDescription>
  </Alert>
)}
```

---

## 🧪 Testing Checklist

### Test Case 1: Form Validation
- [ ] Tanggal peminjaman wajib diisi
- [ ] Gudang wajib dipilih
- [ ] Nama peminjam wajib diisi (min 2 karakter)
- [ ] Dept/Unit wajib diisi (min 2 karakter)
- [ ] Tanggal jatuh tempo wajib diisi
- [ ] Minimal 1 barang harus dipilih
- [ ] Qty barang harus > 0

### Test Case 2: Warehouse-First Flow
- [ ] Saat pertama buka, dropdown barang disabled
- [ ] Setelah pilih gudang, dropdown barang enabled
- [ ] Ketika ganti gudang, list barang di-reset
- [ ] Alert muncul jika belum pilih gudang

### Test Case 3: Unit Auto-Selection
- [ ] Pilih barang → unit otomatis terisi
- [ ] Jika barang punya `defaultIssueUnit`, itu yang dipilih
- [ ] Jika tidak ada, pakai `baseUnit`
- [ ] Field unitId tersimpan (hidden field)

### Test Case 4: API Integration
- [ ] Fetch warehouses berhasil
- [ ] Fetch items hanya triggered setelah pilih gudang
- [ ] POST ke `/api/pt-pks/peminjaman-barang` berhasil (200/201)
- [ ] Error handling menampilkan pesan yang jelas
- [ ] Success toast muncul setelah berhasil
- [ ] Form di-reset dan dialog ditutup

### Test Case 5: GL Entry Verification
```sql
-- Cek di database setelah create:
SELECT * FROM "JournalEntry" 
WHERE "sourceType" = 'GoodsIssue' 
  AND "sourceId" = '[ID dari GoodsIssue yang baru dibuat]'
ORDER BY "createdAt" DESC LIMIT 1;

-- Cek detail lines:
SELECT 
  jl."debit", 
  jl."credit", 
  a."code", 
  a."name",
  jl."description"
FROM "JournalLine" jl
JOIN "Account" a ON jl."accountId" = a.id
WHERE jl."entryId" = '[ID dari JournalEntry di atas]';
```

**Expected Result:**
```
Line 1: Debit  1,000,000 | 1-1305 | Persediaan Dipinjamkan
Line 2: Credit 1,000,000 | 1-1304 | Persediaan Material
```

---

## 📊 Database Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PEMINJAMAN BARANG FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

1. CREATE GOODS ISSUE (purpose = "LOAN")
   ┌──────────────────────────────────────────────────────┐
   │ GoodsIssue                                           │
   ├──────────────────────────────────────────────────────┤
   │ docNumber:        "GI-2025-01-001"                   │
   │ date:             2025-01-15                         │
   │ warehouseId:      [warehouse_id]                     │
   │ purpose:          "LOAN"                             │
   │ loanReceiver:     "John Doe"                         │
   │ targetDept:       "Maintenance"                      │
   │ expectedReturnAt: 2025-02-15                         │
   │ status:           "APPROVED"                         │
   │ glStatus:         "PENDING" → "POSTED"               │
   │ glEntryId:        [journal_entry_id] (after GL gen)  │
   └──────────────────────────────────────────────────────┘
              ↓
   ┌──────────────────────────────────────────────────────┐
   │ GoodsIssueLine (multiple)                            │
   ├──────────────────────────────────────────────────────┤
   │ itemId:       [item_id]                              │
   │ unitId:       [unit_id]                              │
   │ qty:          10                                     │
   │ qtyReturned:  0 (akan diupdate saat return)          │
   └──────────────────────────────────────────────────────┘

2. UPDATE STOCK LEDGER (reduce inventory)
   ┌──────────────────────────────────────────────────────┐
   │ StockLedger                                          │
   ├──────────────────────────────────────────────────────┤
   │ transactionType:  "GI"                               │
   │ qtyIn:            0                                  │
   │ qtyOut:           10                                 │
   │ balanceAfter:     [previous_balance - 10]            │
   └──────────────────────────────────────────────────────┘
              ↓
   ┌──────────────────────────────────────────────────────┐
   │ StockBalance (updated)                               │
   ├──────────────────────────────────────────────────────┤
   │ qtyOnHand:  [previous_qty - 10]                      │
   │ avgCost:    [calculated average cost]                │
   └──────────────────────────────────────────────────────┘

3. GENERATE GL ENTRY (if expense account provided)
   ┌──────────────────────────────────────────────────────┐
   │ JournalEntry                                         │
   ├──────────────────────────────────────────────────────┤
   │ entryNumber:  "JV/2025/01/001"                       │
   │ date:         2025-01-15                             │
   │ sourceType:   "GoodsIssue"                           │
   │ sourceId:     [goods_issue_id]                       │
   │ memo:         "Loan issue - GI-2025-01-001"          │
   │ status:       "POSTED"                               │
   └──────────────────────────────────────────────────────┘
              ↓
   ┌──────────────────────────────────────────────────────┐
   │ JournalLine (2 lines)                                │
   ├──────────────────────────────────────────────────────┤
   │ Line 1:                                              │
   │   accountId:    [1-1305] (Persediaan Dipinjamkan)   │
   │   debit:        1,000,000                            │
   │   credit:       0                                    │
   │   description:  "Loan to John Doe"                   │
   │                                                      │
   │ Line 2:                                              │
   │   accountId:    [1-1304] (Persediaan Material)      │
   │   debit:        0                                    │
   │   credit:       1,000,000                            │
   │   description:  "Loan issue - GI-2025-01-001"       │
   └──────────────────────────────────────────────────────┘
```

---

## 🔍 Related Files & Endpoints

### API Layer
- **Route**: `src/app/api/pt-pks/peminjaman-barang/route.ts`
  - GET: List loan issues
  - POST: Create loan issue
  
- **API Class**: `src/server/api/pt-pks/loan-issue.ts`
  - Method: `LoanIssueAPI.create(data, createdById)`
  - Validation: `createLoanIssueSchema`

### Service Layer
- **Service**: `src/server/services/pt-pks/loan-issue.service.ts`
  - Method: `LoanIssueService.create(data, createdById)`
  - Method: `generateGLEntry(loanIssue, createdById)` - Private
  - Method: `validateStock(warehouseId, lines)` - Private

### Schema & Types
- **Schema**: `src/server/schemas/pt-pks/warehouse-transaction.ts`
- **Types**: `src/server/types/pt-pks/warehouse-transaction.ts`
  - Type: `CreateWarehouseOutboundDTO`

### GL Mapping
- **Seed Data**: `prisma/seed-accounting.ts`
  - Key: `INVENTORY_ON_LOAN` → Code: `1-1305`
  - Key: `INVENTORY_GENERAL` → Code: `1-1304`

---

## 📚 Reference: API Contract

### POST `/api/pt-pks/peminjaman-barang`

**Request Body:**
```json
{
  "date": "2025-01-15",
  "warehouseId": "cm5a1b2c3d4e5f6g7h8i9j0k",
  "loanReceiver": "John Doe",
  "targetDept": "Maintenance",
  "expectedReturnAt": "2025-02-15",
  "pickerName": "Jane Smith",
  "loanNotes": "Untuk perbaikan mesin",
  "note": "Catatan tambahan",
  "lines": [
    {
      "itemId": "cm5x1y2z3a4b5c6d7e8f9g0h",
      "unitId": "cm5p1q2r3s4t5u6v7w8x9y0z",
      "qty": 10,
      "note": "Kondisi baik"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cm5loan1issue2id3...",
    "docNumber": "GI-2025-01-001",
    "date": "2025-01-15T00:00:00.000Z",
    "warehouseId": "cm5a1b2c3d4e5f6g7h8i9j0k",
    "warehouse": {
      "code": "WH-01",
      "name": "Gudang Utama"
    },
    "purpose": "LOAN",
    "loanReceiver": "John Doe",
    "targetDept": "Maintenance",
    "expectedReturnAt": "2025-02-15T00:00:00.000Z",
    "status": "APPROVED",
    "glStatus": "POSTED",
    "glEntryId": "cm5journal1entry2id3...",
    "lines": [
      {
        "id": "cm5line1id2...",
        "itemId": "cm5x1y2z3a4b5c6d7e8f9g0h",
        "item": {
          "sku": "ITM-001",
          "name": "Spare Part A"
        },
        "unitId": "cm5p1q2r3s4t5u6v7w8x9y0z",
        "unit": {
          "code": "PCS",
          "name": "Pieces"
        },
        "qty": 10,
        "qtyReturned": 0
      }
    ]
  },
  "statusCode": 201
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "path": ["warehouseId"],
      "message": "Gudang wajib dipilih"
    }
  ],
  "statusCode": 400
}
```

---

## 🎯 Summary

✅ **Masalah Diperbaiki:**
1. Endpoint URL diperbaiki dari `/transaksi-gudang/peminjaman-barang` → `/peminjaman-barang`
2. Field wajib ditambahkan: `warehouseId`, `unitId`, `pickerName`, `loanNotes`
3. Flow UX diperbaiki: Pilih gudang → Pilih barang → Auto-fill unit
4. Type definitions diperlengkap untuk support unit selection
5. Error handling lebih informatif

✅ **COA System Mapping Dijelaskan:**
- **Debit**: `1-1305` (Persediaan Dipinjamkan)
- **Credit**: `1-1304` (Persediaan Material)
- Auto-generate GL entry via `LoanIssueService.generateGLEntry()`

✅ **Testing:**
- Form validation lengkap
- Conditional rendering & disabled state
- API integration fix
- GL entry verification query provided

---

## 🚀 Next Steps

1. **Test form di browser** dengan flow:
   - Pilih gudang → Pilih barang → Isi qty → Submit
   
2. **Verifikasi GL entry** di database setelah create

3. **Implementasi Loan Return** (jika belum):
   - Form untuk kembalikan barang
   - Handle partial return (qty returned < qty borrowed)
   - Generate GL entry untuk return & loss

4. **Report Peminjaman** (opsional):
   - Daftar barang yang sedang dipinjam
   - Laporan keterlambatan pengembalian
   - Aging analysis

---

**Dokumentasi dibuat:** 28 Oktober 2025
**File terkait:** `src/components/dashboard/pt-pks/transaksi-pks/transaksi-gudang/peminjaman-barang/peminjaman-barang-form.tsx`
