# Company ID Refactoring Summary

## Overview
Mengganti semua hardcoded company ID `"PT-PKS"` dengan query dari database menggunakan helper function untuk memastikan konsistensi dan maintainability.

## Problem
Beberapa API routes menggunakan hardcoded string `"PT-PKS"` sebagai company ID, padahal di database company menggunakan CUID (Cryptographic Unique ID).

## Solution

### 1. Created Helper Functions
**File**: `src/server/lib/company-helpers.ts`

```typescript
// Get PT PKS company (most commonly used)
export async function getPTPKSCompany()

// Get company by name
export async function getCompanyByName(name: string)

// Get company by code
export async function getCompanyByCode(code: string)
```

### 2. Refactored API Routes

**Files Updated:**
1. ✅ `src/app/api/pt-pks/jurnal-umum/route.ts`
2. ✅ `src/app/api/pt-pks/buku-besar/route.ts`
3. ✅ `src/app/api/pt-pks/neraca/route.ts`
4. ✅ `src/app/api/pt-pks/laporan-keuangan/route.ts`
5. ✅ `src/app/api/pt-pks/transaksi-gudang/loan-return/route.ts`
6. ✅ `src/app/api/pt-pks/transaksi-gudang/barang-keluar/route.ts`

**Before:**
```typescript
// ❌ Hardcoded - akan error karena tidak match dengan CUID di database
const companyId = "PT-PKS";
const result = await service.method(companyId, ...);
```

**After:**
```typescript
// ✅ Dynamic query dari database
import { getPTPKSCompany } from "~/server/lib/company-helpers";

const company = await getPTPKSCompany();
const result = await service.method(company.id, ...);
```

### 3. Benefits

✅ **Consistency**: Semua API routes menggunakan cara yang sama untuk mendapatkan company ID
✅ **Maintainability**: Jika perlu mengubah logic, hanya perlu update di satu tempat
✅ **Type Safety**: Helper function throw error jika company tidak ditemukan
✅ **Reusability**: Helper bisa digunakan untuk company lain (PT-NILO, PT-ZTA, dll)
✅ **No More Hardcoding**: Tidak ada lagi hardcoded company ID di codebase

## Verification

```bash
# TypeScript Check
npm run typecheck
# ✅ PASSED - No errors

# Grep Check
grep -r "PT-PKS" src/app/api/pt-pks/ --include="*.ts"
# ✅ No hardcoded "PT-PKS" found (only in comments)
```

## Usage Example

### For PT PKS Routes
```typescript
import { getPTPKSCompany } from "~/server/lib/company-helpers";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get company with error handling
  try {
    const company = await getPTPKSCompany();
    const result = await someService.getData(company.id);
    return NextResponse.json(result);
  } catch (error) {
    // Helper throws error if company not found
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }
}
```

### For Other Companies
```typescript
import { getCompanyByName, getCompanyByCode } from "~/server/lib/company-helpers";

// By name
const ptNilo = await getCompanyByName("PT NILO");

// By code (if company.code is set)
const ptZta = await getCompanyByCode("PT-ZTA");
```

## Testing Checklist

- ✅ All API routes compile without errors
- ✅ TypeScript type checking passed
- ✅ Financial reports (Jurnal Umum, Buku Besar, Neraca, Laba Rugi) working
- ✅ Warehouse transactions (Barang Keluar, Loan Return) working
- ✅ Helper function throws proper error when company not found

## Related Files
- Helper: `src/server/lib/company-helpers.ts`
- API Routes: `src/app/api/pt-pks/**/*.ts`
- Documentation: This file

## Next Steps for Other Routes
If adding new PT-PKS API routes, always use:
```typescript
import { getPTPKSCompany } from "~/server/lib/company-helpers";

const company = await getPTPKSCompany();
// Use company.id instead of hardcoded "PT-PKS"
```
