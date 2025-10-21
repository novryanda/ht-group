# Panduan Deployment & Troubleshooting Login Production

## Masalah Login Gagal di Production

### 🔍 Penyebab Umum

1. **Missing `AUTH_TRUST_HOST`** - NextAuth v5 memerlukan konfigurasi ini untuk custom domain
2. **Cookie Settings Salah** - Cookie tidak ter-set dengan benar untuk HTTPS
3. **URL Mismatch** - `NEXTAUTH_URL` tidak sesuai dengan domain production
4. **CORS/Cookie SameSite** - Browser memblokir cookie dari domain berbeda

### ✅ Solusi yang Sudah Diterapkan

#### 1. Tambah `trustHost: true` di Base Config

File: `src/server/auth/base-config.ts`

```typescript
export const baseAuthConfig = {
  trustHost: true, // ✅ Wajib untuk production
  // ...
}
```

#### 2. Cookie Configuration untuk HTTPS

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
      secure: process.env.NODE_ENV === "production", // ✅ True untuk HTTPS
    },
  },
}
```

#### 3. Environment Variables

File: `.env` (production)

```bash
AUTH_SECRET="svmTpX0gdYbQlHTtDtqoUTYAw4Ak1DchuyZWiHbKxqw="
AUTH_TRUST_HOST=true  # ✅ Wajib ditambahkan
NEXTAUTH_URL="https://htgroup.id/"
DATABASE_URL="postgresql://..."
NODE_ENV=production
```

### 🚀 Checklist Deployment

Sebelum deploy ke production, pastikan:

- [ ] `AUTH_TRUST_HOST=true` ada di environment variables
- [ ] `NEXTAUTH_URL` sesuai dengan domain production (dengan https://)
- [ ] `AUTH_SECRET` sudah di-generate dengan: `openssl rand -base64 32`
- [ ] `NODE_ENV=production` untuk enable secure cookies
- [ ] Domain menggunakan HTTPS (SSL certificate aktif)
- [ ] Cookie tidak diblokir oleh browser (check DevTools > Application > Cookies)

### 🔧 Testing di Production

1. **Check Environment Variables**
   ```bash
   # Di server/hosting
   echo $AUTH_TRUST_HOST
   echo $NEXTAUTH_URL
   echo $NODE_ENV
   ```

2. **Check Browser Console**
   - Buka DevTools (F12)
   - Tab Console - lihat error dari NextAuth
   - Tab Network - check API calls ke `/api/auth/*`
   - Tab Application > Cookies - pastikan cookie `__Secure-authjs.session-token` ada

3. **Check Server Logs**
   - Lihat log dari authorize callback
   - Pastikan tidak ada error "Invalid host" atau "Untrusted host"

### 🐛 Debug Mode

Untuk enable debug logs di production (temporary):

```bash
# Tambahkan ke environment variables
DEBUG=next-auth:*
NEXTAUTH_DEBUG=true
```

Lalu check server logs untuk melihat detail authentication flow.

### 📝 Common Errors & Solutions

#### Error: "Invalid Host"
```
Solution: Pastikan AUTH_TRUST_HOST=true di environment
```

#### Error: Cookie tidak ter-save
```
Solution: 
1. Pastikan menggunakan HTTPS
2. Check secure cookie settings
3. Pastikan domain tidak di-block oleh adblocker
```

#### Error: CORS/Cookie SameSite
```
Solution:
1. Pastikan frontend dan backend di domain yang sama
2. Atau gunakan sameSite: "lax" (sudah dikonfigurasi)
```

#### Error: Session null setelah login
```
Solution:
1. Check JWT callback - pastikan return token dengan user data
2. Check session callback - pastikan token di-pass ke session
3. Verify AUTH_SECRET sama antara server instances (jika multi-server)
```

### 🔄 After Deployment Steps

1. Clear browser cache dan cookies
2. Test login dengan akun demo:
   - Email: `executive@htgroup.id`
   - Password: `executive123`
3. Check Network tab untuk verify cookie set
4. Verify redirect ke dashboard setelah login

### 📞 Support

Jika masih ada masalah setelah mengikuti langkah di atas:
1. Export browser console logs
2. Export Network activity (HAR file)
3. Check server error logs
4. Verify semua environment variables dengan checklist di atas
