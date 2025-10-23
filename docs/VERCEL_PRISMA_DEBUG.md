# 🔍 Debug Prisma Engine di Vercel

## Status Saat Ini
- ✅ `prisma/schema.prisma` sudah include `binaryTargets = ["native", "rhel-openssl-3.0.x"]`
- ✅ `prisma/schema.prisma` sudah include `engineType = "library"`
- ✅ `package.json` build script sudah: `"build": "prisma generate && next build"`
- ✅ Commit sudah di-push: `f3a1d6f`

## ❌ Masalah yang Masih Terjadi
Error di Vercel log:
```
Error [PrismaClientInitializationError]: Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

## 🔧 Solusi Tambahan yang Perlu Dicoba

### Opsi 1: Verifikasi Build Log di Vercel
1. Buka Vercel Dashboard → Project → Deployments
2. Klik deployment terbaru (setelah commit `f3a1d6f`)
3. Lihat **Build Logs** dan cari:
   - ✅ `prisma generate` dijalankan?
   - ✅ Ada output: `Generated Prisma Client` dengan mention `rhel-openssl-3.0.x`?
   - ❌ Ada error saat `prisma generate`?

**Jika `prisma generate` TIDAK muncul di build log**, lanjut ke Opsi 2.

### Opsi 2: Tambahkan Environment Variable di Vercel

Buka Vercel Dashboard → Settings → Environment Variables, tambahkan:

```
Key: PRISMA_CLIENT_ENGINE_TYPE
Value: library
Environment: Production, Preview, Development
```

Kemudian **Redeploy** (jangan hanya push lagi).

### Opsi 3: Pastikan `postinstall` Script Berjalan

Vercel kadang skip `postinstall`. Mari kita tambahkan `vercel-build` script eksplisit.

Ubah `package.json`:
```json
"scripts": {
  "build": "prisma generate && next build",
  "vercel-build": "prisma generate && next build",
  "postinstall": "prisma generate"
}
```

### Opsi 4: Generate Prisma Client Secara Lokal Dulu

Sebelum push, jalankan:
```powershell
npx prisma generate
```

Kemudian cek apakah file engine ter-generate:
```powershell
ls node_modules\.prisma\client
```

Anda harus lihat file seperti:
- `libquery_engine-windows.dll.node` (untuk Windows local)
- Atau engine lain

Kalau ada, commit node_modules/.prisma/client (TIDAK DIREKOMENDASIKAN tapi bisa untuk testing):
```powershell
git add -f node_modules/.prisma/client
git commit -m "temp: force include prisma client"
git push
```

**WARNING**: Ini hanya untuk testing! Jangan biarkan di production.

### Opsi 5: Gunakan Prisma Data Proxy (RECOMMENDED untuk Serverless)

Ini solusi terbaik untuk Vercel!

1. **Setup Prisma Data Proxy:**
   - Buka https://console.prisma.io
   - Login / Signup
   - Create new project
   - Connect to your database (masukkan `DIRECT_URL` dari Supabase)
   - Dapatkan **Data Proxy Connection String**

2. **Update Vercel Environment Variables:**
   ```
   DATABASE_URL="prisma://[your-data-proxy-url]"
   ```
   
   **PENTING**: Ganti `DATABASE_URL` dengan Data Proxy URL, bukan Supabase direct URL!

3. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     // Hapus directUrl jika pakai Data Proxy
   }
   ```

4. **Redeploy Vercel**

**Keuntungan Data Proxy:**
- ✅ Tidak perlu bundle native engine binary
- ✅ Lebih cepat cold start
- ✅ Connection pooling otomatis
- ✅ Ideal untuk serverless/edge

### Opsi 6: Downgrade Prisma (Last Resort)

Jika semua gagal, coba downgrade ke Prisma 5.x:

```powershell
npm install prisma@5.20.0 @prisma/client@5.20.0
npx prisma generate
git add package.json package-lock.json
git commit -m "downgrade prisma to 5.20.0"
git push
```

Prisma 5.x lebih stable untuk Vercel deployment.

## 📊 Checklist Debug

Coba satu per satu:

- [ ] **Step 1**: Verifikasi build log di Vercel (lihat apakah `prisma generate` berjalan)
- [ ] **Step 2**: Tambahkan env `PRISMA_CLIENT_ENGINE_TYPE=library` di Vercel → Redeploy
- [ ] **Step 3**: Tambahkan script `vercel-build` di package.json → Push
- [ ] **Step 4**: Gunakan Prisma Data Proxy (PALING DIREKOMENDASIKAN)
- [ ] **Step 5**: Downgrade Prisma ke 5.x jika masih gagal

## 🎯 Solusi Tercepat (Quick Win)

**Langsung coba ini dulu:**

1. **Di Vercel Dashboard**:
   - Settings → Environment Variables
   - Add: `PRISMA_CLIENT_ENGINE_TYPE=library`
   - Save

2. **Redeploy**:
   - Deployments → Latest → "..." menu → **Redeploy**
   - ✅ Check "Use existing build cache" = OFF

3. **Test login** setelah deployment selesai.

Jika masih gagal, lanjut ke Prisma Data Proxy (Opsi 5).

## 📞 Jika Masih Bermasalah

Share ke saya:
1. Screenshot Build Log dari Vercel (bagian yang run `npm run build`)
2. Screenshot Environment Variables di Vercel
3. Output dari command lokal: `npx prisma -v`

---

**Note**: Error ini sangat umum di Vercel dengan Prisma 6.x. Solusi paling reliable adalah menggunakan Prisma Data Proxy atau downgrade ke Prisma 5.x.
