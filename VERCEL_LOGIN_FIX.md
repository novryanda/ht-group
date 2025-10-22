# 🚨 QUICK FIX: Login Gagal di Vercel

## Masalah Anda:
✅ Login berhasil di **localhost**  
❌ Login gagal di **Vercel production** (email/password tidak valid)  
✅ Menggunakan **database yang sama**

---

## 🔥 ROOT CAUSE:
Anda set `NODE_ENV=production` di file `.env` lokal! Ini membuat Next.js dan NextAuth bingung.

---

## ✅ SOLUSI CEPAT (3 LANGKAH):

### 1️⃣ Update file `.env` lokal (SUDAH DIPERBAIKI ✅)
```env
AUTH_SECRET="svmTpX0gdYbQlHTtDtqoUTYAw4Ak1DchuyZWiHbKxqw="
AUTH_TRUST_HOST=true
DATABASE_URL="postgresql://postgres.xxx..."
DIRECT_URL="postgresql://postgres.xxx..."

# ❌ HAPUS INI:
# NODE_ENV=production  
# NEXTAUTH_URL="http://localhost:3000/"
```

### 2️⃣ Update Vercel Environment Variables
Buka: **Vercel Dashboard → Settings → Environment Variables**

Tambahkan untuk **Production**:
```
AUTH_SECRET = svmTpX0gdYbQlHTtDtqoUTYAw4Ak1DchuyZWiHbKxqw=
AUTH_TRUST_HOST = true
DATABASE_URL = postgresql://postgres.mgnrhwmqgucqmpewumgm:9yipvrWyUwbKNznU@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL = postgresql://postgres.mgnrhwmqgucqmpewumgm:9yipvrWyUwbKNznU@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```

⚠️ **JANGAN tambahkan:**
- ❌ `NODE_ENV` (Vercel set otomatis)
- ❌ `NEXTAUTH_URL` (NextAuth v5 auto-detect)

### 3️⃣ Redeploy
```powershell
git add .
git commit -m "fix: remove NODE_ENV from env file for Vercel"
git push origin main
```

Atau trigger **manual redeploy** di Vercel Dashboard.

---

## 🧪 Test Login
Setelah deploy selesai, test dengan:
```
Email: executive@htgroup.com
Password: executive123
```

---

## 📖 Detail Lengkap
Lihat: `docs/VERCEL_DEPLOYMENT_GUIDE.md`

## 🆘 Masih Error?
Check Vercel Function logs di:
**Deployments → [Latest] → Functions → /api/auth/[...nextauth]**
