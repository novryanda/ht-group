# PB Import - Troubleshooting Guide

## ❌ Problem: All Rows Show as Invalid

### Symptoms
- Upload Excel berhasil (201 Created)
- Preview menampilkan data
- **Semua rows** ditandai sebagai "Error" / Invalid
- Tidak bisa commit karena `validRows = 0`

---

## 🔍 Diagnosis Steps

### 1. Check Validation Errors in UI

Setelah update terbaru, preview table akan menampilkan **error details** untuk setiap invalid row:

```
┌─────────┬──────────┬──────────┐
│ Status  │ No. Seri │ Tanggal  │
├─────────┼──────────┼──────────┤
│ Error(2)│ PB001    │ 01/01/24 │
└─────────┴──────────┴──────────┘
  ↓ Error details (expandable row)
  ┌────────────────────────────────┐
  │ tanggal: Tanggal is required   │
  │ timbang1Kg: Timbang 1 must...  │
  └────────────────────────────────┘
```

**Action**: Lihat error message di bawah setiap row untuk mengetahui field mana yang bermasalah.

---

### 2. Check Server Console Logs

Server akan log **first invalid row** dengan detail lengkap:

```bash
[PB Import] Parsed 150 rows from Excel
[PB Import] First row sample: {
  "noSeri": "PB001",
  "tanggal": null,  ← ⚠️ NULL!
  "timbang1Kg": 5000,
  ...
}
[PB Import] First row has validation errors:
  Errors: [
    { field: "tanggal", message: "Tanggal is required", severity: "error" }
  ]
```

**Action**: Buka terminal/console server dan cari log `[PB Import]` untuk melihat data yang di-parse.

---

## 🐛 Common Issues & Solutions

### Issue 1: `tanggal: Tanggal is required`

**Cause**: Kolom "Tanggal" tidak ter-map atau berisi nilai invalid.

**Solutions**:

#### A. Column Not Mapped
```
Excel header: "Tgl" atau "Date"
Expected: "Tanggal"
```

**Fix**: Update `COLUMN_MAP` di `pb-excel-parser.service.ts`:
```typescript
const COLUMN_MAP = {
  // ... existing mappings
  "tgl": "tanggal",
  "date": "tanggal",
  "tanggal": "tanggal",
};
```

#### B. Date Format Not Recognized
```
Excel value: "01-Jan-2024" atau "2024/01/01"
Parser expects: DD/MM/YYYY, DD-MM-YYYY, or ISO
```

**Fix**: Update `parseDate()` di `pb-excel-parser.service.ts` untuk support format baru.

#### C. Date is Actually Empty
```
Excel cell is blank or contains non-date value
```

**Fix**: Pastikan semua rows di Excel punya tanggal yang valid.

---

### Issue 2: `noSeri: No. Seri is required`

**Cause**: Kolom "No. Seri" tidak ter-map atau kosong.

**Solutions**:

#### A. Column Not Mapped
```
Excel header: "Seri" atau "Ticket No"
Expected: "No. Seri" atau "No Seri"
```

**Fix**: Update `COLUMN_MAP`:
```typescript
"seri": "noSeri",
"ticket no": "noSeri",
"no. seri": "noSeri",
```

#### B. Empty Serial Numbers
```
Some rows have blank serial numbers
```

**Fix**: Fill in serial numbers in Excel, or skip those rows.

---

### Issue 3: Numeric Validation Errors

**Examples**:
- `timbang1Kg: Timbang 1 must be >= 0`
- `timbang2Kg: Tara cannot be greater than Bruto`
- `netto1Kg: Netto1 should be 4500 (Bruto - Tara)`

**Cause**: 
1. Numeric values not parsed correctly
2. Logical inconsistencies in Excel data

**Solutions**:

#### A. Number Parsing Issue
```
Excel value: "5.000,50" (European format)
Parsed as: NaN or wrong value
```

**Check**: Server log shows parsed value:
```
"timbang1Kg": null  ← Should be 5000.5
```

**Fix**: `parseNumber()` already handles this, but check if there are special characters:
```typescript
// In pb-excel-parser.service.ts
private static parseNumber(value: unknown): number | null {
  // Add more sanitization if needed
  const s = String(value)
    .replace(/_x000D_/g, "")  // Add this
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/\s+/g, "")
    .trim();
  // ...
}
```

#### B. Logical Inconsistency
```
Bruto (Timbang 1): 5000 kg
Tara (Timbang 2): 6000 kg  ← ERROR: Tara > Bruto!
```

**Fix**: Correct data in Excel. Tara harus ≤ Bruto.

```
Bruto: 5000 kg
Tara: 500 kg
Netto1: 4000 kg  ← ERROR: Should be 4500!
```

**Fix**: Correct Netto1 = Bruto - Tara (tolerance ±0.1 kg).

---

### Issue 4: All Fields are NULL

**Symptoms**:
```json
{
  "noSeri": null,
  "tanggal": null,
  "timbang1Kg": null,
  "timbang2Kg": null,
  ...
}
```

**Cause**: Header row not detected correctly.

**Solutions**:

#### A. Header Row Index Wrong
```
Excel structure:
Row 1: Title
Row 2: Period
Row 3: Print Date
Row 4: Column Headers  ← Should be detected here
Row 5: Data starts
```

**Check**: Server log shows:
```
[PB Excel Parser] Unmapped columns: ["title", "period", ...]
```

**Fix**: Ensure header row contains "No. Seri" AND "No. Polisi":
```typescript
// In pb-excel-parser.service.ts
private static isHeaderRow(row: unknown[]): boolean {
  const normalized = row.map(cell => normalizeHeader(cell));
  const hasNoSeri = normalized.some(h => 
    h === "no. seri" || h === "no seri" || h === "seri"
  );
  const hasNoPolisi = normalized.some(h => 
    h === "no. polisi" || h === "no polisi" || h === "polisi"
  );
  return hasNoSeri && hasNoPolisi;
}
```

#### B. Header Normalization Failed
```
Excel header: "No._x000D_\nSeri" (with hidden characters)
Normalized: "no. seri"  ← Should work
```

**Check**: Server log shows unmapped columns.

**Fix**: Already handled by `normalizeHeader()`, but verify:
```typescript
function normalizeHeader(raw: unknown): string {
  const s = String(raw ?? "");
  return s
    .replace(/_x000D_/g, " ")
    .replace(/\r?\n/g, " ")
    .replace(/\r/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^"+|"+$/g, "")
    .trim()
    .toLowerCase();
}
```

---

## 🔧 Quick Fixes

### Fix 1: Make Validation Less Strict (Temporary)

If you need to import data quickly and fix validation later:

**Option A**: Change errors to warnings
```typescript
// In pb-validation.service.ts
if (!row.tanggal) {
  issues.push({
    field: "tanggal",
    message: "Tanggal is required",
    severity: "warning",  // ← Changed from "error"
  });
}
```

**Option B**: Skip validation for certain fields
```typescript
// Comment out validation temporarily
// if (!row.tanggal) { ... }
```

⚠️ **Warning**: Only use this for testing! Re-enable validation before production.

---

### Fix 2: Add More Column Aliases

If your Excel uses different column names:

```typescript
// In pb-excel-parser.service.ts
const COLUMN_MAP: Record<string, keyof ExcelColumnMapping> = {
  // Add your custom aliases here
  "serial": "noSeri",
  "plate": "noPolisi",
  "supplier": "namaRelasi",
  "gross weight": "timbang1",
  "tare weight": "timbang2",
  // ... etc
};
```

---

### Fix 3: Handle Missing Optional Fields

If some fields are optional but validation treats them as required:

```typescript
// In pb-validation.service.ts
// Remove or comment out validation for optional fields
/*
if (!row.lokasiKebun) {
  issues.push({ ... });
}
*/
```

---

## 📊 Validation Rules Reference

### Required Fields (ERROR if missing)
- ✅ `noSeri` - Serial number
- ✅ `tanggal` - Date

### Numeric Validations (ERROR if violated)
- ✅ All weights ≥ 0
- ✅ `potPct` between 0-100
- ✅ `timbang2Kg` (Tara) ≤ `timbang1Kg` (Bruto)

### Logical Validations (WARNING if violated, tolerance ±0.1 kg or ±1 Rp)
- ⚠️ `netto1Kg` = `timbang1Kg` - `timbang2Kg`
- ⚠️ `potKg` = `netto1Kg` × `potPct` / 100
- ⚠️ `terimaKg` = `netto1Kg` - `potKg`
- ⚠️ `total` = `terimaKg` × `harga`
- ⚠️ `totalPay` = `total` - `pph`

**Note**: Warnings don't block commit, only errors do.

---

## 🚀 Next Steps

1. **Upload Excel** → Check preview
2. **Read error messages** in UI (expandable rows)
3. **Check server logs** for detailed data
4. **Fix Excel file** or **update column mapping**
5. **Re-upload** and verify

---

## 📞 Need Help?

If issues persist:

1. **Export server logs** with `[PB Import]` prefix
2. **Screenshot** of preview table with errors
3. **Share first 5 rows** of Excel (with headers)
4. **Describe** expected vs actual behavior

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0

