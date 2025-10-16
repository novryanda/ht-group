# TypeScript & ESLint Fix Guide

## 🎯 Tujuan

Memperbaiki semua error TypeScript dan ESLint agar `npm run build` sukses tanpa error.

## 📋 Masalah Umum & Solusi

### 1. Menghilangkan `any` Type

#### ❌ SALAH
```typescript
const data: any = await fetch(...).then(res => res.json());
data.items.map((item: any) => ...)
```

#### ✅ BENAR
```typescript
import type { PaginatedResult, GoodsIssueDTO } from "~/server/types/inventory";

const response = await fetch(...);
const result = await response.json() as { data?: PaginatedResult<GoodsIssueDTO> };
const data = result.data;

if (data) {
  data.data.map((item: GoodsIssueDTO) => ...)
}
```

### 2. Ganti `||` dengan `??` (Nullish Coalescing)

#### ❌ SALAH
```typescript
const note = row.note || "-";  // 0 atau "" akan jadi "-"
const qty = row.qty || 0;      // Bisa salah jika qty = 0
```

#### ✅ BENAR
```typescript
const note = row.note ?? "-";  // Hanya null/undefined jadi "-"
const qty = row.qty ?? 0;      // 0 tetap 0
```

### 3. Promise Handling

#### ❌ SALAH
```typescript
<button onClick={submitForm}>Submit</button>  // no-floating-promises
```

#### ✅ BENAR
```typescript
<button onClick={() => void submitForm()}>Submit</button>
// atau
<button onClick={async () => { await submitForm(); }}>Submit</button>
```

### 4. Unbound Method (Mapper Classes)

#### ❌ SALAH
```typescript
export class BuyerMapper {
  static toDTO(r: Buyer): BuyerDTO {
    return { id: r.id, name: r.name };
  }
}

// Usage yang error:
buyers.map(BuyerMapper.toDTO);  // unbound-method error
```

#### ✅ BENAR
```typescript
export class BuyerMapper {
  static toDTO = (this: void, r: Buyer): BuyerDTO => {
    return { id: r.id, name: r.name };
  };
}

// Usage:
buyers.map(BuyerMapper.toDTO);  // ✅ OK
```

### 5. String Interpolation dengan Object

#### ❌ SALAH
```typescript
const msg = `Cell ${cell} invalid`;  // cell adalah object → [object Object]
```

#### ✅ BENAR
```typescript
const msg = `Cell ${String(address)} invalid: ${JSON.stringify(cell)}`;
```

### 6. Role Checking dengan Union Types

#### ❌ SALAH
```typescript
const userRole: string | undefined = session?.user?.role;
if (!ALLOWED_ROLES.includes(userRole)) { ... }  // Error: string | undefined
```

#### ✅ BENAR
```typescript
const userRole = session?.user?.role;
if (!userRole || !ALLOWED_ROLES.includes(userRole as UserRole)) {
  return unauthorized();
}
```

### 7. Select Value dengan Empty String

#### ❌ SALAH
```typescript
<SelectItem value="">Semua</SelectItem>  // Radix UI error!
```

#### ✅ BENAR
```typescript
// Gunakan sentinel value
<SelectItem value="__all__">Semua</SelectItem>

// Di handler:
const actualValue = value === "__all__" ? undefined : value;
```

### 8. Form Optional Fields

#### ❌ SALAH
```typescript
interface FormData {
  note: string;  // Required
}

// Default value
defaultValues: { note: "" }  // Bisa jadi masalah
```

#### ✅ BENAR
```typescript
interface FormData {
  note?: string;  // Optional
}

// Default value
defaultValues: { note: undefined }

// Di submit:
const payload = {
  ...data,
  note: data.note ?? undefined,  // Convert "" to undefined
};
```

## 🔧 Perbaikan Per File Type

### API Routes (`app/api/**/route.ts`)

```typescript
import { NextResponse, type NextRequest } from "next/server";
import type { APIResponse, PaginatedResult } from "~/server/types/common";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse params dengan type safety
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20", 10);
    const search = searchParams.get("search") ?? undefined;
    
    const result = await someService.getData({ page, pageSize, search });
    
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
        statusCode: 500,
      } satisfies APIResponse,
      { status: 500 }
    );
  }
}
```

### React Components dengan TanStack Query

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedResult, GoodsIssueDTO } from "~/server/types/inventory";

export function IssueList() {
  const { data, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: async (): Promise<PaginatedResult<GoodsIssueDTO>> => {
      const res = await fetch("/api/inventory/issue");
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json() as { data?: PaginatedResult<GoodsIssueDTO> };
      if (!result.data) throw new Error("No data");
      return result.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      {data.data.map((issue) => (
        <div key={issue.id}>{issue.issueNo}</div>
      ))}
    </div>
  );
}
```

### Mapper Classes

```typescript
import type { Buyer, BuyerContact } from "@prisma/client";
import type { BuyerDTO, BuyerContactDTO } from "~/server/types/buyer";

export class BuyerMapper {
  static toDTO = (this: void, buyer: Buyer & { contacts: BuyerContact[] }): BuyerDTO => {
    return {
      id: buyer.id,
      buyerCode: buyer.buyerCode,
      legalName: buyer.legalName,
      tradeName: buyer.tradeName ?? undefined,
      contacts: buyer.contacts.map(BuyerMapper.contactToDTO),
    };
  };

  static contactToDTO = (this: void, contact: BuyerContact): BuyerContactDTO => {
    return {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      role: contact.role ?? undefined,
    };
  };

  static toDTOList = (this: void, buyers: (Buyer & { contacts: BuyerContact[] })[]): BuyerDTO[] => {
    return buyers.map(BuyerMapper.toDTO);
  };
}
```

### Service Layer

```typescript
import type { CreateBuyerDTO, BuyerDTO } from "~/server/types/buyer";

export class BuyerService {
  static async create(data: CreateBuyerDTO, userId: string): Promise<BuyerDTO> {
    // Validate
    const existing = await BuyerRepository.findByNpwp(data.npwp);
    if (existing) {
      throw new Error("NPWP_EXISTS: NPWP sudah terdaftar");
    }

    // Generate code
    const yearMonth = getCurrentYearMonth();
    const lastCode = await BuyerRepository.getLastBuyerCodeForMonth(yearMonth);
    const buyerCode = generateBuyerCode(lastCode);

    // Create
    const buyer = await BuyerRepository.create(data, buyerCode, userId);

    return BuyerMapper.toDTO(buyer);
  }
}
```

## 📝 Checklist Perbaikan

### Global
- [ ] Hapus semua `any` type, ganti dengan tipe spesifik
- [ ] Ganti `||` dengan `??` untuk default values
- [ ] Tambahkan `void` untuk floating promises
- [ ] Gunakan `import type` untuk type-only imports
- [ ] Hapus unused variables atau prefix dengan `_`

### Per Module

#### Inventory Module
- [ ] `issue-list.tsx`: Type query result, ganti `any`
- [ ] `transfer-list.tsx`: Type query result, ganti `any`
- [ ] `stock-count-list.tsx`: Type query result, ganti `any`
- [ ] `opening-balance-form.tsx`: Fix promise handlers
- [ ] `transfer-form-dialog.tsx`: Fix promise handlers
- [ ] `stock-count-form-dialog.tsx`: Fix promise handlers
- [ ] `inventory.mapper.ts`: Convert methods to arrow functions

#### PB Import Module
- [ ] `pb-workbook-parser.service.ts`: Fix string interpolation, regex
- [ ] `pb-import.ts`: Type all responses properly

#### Buyer Module
- [ ] `buyer.mapper.ts`: Convert to arrow functions

#### Transporter Module
- [ ] `transporter.mapper.ts`: Convert to arrow functions

#### Auth & RBAC
- [ ] `auth/config.ts`: Type session properly
- [ ] `rbac.ts`: Remove `any` from permissions

## 🛠️ ESLint Config Tweaks (Minimal)

Jika masih ada error yang sulit diperbaiki, tambahkan override spesifik:

```javascript
// eslint.config.js
export default tseslint.config(
  // ... existing config
  {
    files: ["src/server/services/pb-workbook-parser.service.ts"],
    rules: {
      "@typescript-eslint/prefer-regexp-exec": "off",
      "@typescript-eslint/no-base-to-string": "off",
    },
  },
);
```

## ✅ Testing Commands

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Lint with auto-fix
npm run lint:fix

# Build
npm run build
```

## 🎯 Target

- ✅ `npm run typecheck` → 0 errors
- ✅ `npm run lint` → 0 errors
- ✅ `npm run build` → Success

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [ESLint TypeScript Rules](https://typescript-eslint.io/rules/)
- [Nullish Coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
- [Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

---

**Status**: Guide complete, ready for implementation

