# ============================================
# INSTRUKSI SETUP: Mutu Produksi PT-PKS
# ============================================

## 📝 Overview

Sistem untuk menerima data "Mutu Produksi" dari Google Sheets (Apps Script) ke Next.js + Prisma (PostgreSQL).

**Endpoint:** `POST /api/pt-pks/mutu-produksi/ingest`

**Fitur:**
- ✅ Upsert berdasarkan kombinasi `(tanggal, shift)`
- ✅ Simpan seluruh kolom asli dari Sheets ke kolom JSON `payload` (future-proof)
- ✅ Kolom inti: `rowId`, `tanggal`, `shift`, `sentAt`, `syncStatus`
- ✅ Autentikasi via header `x-api-key`
- ✅ Validasi input dengan Zod
- ✅ 3-tier architecture: Repository → Service → API Route

---

## 🚀 Setup Steps

### 1. Environment Variables

Tambahkan ke file `.env.local`:

```bash
# Google Sheets Integration
SHEETS_INGEST_KEY="ganti_dengan_api_key_sama_seperti_di_Apps_Script"
```

**⚠️ PENTING:** Gunakan API key yang sama di Apps Script dan server Next.js!

### 2. Database Migration

Sudah otomatis dibuat dengan `prisma db push`. Untuk production, gunakan:

```bash
npx prisma migrate deploy
```

File migration tersedia di: `prisma/migrations/add_pks_mutu_produksi/migration.sql`

### 3. Verify Prisma Client

```bash
npx prisma generate
```

### 4. Start Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

---

## 🧪 Testing

### Test dengan cURL (PowerShell)

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "your-api-key-here"
}

$body = @{
    mode = "bulk"
    rows = @(
        @{
            row_id = "2025-09-15_1_999"
            tanggal = "2025-09-15"
            shift = "1"
            A_TBS_tbs_diolah_hari = 356585
            C_cpo_produksi_hari = 123.45
            sync_status = "DRAFT"
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3000/api/pt-pks/mutu-produksi/ingest" -Method POST -Headers $headers -Body $body
```

### Test dengan cURL (Bash/Linux)

```bash
curl -X POST "http://localhost:3000/api/pt-pks/mutu-produksi/ingest" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -d '{
    "mode": "bulk",
    "rows": [
      {
        "row_id": "2025-09-15_1_999",
        "tanggal": "2025-09-15",
        "shift": "1",
        "A_TBS_tbs_diolah_hari": 356585,
        "C_cpo_produksi_hari": 123.45,
        "sync_status": "DRAFT"
      }
    ]
  }'
```

### Expected Response

**Success (200):**
```json
{
  "ok": true,
  "upserted": 1,
  "inserted": 1,
  "updated": 0
}
```

**Unauthorized (401):**
```json
{
  "ok": false,
  "error": "Unauthorized"
}
```

**Validation Error (400):**
```json
{
  "ok": false,
  "error": "Validation failed",
  "details": { ... }
}
```

---

## 📁 File Structure

```
src/
├── app/api/pt-pks/mutu-produksi/ingest/
│   └── route.ts                          # API Route Handler
├── server/
│   ├── types/pt-pks/
│   │   └── mutu-produksi.ts              # TypeScript types
│   ├── schemas/pt-pks/
│   │   └── mutu-produksi.ts              # Zod validation schemas
│   ├── mappers/pt-pks/
│   │   └── mutu-produksi.mapper.ts       # Data transformation
│   ├── repositories/pt-pks/
│   │   └── mutu-produksi.repo.ts         # Database operations (Prisma)
│   └── services/pt-pks/
│       └── mutu-produksi.service.ts      # Business logic
└── env.js                                 # Environment validation

prisma/
├── schema.prisma                          # Model: PksMutuProduksi
└── migrations/add_pks_mutu_produksi/
    └── migration.sql                      # Migration SQL
```

---

## 🔐 Security

1. **API Key Protection:** Endpoint dilindungi dengan `x-api-key` header
2. **Environment Validation:** API key wajib ada di `.env` via `@t3-oss/env-nextjs`
3. **Input Validation:** Semua input divalidasi dengan Zod schemas
4. **Error Handling:** Error messages tidak expose sensitive data

---

## 📊 Database Schema

```prisma
model PksMutuProduksi {
  id          String   @id @default(cuid())
  rowId       String   @unique
  tanggal     DateTime
  shift       String   @db.VarChar(10)
  payload     Json     // Seluruh data asli dari Sheets
  syncStatus  String?  @db.VarChar(20)
  sentAt      DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([tanggal, shift])
  @@index([tanggal])
  @@index([shift])
}
```

**Key Points:**
- Primary key: `id` (CUID)
- Unique constraint: `(tanggal, shift)` untuk upsert logic
- `payload` menyimpan seluruh row data sebagai JSON (future-proof)
- Indexes pada `tanggal` dan `shift` untuk query performance

---

## 🔄 Google Apps Script Integration

**Contoh payload yang dikirim dari Apps Script:**

```javascript
const data = {
  mode: "bulk",
  rows: [
    {
      row_id: "2025-09-15_1_123",
      tanggal: "2025-09-15",
      shift: "1",
      A_TBS_tbs_diolah_hari: 356585,
      B_TBS_sortasi_brondolan: 12.5,
      C_cpo_produksi_hari: 123.45,
      D_kernel_produksi_hari: 45.67,
      // ... semua kolom lain dari sheet
      sync_status: "DRAFT",
      sent_at: new Date().toISOString()
    }
  ]
};

const options = {
  method: "post",
  contentType: "application/json",
  headers: {
    "x-api-key": "your-api-key-here"
  },
  payload: JSON.stringify(data)
};

const response = UrlFetchApp.fetch(
  "https://your-domain.com/api/pt-pks/mutu-produksi/ingest",
  options
);
```

---

## ✅ Checklist Deployment

- [ ] Set `SHEETS_INGEST_KEY` di environment variables (Vercel/production)
- [ ] Run migration: `npx prisma migrate deploy`
- [ ] Verify API endpoint dengan test request
- [ ] Update Apps Script dengan production URL dan API key
- [ ] Test end-to-end dari Google Sheets
- [ ] Monitor logs untuk errors

---

## 🐛 Troubleshooting

### Error: "Unauthorized"
- Pastikan `x-api-key` header terkirim dengan benar
- Verify API key di `.env` sama dengan yang di Apps Script

### Error: "Validation failed"
- Check format `tanggal` harus `YYYY-MM-DD`
- `shift` wajib diisi (string atau number)
- `rows` array tidak boleh kosong

### Error: "tanggal is required"
- Data `tanggal` tidak valid atau kosong
- Format tanggal harus ISO date atau `YYYY-MM-DD`

### Database connection error
- Check `DATABASE_URL` dan `DIRECT_URL` di `.env`
- Verify database credentials dan network access

---

## 📚 Reference

- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Zod Validation:** https://zod.dev
- **T3 Stack:** https://create.t3.gg

---

**Created:** 2025-10-26  
**Version:** 1.0.0  
**Module:** PT-PKS Mutu Produksi Ingest System
