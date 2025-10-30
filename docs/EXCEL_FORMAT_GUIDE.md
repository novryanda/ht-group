# 📊 Excel Import Format Guide

## 🎯 Overview

Panduan format Excel untuk import data ke sistem Weighbridge (Timbangan Supplier).

**Format Excel:**
- **Row 1:** Field names (column headers)
- **Row 2+:** Data rows

---

## 1️⃣ PB Harian Excel Format

### File Template: `template-pb-harian.xlsx`

#### Column Headers (Row 1):

| Column | Field Name    | Type     | Required | Description                    |
|--------|---------------|----------|----------|--------------------------------|
| A      | noSeri        | String   | ✅ Yes   | No. Seri tiket (unique)       |
| B      | tanggal       | Date     | ✅ Yes   | Tanggal timbangan             |
| C      | jamMasuk      | DateTime | ✅ Yes   | Jam masuk kendaraan           |
| D      | jamKeluar     | DateTime | ❌ No    | Jam keluar kendaraan          |
| E      | plateNo       | String   | ✅ Yes   | Plat nomor kendaraan          |
| F      | namaPemilik   | String   | ✅ Yes   | Nama supplier/pemilik         |
| G      | productName   | String   | ✅ Yes   | Nama produk (TBS, dll)        |
| H      | timbang1      | Number   | ✅ Yes   | Berat timbang 1 (kg)          |
| I      | timbang2      | Number   | ✅ Yes   | Berat timbang 2 (kg)          |
| J      | potPercent    | Decimal  | ✅ Yes   | Potongan (0-1, contoh: 0.05)  |
| K      | penimbang     | String   | ❌ No    | Nama penimbang                |

#### Example Data (Rows 2+):

```
noSeri          tanggal      jamMasuk           jamKeluar          plateNo    namaPemilik      productName   timbang1  timbang2  potPercent  penimbang
20250130-001    2025-01-30   2025-01-30 08:30   2025-01-30 10:15   B1234XYZ   PT ABC Supplier  TBS Grade A   15000     5000      0.05        John Doe
20250130-002    2025-01-30   2025-01-30 09:00                      D5678EFG   PT XYZ Trading   TBS Grade B   18000     6000      0.04        Jane Smith
```

### Format Details:

#### Date Format (tanggal):
- ✅ `YYYY-MM-DD` (2025-01-30)
- ✅ `DD/MM/YYYY` (30/01/2025)
- ✅ Excel date serial number

#### DateTime Format (jamMasuk, jamKeluar):
- ✅ `YYYY-MM-DD HH:mm` (2025-01-30 08:30)
- ✅ `YYYY-MM-DDTHH:mm` (2025-01-30T08:30)
- ✅ Excel datetime serial number

#### Decimal Format (potPercent):
- ✅ `0.05` untuk 5%
- ✅ `0.04` untuk 4%
- ❌ JANGAN: `5` atau `5%`

#### Validation Rules:

```typescript
✅ noSeri: Tidak boleh kosong
✅ tanggal: Harus valid date
✅ jamMasuk: Harus valid datetime
✅ plateNo: Harus ada di database Vehicle
✅ namaPemilik: Harus ada di database SupplierTBS
✅ productName: Harus ada di database Item
✅ timbang1: Harus > 0
✅ timbang2: Harus > 0
✅ potPercent: Harus antara 0-1
```

### Import Process:

1. **Parse Excel** → Read field names from Row 1
2. **Validate Data** → Check required fields and formats
3. **Lookup IDs** → Match plateNo, namaPemilik, productName to database
4. **Calculate** → Auto-calculate netto1, potKg, beratTerima
5. **Add to Form** → Add rows to inline editable table
6. **Save** → User clicks "Simpan Semua"

---

## 2️⃣ Timbangan Pricing Excel Format

### File Template: `template-timbangan-pricing.xlsx`

#### Column Headers (Row 1):

| Column | Field Name       | Type    | Required | Description                      |
|--------|------------------|---------|----------|----------------------------------|
| A      | noSeri           | String  | ✅ Yes   | No. Seri (harus sudah ada di DB)|
| B      | hargaPerKg       | Number  | ✅ Yes   | Harga per kg (Rupiah)           |
| C      | pphRate          | Decimal | ✅ Yes   | PPh rate (%, contoh: 1.5)       |
| D      | upahBongkarPerKg | Number  | ✅ Yes   | Upah bongkar per kg (Rupiah)    |

#### Example Data (Rows 2+):

```
noSeri          hargaPerKg  pphRate  upahBongkarPerKg
20250130-001    3500        1.5      150
20250130-002    3600        1.5      150
20250130-003    3550        2.0      200
```

### Format Details:

#### Number Format (hargaPerKg, upahBongkarPerKg):
- ✅ `3500` (integer)
- ✅ `3500.50` (decimal)
- ❌ JANGAN: `Rp 3,500` atau `3.500`

#### Percentage Format (pphRate):
- ✅ `1.5` untuk 1.5%
- ✅ `2.0` untuk 2.0%
- ❌ JANGAN: `0.015` atau `1.5%`

#### Validation Rules:

```typescript
✅ noSeri: Harus ada di database (status DRAFT)
✅ hargaPerKg: Harus > 0
✅ pphRate: Harus antara 0-100
✅ upahBongkarPerKg: Harus >= 0
```

### Import Process:

1. **Parse Excel** → Read field names from Row 1
2. **Validate Data** → Check formats and ranges
3. **Match Tickets** → Find existing tickets by noSeri
4. **Calculate Totals** → Auto-calculate:
   - `totalUpahBongkar = beratTerima * upahBongkarPerKg`
   - `total = beratTerima * hargaPerKg`
   - `totalPph = total * (pphRate / 100)`
   - `totalPembayaranSupplier = total - totalPph`
5. **Update State** → Apply pricing to editState
6. **Save** → User clicks "Simpan" per row

---

## 🎨 Excel Template Generation

### Download Template Button:

Kedua halaman memiliki tombol **"Download Template"** yang akan generate file Excel dengan:
- ✅ Column headers yang benar
- ✅ Sample data sebagai contoh
- ✅ Auto-sized columns
- ✅ Ready to use

#### PB Harian Template:
```typescript
Headers: [noSeri, tanggal, jamMasuk, jamKeluar, plateNo, namaPemilik, productName, timbang1, timbang2, potPercent, penimbang]
Sample: 2 rows of example data
File: template-pb-harian.xlsx
```

#### Timbangan Template:
```typescript
Headers: [noSeri, hargaPerKg, pphRate, upahBongkarPerKg]
Sample: 3 rows of example data
File: template-timbangan-pricing.xlsx
```

---

## 📝 Step-by-Step Guide

### PB Harian Import:

1. **Download Template**
   ```
   Click "Template" button → template-pb-harian.xlsx downloads
   ```

2. **Fill Data**
   ```
   Row 1: Keep headers as-is (noSeri, tanggal, ...)
   Row 2+: Enter your data
   ```

3. **Important Notes:**
   - plateNo must match exactly with Vehicle plateNo in database
   - namaPemilik must match exactly with SupplierTBS namaPemilik
   - productName must match exactly with Item name
   - Case-insensitive matching (ABC = abc)

4. **Upload**
   ```
   Click "Import Excel" → Select file → Wait for parsing
   ```

5. **Review**
   ```
   - Success: Rows appear in form table
   - Error: Toast shows validation errors
   - Warning: Some rows skipped (relation not found)
   ```

6. **Save**
   ```
   Click "Simpan Semua" → Data saved to database
   ```

### Timbangan Import:

1. **Get noSeri List**
   ```
   Go to Timbangan page → Filter by date/status → Note noSeri values
   ```

2. **Download Template**
   ```
   Click "Template" button → template-timbangan-pricing.xlsx downloads
   ```

3. **Fill Pricing**
   ```
   Row 1: Keep headers (noSeri, hargaPerKg, pphRate, upahBongkarPerKg)
   Row 2+: Enter noSeri and pricing data
   ```

4. **Upload**
   ```
   Click "Import Excel" → Select file → Parsing...
   ```

5. **Review**
   ```
   - Success: Pricing appears in table, totals calculated
   - Error: noSeri not found or validation failed
   ```

6. **Save**
   ```
   Click "Simpan" on each row → Pricing saved
   ```

---

## ⚠️ Common Errors

### PB Harian:

#### 1. "Kendaraan tidak ditemukan"
```
Problem: plateNo "B1234XYZ" not in Vehicle table
Solution: 
  - Check spelling/spacing
  - Add vehicle to database first
  - Use exact plateNo from database
```

#### 2. "Supplier tidak ditemukan"
```
Problem: namaPemilik "PT ABC" not in SupplierTBS
Solution:
  - Check exact name in database
  - Case doesn't matter (ABC = abc)
  - Spacing matters ("PT ABC" ≠ "PT  ABC")
```

#### 3. "Timbang 1 harus > 0"
```
Problem: Empty or zero value
Solution: Enter valid weight (e.g., 15000)
```

#### 4. "Potongan % harus antara 0-1"
```
Problem: Entered "5" instead of "0.05"
Solution: Use decimal format (5% = 0.05)
```

### Timbangan:

#### 1. "No. Seri tidak ditemukan"
```
Problem: Ticket doesn't exist or wrong noSeri
Solution:
  - Check if ticket exists in PB Harian first
  - Copy exact noSeri from Timbangan table
  - Status must be DRAFT
```

#### 2. "PPh % harus antara 0-100"
```
Problem: Entered "0.015" instead of "1.5"
Solution: Use percentage format (1.5% = 1.5, not 0.015)
```

---

## 🧪 Testing Examples

### PB Harian Test Data:

```excel
noSeri          tanggal      jamMasuk           jamKeluar          plateNo    namaPemilik      productName   timbang1  timbang2  potPercent  penimbang
TEST-001        2025-01-30   2025-01-30 08:00   2025-01-30 10:00   B1234ABC   PT Test Corp     TBS Grade A   20000     8000      0.05        Tester 1
TEST-002        2025-01-30   2025-01-30 09:00                      D5678XYZ   CV Test Trade    TBS Grade B   18000     6000      0.04        Tester 2
```

**Expected:**
- ✅ Parse 2 rows
- ✅ Validate all fields
- ✅ Lookup vehicles, suppliers, items
- ✅ Calculate: netto1, potKg, beratTerima
- ✅ Add to form table

### Timbangan Test Data:

```excel
noSeri     hargaPerKg  pphRate  upahBongkarPerKg
TEST-001   3500        1.5      150
TEST-002   3600        2.0      200
```

**Expected:**
- ✅ Parse 2 rows
- ✅ Match to existing tickets
- ✅ Calculate totals
- ✅ Update pricing in table

---

## 📚 Technical Details

### Parser Implementation:

```typescript
// PB Harian Parser
import * as XLSX from "xlsx";
const workbook = XLSX.read(data, { type: "binary" });
const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

// Headers from Row 1 (keys in jsonData objects)
// Data from Row 2+ (array of objects)
```

### Field Mapping:

```typescript
// Flexible header names (case-insensitive)
noSeri: row["noSeri"] ?? row["No. Seri"] ?? ""
plateNo: row["plateNo"] ?? row["Plat Nomor"] ?? ""
namaPemilik: row["namaPemilik"] ?? row["Nama Supplier"] ?? ""
```

### Case-Insensitive Lookup:

```typescript
// Build lookup maps
const lookupMaps = {
  vehicles: new Map(vehicles.map(v => [v.plateNo.toLowerCase(), v.id])),
  suppliers: new Map(suppliers.map(s => [s.namaPemilik.toLowerCase(), s.id])),
};

// Lookup
const vehicleId = lookupMaps.vehicles.get(plateNo.toLowerCase());
```

---

## 🔧 Troubleshooting

### Excel Not Parsing:

1. Check file format (.xlsx or .xls)
2. Ensure Row 1 has headers
3. Check for special characters in data
4. Try saving Excel as "Excel Workbook (.xlsx)"

### Data Not Importing:

1. Open browser console (F12)
2. Check error messages
3. Verify field names match template
4. Test with template file first

### Validation Errors:

1. Read error message carefully
2. Check row number mentioned
3. Fix data in Excel
4. Re-upload

---

## ✅ Best Practices

1. **Always download template first**
   - Ensures correct headers
   - Shows example data format

2. **Test with 1-2 rows first**
   - Verify format is correct
   - Check calculations

3. **Keep original Excel file**
   - For reference if import fails
   - Easy to re-upload after fixes

4. **Check database before import**
   - Ensure vehicles exist
   - Ensure suppliers exist
   - Ensure products exist

5. **Use consistent naming**
   - Exact spelling matters
   - Case doesn't matter
   - Watch for extra spaces

---

**Last Updated:** 2025-01-30  
**Version:** 1.0  
**Status:** Production Ready ✅


