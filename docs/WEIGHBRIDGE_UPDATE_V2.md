# 🎉 Weighbridge System - Update v2

## ✅ New Features Added

### 1. **PB Harian - List View + Form Toggle**

**Before:** Only inline editable form  
**After:** Toggle between Form Input and Saved Data View

**Features:**
- ✅ Toggle button "Input Baru" / "Lihat Data"
- ✅ Display saved tickets in table view
- ✅ Filter by date range (calendar picker)
- ✅ Auto-refresh after save
- ✅ Clear form after successful save

**Columns in List View:**
- No. Seri
- Tanggal
- Jam Masuk
- Kendaraan (PlateNo)
- Supplier (Nama)
- Produk (Name)
- Berat Terima (kg)
- Status (Badge)

---

### 2. **Calendar Date Picker**

**Before:** Text input for dates  
**After:** Calendar popup with date picker

**Implementation:**
- ✅ shadcn/ui `Calendar` component
- ✅ `Popover` for dropdown
- ✅ `date-fns` for formatting
- ✅ Format display: `dd/MM/yyyy`
- ✅ Format API: `yyyy-MM-dd`

**Where Applied:**
- ✅ PB Harian: Start Date, End Date
- ✅ Timbangan: Start Date, End Date

**UI:**
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "dd/MM/yyyy") : "Pilih tanggal"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      initialFocus
    />
  </PopoverContent>
</Popover>
```

---

### 3. **Import Excel Button**

**Status:** UI Ready, Implementation TODO

**Features Added:**
- ✅ Upload button with file input
- ✅ Accept `.xlsx, .xls` files
- ✅ Placeholder toast notification
- ✅ Hidden file input (label as button)

**Where Applied:**
- ✅ PB Harian: Import weighbridge data
- ✅ Timbangan: Import pricing data

**UI:**
```tsx
<Button variant="outline" asChild>
  <label>
    <Upload className="mr-2 h-4 w-4" />
    Import Excel
    <input
      type="file"
      accept=".xlsx,.xls"
      onChange={handleImportExcel}
      className="hidden"
    />
  </label>
</Button>
```

**TODO - Excel Import Implementation:**
```typescript
const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // TODO: Implement Excel parsing
  // 1. Install: npm install xlsx
  // 2. Read file with FileReader
  // 3. Parse with XLSX.read()
  // 4. Map columns to RowData structure
  // 5. Validate each row
  // 6. Add to rows state (PB Harian) or update pricing (Timbangan)
  
  toast.info("Import Excel akan diimplementasikan");
};
```

---

## 📊 Updated Components

### PBHarianTable.tsx

**State Changes:**
```typescript
// Before
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

// After
const [startDate, setStartDate] = useState<Date>();
const [endDate, setEndDate] = useState<Date>();
const [savedTickets, setSavedTickets] = useState<SavedTicket[]>([]);
const [showForm, setShowForm] = useState(false);
```

**New Functions:**
```typescript
fetchSavedTickets() // Fetch and display saved tickets
handleImportExcel() // TODO: Excel import handler
```

**UI Changes:**
- ✅ Toggle button (Form <-> List)
- ✅ Calendar date pickers
- ✅ Import Excel button
- ✅ Separate views for input and display

### TimbanganTable.tsx

**State Changes:**
```typescript
// Before
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

// After
const [startDate, setStartDate] = useState<Date>();
const [endDate, setEndDate] = useState<Date>();
```

**New Functions:**
```typescript
handleImportExcel() // TODO: Excel import for pricing
```

**UI Changes:**
- ✅ Calendar date pickers (consistent with PB Harian)
- ✅ Import Excel button
- ✅ Better layout with labeled sections

---

## 🎨 UI/UX Improvements

### Consistent Date Filtering

**Both Pages Now Have:**
1. **Start Date** - Calendar picker
2. **End Date** - Calendar picker
3. **Status Filter** - Dropdown (Timbangan only)
4. **Refresh** - Button
5. **Import Excel** - Button

### Visual Hierarchy

**PB Harian:**
```
[Input Baru/Lihat Data] [Import Excel] [Simpan Semua]  |  [📅 Dari] [📅 Sampai] [🔄 Refresh]
──────────────────────────────────────────────────────────────────────────────────────
Form Input (when showForm = true)
[Tambah Baris]
[Inline Editable Table]

OR

Data Tersimpan (when showForm = false)
[Read-only Table with saved data]
```

**Timbangan:**
```
[📅 Dari] [📅 Sampai] [Status ▼] [🔄 Refresh] [📤 Import Excel]
──────────────────────────────────────────────────────────────
[Pricing Table with inline edit]
[Summary Footer]
```

---

## 🧪 Testing Guide

### Test Calendar Picker

1. **Open PB Harian page**
2. Click "Dari Tanggal" button
3. Calendar popup should appear
4. Select a date
5. Button text should show: `dd/MM/yyyy`
6. Repeat for "Sampai Tanggal"
7. Click Refresh
8. API should be called with: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

### Test Toggle View (PB Harian)

1. **Default:** Should show "Lihat Data" (empty table)
2. Click "Input Baru"
3. Should show form with "Tambah Baris" button
4. Add rows and save
5. After save, should auto-switch to "Lihat Data"
6. Table should show saved tickets

### Test Import Excel Button

1. Click "Import Excel"
2. File picker should open
3. Select `.xlsx` or `.xls` file
4. Should show toast: "Import Excel akan diimplementasikan"

---

## 📝 Migration Guide

### No Database Changes Required

All changes are frontend-only. No migration needed.

### Dependencies

Already installed:
- ✅ `date-fns` (v4.1.0)
- ✅ `react-day-picker` (v9.11.1)
- ✅ shadcn/ui `calendar` component
- ✅ shadcn/ui `popover` component

For Excel import (TODO):
```bash
npm install xlsx
npm install -D @types/xlsx
```

---

## 🚀 Next Steps for Excel Import

### PB Harian Excel Template

**Columns:**
```
A: No. Seri
B: Tanggal (YYYY-MM-DD)
C: Jam Masuk (YYYY-MM-DD HH:mm)
D: Jam Keluar (YYYY-MM-DD HH:mm, optional)
E: Plat Nomor (lookup by plateNo)
F: Nama Supplier (lookup by namaPemilik)
G: Nama Produk (lookup by name)
H: Timbang 1 (number)
I: Timbang 2 (number)
J: Potongan % (decimal, e.g., 0.05)
K: Penimbang (optional)
```

**Implementation Steps:**
1. Install xlsx: `npm install xlsx`
2. Read file with FileReader
3. Parse with `XLSX.read()`
4. Map columns to `RowData` structure
5. Lookup IDs for vehicle, supplier, item
6. Validate each row
7. Add validated rows to state
8. Show validation errors

### Timbangan Excel Template

**Columns:**
```
A: No. Seri (to match existing tickets)
B: Harga Per Kg (number)
C: PPh % (decimal, e.g., 0.015)
D: Upah Bongkar Per Kg (number)
```

**Implementation Steps:**
1. Read Excel file
2. Match No. Seri to existing DRAFT tickets
3. Update pricing fields
4. Auto-calculate totals
5. Save each row via PATCH API
6. Show success/error per row

---

## 📊 Files Modified

### Updated (2 files)
1. ✅ `src/components/dashboard/pt-pks/timbangan-supplier/pb-harian/PBHarianTable.tsx`
   - Added toggle view (form/list)
   - Added calendar pickers
   - Added import Excel button
   - Added saved tickets display
   - Changed state: string → Date

2. ✅ `src/components/dashboard/pt-pks/timbangan-supplier/timbangan/TimbanganTable.tsx`
   - Added calendar pickers
   - Added import Excel button
   - Changed state: string → Date
   - Better filter layout

### No Changes
- ✅ Page components (already use the updated table components)
- ✅ Backend (no changes needed)
- ✅ API routes (already support date filtering)

---

## ✨ Summary

### What Works Now
- ✅ PB Harian shows saved data
- ✅ Toggle between form and list view
- ✅ Calendar date pickers (both pages)
- ✅ Import Excel UI ready
- ✅ Better filtering layout
- ✅ Auto-refresh after save

### What's Next (TODO)
- ⏳ Implement Excel parsing (PB Harian)
- ⏳ Implement Excel pricing import (Timbangan)
- ⏳ Create Excel templates
- ⏳ Add download template buttons

---

**Date:** 2025-01-30  
**Version:** v2.0  
**Status:** UI Complete, Excel Import TODO


