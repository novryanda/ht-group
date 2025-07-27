# Deployment Guide

## Overview

This guide covers deploying the HT Group Dashboard to various platforms including Vercel, Netlify, and other hosting providers.

## Prerequisites

- GitHub repository with the latest code
- Supabase database configured
- Environment variables ready

## Vercel Deployment (Recommended)

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `novryanda/ht-group`

### 2. Configure Environment Variables
Add these environment variables in Vercel:

```env
DATABASE_URL=postgresql://postgres.fuwsjbapwmqlfhmjooaz:123321@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.fuwsjbapwmqlfhmjooaz:123321@aws-0-us-east-2.pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET=your_production_secret_here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### 3. Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase connection string with pooling | `postgresql://...?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct connection for migrations | `postgresql://...` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js sessions | Random 32+ character string |
| `NEXTAUTH_URL` | Full URL of your deployed app | `https://your-app.vercel.app` |

### Generating NEXTAUTH_SECRET

```bash
# Generate a secure secret
openssl rand -base64 32
```

## Database Setup

### 1. Ensure Supabase is Ready
- Database is accessible from the internet
- Connection strings are correct
- Tables are created (run `npx prisma db push` locally first)

### 2. Seed Production Database (Optional)
```bash
# Set production environment variables locally
export DATABASE_URL="your_production_database_url"
export DIRECT_URL="your_production_direct_url"

# Run seed script
npx prisma db seed
```

## Post-Deployment Checklist

### ✅ Verify Deployment
- [ ] Application loads without errors
- [ ] Login functionality works
- [ ] Database connections are successful
- [ ] Invoice generation works
- [ ] PDF downloads function properly

### ✅ Test User Accounts
Login with test accounts:
- `superadmin@htgroup.com` / `superadmin123`
- `admin@htgroup.com` / `admin123`
- `member@htgroup.com` / `member123`

### ✅ Test Core Features
- [ ] Company navigation
- [ ] Invoice creation (Pengajian, Tagihan)
- [ ] PDF generation and download
- [ ] Role-based access control
- [ ] Dashboard functionality

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Check Supabase instance is running
- Ensure IP restrictions allow Vercel's IPs

#### 2. NextAuth Errors
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Ensure all environment variables are properly set

#### 3. Build Failures
- Check for TypeScript errors
- Verify all dependencies are in `package.json`
- Review build logs for specific errors

#### 4. PDF Generation Issues
- Puppeteer may need additional configuration for serverless
- Check if file system permissions are correct
- Verify upload directories are writable

### Solutions

#### Puppeteer in Serverless Environment
Add to `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core'],
  },
}

module.exports = nextConfig
```

#### File Upload Configuration
Ensure upload directories are handled properly in serverless:
```javascript
// Use temporary directories or cloud storage
const uploadDir = process.env.NODE_ENV === 'production' 
  ? '/tmp/uploads' 
  : './public/uploads'
```

## Performance Optimization

### 1. Database Optimization
- Use connection pooling (already configured)
- Implement proper indexing
- Monitor query performance

### 2. Caching Strategy
- Enable Vercel's edge caching
- Implement API response caching
- Use static generation where possible

### 3. Bundle Optimization
- Analyze bundle size with `npm run analyze`
- Implement code splitting
- Optimize images and assets

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to Git
- Use strong, unique secrets
- Rotate secrets regularly

### 2. Database Security
- Use strong database passwords
- Enable SSL connections
- Implement proper access controls

### 3. Application Security
- Keep dependencies updated
- Implement rate limiting
- Use HTTPS everywhere

## Monitoring and Maintenance

### 1. Application Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor performance metrics
- Track user analytics

### 2. Database Monitoring
- Monitor connection usage
- Track query performance
- Set up backup schedules

### 3. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update Node.js version regularly

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review Supabase connection status
3. Verify environment variables
4. Test locally with production environment variables

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
