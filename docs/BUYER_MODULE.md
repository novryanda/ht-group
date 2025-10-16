# Modul DataMaster Buyer - PT PKS

## 📋 Overview

Modul DataMaster Buyer adalah sistem manajemen data buyer (pembeli) untuk PT PKS yang dibangun dengan arsitektur 3-tier (Presentation, Controller, Service/Domain). Buyer yang dibuat oleh ADMIN akan langsung berstatus VERIFIED dan siap digunakan untuk pembuatan kontrak dan proses DO/SPK.

## 🎯 Fitur Utama

### 1. **Auto-Verified Buyer Creation**
- Buyer dibuat oleh ADMIN dan langsung berstatus VERIFIED
- Tidak ada proses approval tambahan
- Audit trail lengkap (verifiedAt, verifiedById)

### 2. **Duplicate Prevention**
- **Prioritas NPWP**: Jika NPWP diisi, sistem akan cek duplikasi berdasarkan NPWP
- **Fallback Name+Location**: Jika NPWP kosong, sistem cek berdasarkan kombinasi (legalName + city + province)
- Live validation saat input NPWP
- Warning message dengan link ke buyer yang mirip

### 3. **Buyer Code Generation**
- Format: `B-YYYYMM-###`
- Contoh: `B-202501-001`, `B-202501-002`
- Auto-increment per bulan
- Reset sequence setiap bulan baru

### 4. **Comprehensive Data Management**
- Identitas: Type (Company/Person), Legal Name, Trade Name, NPWP, PKP Status
- Alamat & Penagihan: Full address, city, province, postal code, billing email, phone
- Logistik: Destination name & address untuk pengiriman
- Kontak: Multiple contact persons dengan role dan billing flag
- Dokumen: Optional document attachments (NPWP, NIB, KTP, Akta, dll)

### 5. **Mobile-First UI**
- Responsive design untuk semua ukuran layar
- Optimized untuk mobile (≥ 390px width)
- Single-page form untuk input cepat
- Inline validation dengan error messages

## 🏗️ Arsitektur

### Database Layer (Prisma)

```prisma
model Buyer {
  id               String      @id @default(cuid())
  buyerCode        String      @unique
  type             BuyerType   // COMPANY | PERSON
  legalName        String
  tradeName        String?
  npwp             String?     @unique
  pkpStatus        PkpStatus   // NON_PKP | PKP_11 | PKP_1_1
  addressLine      String
  city             String
  province         String
  postalCode       String?
  billingEmail     String
  phone            String
  destinationName  String
  destinationAddr  String
  status           BuyerStatus @default(VERIFIED)
  verifiedAt       DateTime?
  verifiedById     String?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
  contacts         BuyerContact[]
  docs             BuyerDoc[]
}

model BuyerContact {
  id        String  @id @default(cuid())
  buyerId   String
  name      String
  role      String?
  email     String
  phone     String
  isBilling Boolean @default(false)
  buyer     Buyer   @relation(...)
}

model BuyerDoc {
  id        String @id @default(cuid())
  buyerId   String
  kind      String
  fileUrl   String
  fileName  String
  buyer     Buyer  @relation(...)
}
```

### Service Layer

**Location**: `src/server/`

```
server/
├── types/buyer.ts              # TypeScript types & DTOs
├── schemas/buyer.ts            # Zod validation schemas
├── repositories/buyer.repo.ts  # Prisma queries
├── mappers/buyer.mapper.ts     # Data transformation
├── services/buyer.service.ts   # Business logic
├── api/buyers.ts               # API module (validation & error handling)
└── lib/codegen.ts              # Buyer code generator
```

### Controller Layer

**Location**: `src/app/api/buyers/`

```
api/buyers/
├── route.ts           # GET (list), POST (create)
├── [id]/route.ts      # GET (detail), PATCH (update), DELETE
├── check/route.ts     # GET (duplicate check)
└── stats/route.ts     # GET (statistics)
```

### Presentation Layer

**Location**: `src/app/(protected-pages)/dashboard/pt-pks/datamaster/buyer/`

```
buyer/
├── page.tsx           # List page
├── new/page.tsx       # Create page
└── [id]/page.tsx      # Detail page
```

**Components**: `src/components/pt-pks/datamaster/buyer/`

```
buyer/
├── buyer-list.tsx     # Table with search, filter, pagination
├── buyer-form.tsx     # Create form with validation
├── buyer-detail.tsx   # Detail view with action buttons
└── index.ts           # Exports
```

## 🔐 Access Control

### Roles & Permissions

| Role | List | View Detail | Create | Update | Delete |
|------|------|-------------|--------|--------|--------|
| PT_PKS_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| EXECUTIVE | ✅ | ✅ | ❌ | ❌ | ❌ |
| GROUP_VIEWER | ✅ | ✅ | ❌ | ❌ | ❌ |

### Implementation

```typescript
// API Route Example
const session = await auth();
const userRole = (session.user as any).role;

// Read access
const allowedRoles = ["PT_PKS_ADMIN", "EXECUTIVE", "GROUP_VIEWER"];
if (!allowedRoles.includes(userRole)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Write access (create/update/delete)
if (userRole !== "PT_PKS_ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

## 📡 API Endpoints

### 1. List Buyers
```http
GET /api/buyers?query=&type=&status=&page=1&pageSize=10
```

**Query Parameters**:
- `query`: Search by code, name, NPWP
- `type`: Filter by COMPANY | PERSON
- `pkpStatus`: Filter by NON_PKP | PKP_11 | PKP_1_1
- `status`: Filter by DRAFT | VERIFIED | INACTIVE
- `city`: Filter by city
- `province`: Filter by province
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: asc | desc (default: desc)

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Create Buyer
```http
POST /api/buyers
Content-Type: application/json
```

**Request Body**:
```json
{
  "type": "COMPANY",
  "legalName": "PT ABC Indonesia",
  "tradeName": "ABC Corp",
  "npwp": "123456789012345",
  "pkpStatus": "PKP_11",
  "addressLine": "Jl. Sudirman No. 123",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "postalCode": "12345",
  "billingEmail": "billing@abc.com",
  "phone": "08123456789",
  "destinationName": "Gudang Utama Jakarta",
  "destinationAddr": "Jl. Warehouse No. 1",
  "contacts": [
    {
      "name": "John Doe",
      "role": "Manager",
      "email": "john@abc.com",
      "phone": "08123456789",
      "isBilling": true
    }
  ],
  "docs": []
}
```

**Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Buyer berhasil dibuat dan terverifikasi"
}
```

### 3. Get Buyer Detail
```http
GET /api/buyers/{id}
```

### 4. Update Buyer
```http
PATCH /api/buyers/{id}
Content-Type: application/json
```

### 5. Delete Buyer
```http
DELETE /api/buyers/{id}
```

### 6. Check Duplicate
```http
GET /api/buyers/check?npwp=123456789012345
GET /api/buyers/check?legalName=PT ABC&city=Jakarta&province=DKI Jakarta
```

**Response**:
```json
{
  "success": true,
  "data": {
    "isDuplicate": true,
    "duplicates": [...],
    "message": "Buyer dengan NPWP 123456789012345 sudah terdaftar"
  }
}
```

### 7. Get Statistics
```http
GET /api/buyers/stats
```

## 🧪 Testing Checklist

### Functional Tests

- [ ] **Create Buyer**
  - [ ] Create with NPWP → auto VERIFIED
  - [ ] Create without NPWP → auto VERIFIED
  - [ ] Buyer code follows B-YYYYMM-### format
  - [ ] verifiedAt and verifiedById are set

- [ ] **Duplicate Prevention**
  - [ ] Duplicate NPWP is rejected
  - [ ] Duplicate name+city+province (when NPWP empty) is rejected
  - [ ] Live NPWP validation shows warning
  - [ ] Different NPWP with same name is allowed

- [ ] **List & Search**
  - [ ] Search by code works
  - [ ] Search by name works
  - [ ] Search by NPWP works
  - [ ] Filters (type, status, city, province) work
  - [ ] Pagination works correctly

- [ ] **Detail View**
  - [ ] All fields displayed correctly
  - [ ] Contacts list shown
  - [ ] Documents list shown (if any)
  - [ ] "Buat Kontrak" button visible

- [ ] **Validation**
  - [ ] Email validation works
  - [ ] NPWP must be 15 digits
  - [ ] Required fields enforced
  - [ ] Minimum 1 contact required

- [ ] **Access Control**
  - [ ] PT_PKS_ADMIN can create/update/delete
  - [ ] EXECUTIVE can only view
  - [ ] GROUP_VIEWER can only view
  - [ ] Other roles get 403 Forbidden

- [ ] **UI/UX**
  - [ ] Mobile responsive (≥ 390px)
  - [ ] Form validation shows inline errors
  - [ ] Loading states work
  - [ ] Toast notifications appear
  - [ ] Empty states shown when no data

## 🚀 Usage Examples

### Creating a Buyer (Admin)

1. Navigate to `/dashboard/pt-pks/datamaster/buyer`
2. Click "Tambah Buyer"
3. Fill in the form:
   - Select type (Company/Person)
   - Enter legal name
   - Enter NPWP (optional, will check for duplicates)
   - Select PKP status
   - Fill address details
   - Enter billing email and phone
   - Add destination info
   - Add at least 1 contact
4. Click "Simpan & Terverifikasi"
5. Buyer is created with status VERIFIED
6. Redirected to buyer detail page

### Viewing Buyer List

1. Navigate to `/dashboard/pt-pks/datamaster/buyer`
2. Use search bar to find buyers
3. Apply filters (type, status)
4. Click eye icon to view details
5. Use pagination to browse pages

### Creating a Contract from Buyer

1. View buyer detail
2. Click "Buat Kontrak" button
3. Redirected to contract creation with buyer pre-selected

## 📝 Notes

- Buyer code generation is thread-safe (uses database sequence)
- NPWP is optional but recommended for PKP buyers
- Contacts can be updated after creation
- Documents are optional and can be added later
- Status can be changed to INACTIVE to soft-delete
- All timestamps are in UTC, displayed in local timezone

## 🔄 Future Enhancements

- [ ] Excel import for bulk buyer creation
- [ ] Export buyer list to Excel/PDF
- [ ] Buyer history/audit log
- [ ] Email notifications on buyer creation
- [ ] Integration with tax validation API
- [ ] Advanced search with more filters
- [ ] Buyer merge functionality for duplicates

