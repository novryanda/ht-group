# Employee Management - DataMaster Karyawan

## Overview

Fitur manajemen karyawan lengkap dengan:
- ✅ **Create Employee** - Tambah karyawan baru
- ✅ **List All Employees** - Tabel dengan 29+ kolom
- ✅ **Column Visibility Toggle** - Pilih kolom yang ditampilkan
- ✅ **Free Text Filters** - Divisi & Level sebagai input bebas (bukan enum)
- ✅ **Search & Pagination** - Pencarian global dan pagination server-side
- ✅ **Family Management** - Tambah/lihat data keluarga karyawan

## Architecture (3-Tier Clean Architecture)

### Tier-1: Presentation Layer
**Location:** `src/app/(protected-pages)/dashboard/pt-pks/datamaster/karyawan/`

**Components:**
- `page.tsx` - Main page component
- `employee-list.tsx` - Employee list with table, filters, and column visibility
- `employee-form-modal.tsx` - Create employee form modal
- `family-detail-sheet.tsx` - View family details
- `family-form-modal.tsx` - Add family member form

### Tier-2: Controller/API Layer
**Location:** `src/app/api/pt-pks/karyawan/`

**Endpoints:**
- `GET /api/pt-pks/karyawan` - List employees with pagination & filters
- `POST /api/pt-pks/karyawan` - Create new employee
- `GET /api/pt-pks/karyawan/[id]` - Get employee detail
- `PATCH /api/pt-pks/karyawan/[id]` - Update employee
- `GET /api/pt-pks/karyawan/[id]/keluarga` - List families
- `POST /api/pt-pks/karyawan/[id]/keluarga` - Add family member

### Tier-3: Domain/Service/Repository Layer
**Location:** `src/server/`

**Files:**
- `api/karyawan.ts` - API module with Zod validation
- `services/karyawan.service.ts` - Business logic & rules
- `repositories/karyawan.repo.ts` - Database operations
- `schemas/karyawan.ts` - Zod validation schemas
- `types/karyawan.ts` - TypeScript types & DTOs

## Key Features

### 1. Create Employee
**Form Fields:**
- **Required:** Nama, Jenis Kelamin, NIK/KTP
- **Optional:** 26+ fields including Divisi & Level (free text input)

**Validation:**
- NIK/KTP must be unique (returns 409 Conflict if duplicate)
- All fields validated with Zod schema
- Empty strings normalized to `undefined` before validation

**Business Rules:**
- NIK uniqueness check in service layer
- Returns error message with existing employee name if duplicate

### 2. Employee List Table
**Features:**
- Display ALL 29+ columns from Employee model
- Column visibility toggle (show/hide columns)
- Horizontal scroll for mobile responsiveness
- Sticky action column on the right
- Server-side pagination (default 10 items per page)
- Global search across nama, NIK, jabatan, divisi
- Free text filters for Divisi & Level

**Default Visible Columns:**
- Nama, NIK/KTP, No. HP, Jabatan, Divisi, Level, TMK, Keluarga, Aksi

**All Available Columns:**
1. Nama
2. NIK/KTP
3. Jenis Kelamin
4. Status KK
5. Agama
6. Suku
7. Golongan Darah
8. No. HP
9. Tempat Lahir
10. Tanggal Lahir
11. Umur
12. RT/RW
13. Desa
14. Kecamatan
15. Kabupaten
16. Provinsi
17. Pendidikan
18. Jurusan
19. Jabatan
20. Divisi
21. Level
22. TMK (Tanggal Masuk Kerja)
23. Tanggal Keluar
24. Masa Kerja
25. Status PKWT
26. BPJS TK
27. BPJS Kesehatan
28. NPWP
29. Status Pajak
30. No. Rekening
31. Perusahaan Sebelumnya
32. Keluarga (count)

### 3. Divisi & Level - Free Text Input
**Important Change:**
- ❌ **Before:** Select dropdown with predefined options
- ✅ **After:** Free text Input field

**Implementation:**
- Database: `devisi String? @db.VarChar(100)` (not enum)
- Database: `level String? @db.VarChar(50)` (not enum)
- UI Filter: `<Input>` component (not `<Select>`)
- API Filter: Case-insensitive partial match

### 4. Authentication & Authorization
**Allowed Roles:**
- **Read Access:** PT_PKS_ADMIN, UNIT_SUPERVISOR, HR, EXECUTIVE, GROUP_VIEWER
- **Write Access:** PT_PKS_ADMIN, HR, EXECUTIVE

## API Response Format

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}
```

**Status Codes:**
- `200` - Success (GET, PATCH)
- `201` - Created (POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient role)
- `404` - Not Found
- `409` - Conflict (duplicate NIK)
- `500` - Internal Server Error

## Data Validation

### EmployeeCreateSchema (Zod)
```typescript
{
  // Required
  nama: string (min 1, max 100)
  jenis_kelamin: "L" | "P"
  no_nik_ktp: string (min 1, max 20)
  
  // Optional
  devisi: string (max 100) - FREE TEXT
  level: string (max 50) - FREE TEXT
  // ... 26+ optional fields
}
```

### Empty String Normalization
**Pattern:** Empty strings (`""`) are normalized to `undefined` in API controllers before Zod validation.

**Why:** Prevents validation errors and ensures consistent null handling in database.

**Implementation:**
```typescript
import { normalizeEmptyStrings } from "~/lib/select-utils";

const body = await request.json();
const normalizedData = normalizeEmptyStrings(body);
const result = await KaryawanAPI.createKaryawan(normalizedData);
```

## Database Schema

```prisma
model Employee {
  id_karyawan           String    @id @default(cuid())
  nama                  String?   @db.VarChar(100)
  jenis_kelamin         String?   @db.Char(1)
  no_nik_ktp            String?   @db.VarChar(20)
  devisi                String?   @db.VarChar(100)  // ✅ Free text
  level                 String?   @db.VarChar(50)   // ✅ Free text
  // ... 24+ more fields
  families              EmployeeFamily[]
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  @@map("karyawan")
}
```

## Testing Checklist

### Create Employee
- [ ] Form validation: required fields (nama, jenis_kelamin, no_nik_ktp)
- [ ] Divisi & Level as free text input (not Select)
- [ ] Duplicate NIK returns 409 error with message
- [ ] Success returns 201 with employee data
- [ ] Toast notification on success/error
- [ ] Table refreshes after successful create
- [ ] Modal closes after success

### Employee List
- [ ] All 29+ columns available
- [ ] Column visibility toggle works
- [ ] Default columns displayed correctly
- [ ] Horizontal scroll on mobile
- [ ] Sticky action column on right
- [ ] Search works across multiple fields
- [ ] Divisi filter (free text) works
- [ ] Level filter (free text) works
- [ ] Pagination works (prev/next/page numbers)
- [ ] Loading state displays correctly

### Integration
- [ ] Auth check: unauthorized returns 401
- [ ] Role check: forbidden returns 403
- [ ] TypeScript compilation passes
- [ ] No console errors in browser
- [ ] Mobile responsive design works

## Usage Example

### Create Employee via API
```typescript
POST /api/pt-pks/karyawan
Content-Type: application/json

{
  "nama": "John Doe",
  "jenis_kelamin": "L",
  "no_nik_ktp": "1234567890123456",
  "devisi": "IT & Digital",  // ✅ Free text
  "level": "Senior Staff",   // ✅ Free text
  "jabatan": "Software Engineer",
  "no_telp_hp": "081234567890",
  "tgl_masuk_kerja": "2024-01-15"
}
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "id_karyawan": "clx...",
    "nama": "John Doe",
    "jenis_kelamin": "L",
    "no_nik_ktp": "1234567890123456",
    "devisi": "IT & Digital",
    "level": "Senior Staff",
    // ... other fields
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "statusCode": 201
}
```

### Response (Duplicate NIK)
```json
{
  "success": false,
  "error": "NIK/KTP 1234567890123456 sudah terdaftar atas nama Jane Smith",
  "statusCode": 409
}
```

## Notes

1. **Divisi & Level are NOT enums** - They are free text input fields
2. **Column visibility persists** - State is maintained during session (not persisted to localStorage)
3. **Sticky action column** - Always visible on the right even when scrolling horizontally
4. **Empty string normalization** - Applied in all API controllers before validation
5. **Business rules in service layer** - NIK uniqueness check happens in service, not repository

## Future Enhancements

- [ ] Export to Excel/CSV
- [ ] Bulk import employees
- [ ] Employee detail/edit page
- [ ] Advanced filters (date range, multiple selections)
- [ ] Column visibility persistence (localStorage)
- [ ] Sorting by column headers
- [ ] Employee photo upload
- [ ] Print employee card

