# 🚀 Panduan Deployment ke Vercel

## ❌ Masalah Login di Production

### Gejala:
- Login berhasil di localhost tapi gagal di Vercel
- Error: "Email atau password tidak valid"
- Menggunakan database yang sama

### Penyebab:
1. ❌ `NODE_ENV=production` di-set manual di `.env` (jangan lakukan ini!)
2. ❌ `AUTH_TRUST_HOST` tidak di-enable
3. ❌ `NEXTAUTH_URL` tidak di-konfigurasi dengan benar di Vercel

---

## ✅ Solusi & Konfigurasi yang Benar

### 1. **Environment Variables Lokal (.env)**

File `.env` Anda harus seperti ini:

```env
# NextAuth Configuration
AUTH_SECRET="svmTpX0gdYbQlHTtDtqoUTYAw4Ak1DchuyZWiHbKxqw="
AUTH_TRUST_HOST=true

# Database Configuration
DATABASE_URL="postgresql://postgres.xxx:password@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@xxx.supabase.com:5432/postgres"

# ⚠️ JANGAN set NODE_ENV secara manual!
# ⚠️ JANGAN set NEXTAUTH_URL di .env untuk production
```

### 2. **Environment Variables di Vercel Dashboard**

Buka Vercel Dashboard → Project Settings → Environment Variables, lalu tambahkan:

#### **Production Environment:**
```
AUTH_SECRET="svmTpX0gdYbQlHTtDtqoUTYAw4Ak1DchuyZWiHbKxqw="
AUTH_TRUST_HOST=true
DATABASE_URL="postgresql://postgres.xxx:password@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@xxx.supabase.com:5432/postgres"
```

**PENTING:** Jangan tambahkan `NODE_ENV` - Vercel sudah otomatis set ke `production`

#### **Preview & Development (Optional):**
Anda bisa set environment variables yang sama untuk environment Preview dan Development jika perlu.

---

## 🔐 Generate AUTH_SECRET Baru (Opsional)

Jika Anda ingin generate `AUTH_SECRET` baru yang lebih aman:

### Di Terminal:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Atau gunakan online generator:
```
https://generate-secret.vercel.app/32
```

---

## 🔍 Troubleshooting

### Issue 1: "Email atau password tidak valid" di Vercel
**Penyebab:** Environment variables tidak dikonfigurasi dengan benar

**Solusi:**
1. ✅ Pastikan `AUTH_TRUST_HOST=true` ada di Vercel environment variables
2. ✅ Hapus `NODE_ENV` dari Vercel environment variables (jika ada)
3. ✅ Hapus `NEXTAUTH_URL` dari Vercel environment variables (Next-Auth v5 otomatis detect)
4. ✅ Redeploy project setelah update environment variables

### Issue 2: "Invalid Host" error
**Solusi:** Pastikan `trustHost: true` ada di `base-config.ts` (sudah ada di kode Anda)

### Issue 3: Database connection failed
**Penyebab:** Database URL salah atau database tidak accessible dari Vercel

**Solusi:**
1. Pastikan `DATABASE_URL` menggunakan connection pooling (port 6543 untuk Supabase)
2. Verifikasi database credentials masih valid
3. Cek Supabase firewall settings (allow connections from Vercel)

### Issue 4: Session tidak persist setelah login
**Penyebab:** Cookie settings tidak kompatibel dengan production

**Solusi:** Cookie configuration sudah benar di `base-config.ts`:
```typescript
cookies: {
  sessionToken: {
    name: process.env.NODE_ENV === "production" 
      ? "__Secure-authjs.session-token" 
      : "authjs.session-token",
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    },
  },
}
```

---

## �️ Prisma "engine not found" (rhel-openssl-3.0.x)

Jika Anda melihat error seperti di log:

```
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

Penyebab umum:
- Bundler (Next.js build) tidak menyertakan file native Query Engine (`libquery_engine-*.so.node`) ke bundle yang di-deploy.
- Prisma secara default menghasilkan engine untuk platform pengembang lokal dan mungkin tidak menyertakan target runtime Vercel.

Solusi yang sudah diterapkan di repo ini:
1. Pada `prisma/schema.prisma` generator sudah dikonfigurasi dengan:

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
  engineType = "library"
}
```

2. Pastikan `prisma generate` dijalankan selama proses build di Vercel. Paket ini telah mengubah skrip `build` di `package.json` menjadi:

```json
"build": "prisma generate && next build"
```

3. Jika masih bermasalah, dua opsi tambahan:

- Gunakan Prisma Data Proxy (recommended untuk serverless):
  - Aktifkan Data Proxy di Prisma Cloud.
  - Set `DATABASE_URL` ke Data Proxy URL di Vercel.

- Alternatif: set environment variable `PRISMA_CLIENT_ENGINE_TYPE=library` di Vercel (Environment → Add), agar Prisma memaksa penggunaan Node-API library.

4. Setelah mengubah build or env, lakukan redeploy di Vercel dan periksa log function.

Contoh pesan log yang menandakan perbaikan:

```
Prisma Client call succeeded
```


## �📋 Checklist Deployment

Sebelum push ke Vercel, pastikan:

- [ ] File `.env` tidak mengandung `NODE_ENV=production`
- [ ] File `.env` tidak mengandung `NEXTAUTH_URL=http://localhost:3000`
- [ ] `AUTH_TRUST_HOST=true` ada di `.env` dan Vercel environment variables
- [ ] `AUTH_SECRET` sama di local dan Vercel
- [ ] `DATABASE_URL` dan `DIRECT_URL` benar
- [ ] `.env` ada di `.gitignore` (jangan commit ke Git!)
- [ ] Vercel environment variables sudah dikonfigurasi
- [ ] Redeploy setelah update environment variables

---

## 🎯 Langkah-langkah Deploy

1. **Update file `.env` lokal** (sudah diperbaiki)
2. **Push code ke Git:**
   ```powershell
   git add .
   git commit -m "fix: Update auth config for Vercel production"
   git push origin main
   ```

3. **Update Vercel Environment Variables:**
   - Buka https://vercel.com/dashboard
   - Pilih project Anda
   - Settings → Environment Variables
   - Tambahkan variables seperti di atas
   - Hapus `NODE_ENV` dan `NEXTAUTH_URL` jika ada

4. **Redeploy:**
   - Vercel akan otomatis deploy setelah push
   - ATAU manual trigger redeploy di Dashboard → Deployments → "..." → Redeploy

5. **Test Login:**
   - Buka `https://your-app.vercel.app/login`
   - Gunakan credentials demo dari seed:
     ```
     Email: executive@htgroup.com
     Password: executive123
     ```

---

## 📝 Catatan Penting

### NextAuth v5 (Auth.js) Changes:
- ✅ `trustHost: true` wajib untuk custom domains
- ✅ `NEXTAUTH_URL` tidak lagi required (auto-detected)
- ✅ Cookie names berbeda antara dev dan production (`__Secure-` prefix)

### Vercel Specifics:
- ⚠️ Environment variables changes require **redeploy**
- ⚠️ Jangan set `NODE_ENV` manually di Vercel
- ✅ Vercel otomatis set environment (development/preview/production)

### Database (Supabase):
- ✅ Gunakan **connection pooling** URL (port 6543) untuk `DATABASE_URL`
- ✅ Gunakan **direct connection** (port 5432) untuk `DIRECT_URL` (migrations)
- ⚠️ Pastikan Supabase project tidak paused (free tier auto-pause setelah 1 minggu inactive)

---

## 🆘 Masih Bermasalah?

### Check Vercel Logs:
```
Vercel Dashboard → Deployments → [Latest] → Functions
```
Lihat log dari `/api/auth/[...nextauth]` untuk error messages

### Enable Debug Mode (Temporary):
Tambahkan di `src/server/auth/config.ts`:
```typescript
export const authConfig: NextAuthConfig = {
  ...baseAuthConfig,
  debug: process.env.NODE_ENV === "development", // atau set true sementara
  // ... rest of config
}
```

### Test Database Connection:
Buat API route sementara di `src/app/api/test-db/route.ts`:
```typescript
import { db } from "~/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userCount = await db.user.count();
    return NextResponse.json({ 
      success: true, 
      userCount,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
```

Akses: `https://your-app.vercel.app/api/test-db`

---

## ✨ Setelah Fix

Setelah mengikuti panduan ini:
- ✅ Login akan bekerja di production
- ✅ Session cookies akan persist dengan benar
- ✅ RBAC dan redirect akan berfungsi normal
- ✅ Database connection stable

**Jangan lupa hapus API route test setelah selesai debugging!**
