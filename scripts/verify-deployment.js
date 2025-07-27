#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Verifies that the application is ready for production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 HT Group Dashboard - Production Deployment Verification\n');

const checks = [];

// Check 1: TypeScript Compilation
console.log('1️⃣ Checking TypeScript compilation...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  checks.push({ name: 'TypeScript', status: '✅ PASSED', details: 'No type errors found' });
} catch (error) {
  checks.push({ name: 'TypeScript', status: '❌ FAILED', details: error.message });
}

// Check 2: Environment Variables
console.log('2️⃣ Checking environment configuration...');
const requiredEnvVars = ['DATABASE_URL', 'DIRECT_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
const envFile = path.join(process.cwd(), '.env');
let envStatus = '✅ PASSED';
let envDetails = 'All required variables present';

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = requiredEnvVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length > 0) {
    envStatus = '❌ FAILED';
    envDetails = `Missing variables: ${missingVars.join(', ')}`;
  }
} else {
  envStatus = '⚠️ WARNING';
  envDetails = '.env file not found (use .env.example as template)';
}

checks.push({ name: 'Environment Variables', status: envStatus, details: envDetails });

// Check 3: Database Schema
console.log('3️⃣ Checking database schema...');
try {
  const schemaCheck = execSync('npx prisma validate', { stdio: 'pipe', encoding: 'utf8' });
  checks.push({ name: 'Database Schema', status: '✅ PASSED', details: 'Prisma schema is valid' });
} catch (error) {
  checks.push({ name: 'Database Schema', status: '❌ FAILED', details: 'Schema validation failed' });
}

// Check 4: Dependencies
console.log('4️⃣ Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasRequiredDeps = [
    'next',
    'react',
    'prisma',
    '@prisma/client',
    'next-auth',
    'puppeteer'
  ].every(dep => 
    packageJson.dependencies[dep] || packageJson.devDependencies[dep]
  );
  
  if (hasRequiredDeps) {
    checks.push({ name: 'Dependencies', status: '✅ PASSED', details: 'All required packages installed' });
  } else {
    checks.push({ name: 'Dependencies', status: '❌ FAILED', details: 'Missing required dependencies' });
  }
} catch (error) {
  checks.push({ name: 'Dependencies', status: '❌ FAILED', details: 'Could not read package.json' });
}

// Check 5: Next.js Configuration
console.log('5️⃣ Checking Next.js configuration...');
const nextConfigExists = fs.existsSync('next.config.js');
if (nextConfigExists) {
  checks.push({ name: 'Next.js Config', status: '✅ PASSED', details: 'Configuration file present' });
} else {
  checks.push({ name: 'Next.js Config', status: '⚠️ WARNING', details: 'No next.config.js found' });
}

// Check 6: Required Files
console.log('6️⃣ Checking required files...');
const requiredFiles = [
  'prisma/schema.prisma',
  'src/lib/auth.ts',
  'src/lib/prisma.ts',
  'src/types/invoice.ts',
  'src/service/invoice-service.ts',
  'src/service/pdf-generator.ts'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
if (missingFiles.length === 0) {
  checks.push({ name: 'Required Files', status: '✅ PASSED', details: 'All core files present' });
} else {
  checks.push({ name: 'Required Files', status: '❌ FAILED', details: `Missing: ${missingFiles.join(', ')}` });
}

// Display Results
console.log('\n📊 VERIFICATION RESULTS\n');
console.log('═'.repeat(60));

checks.forEach((check, index) => {
  console.log(`${index + 1}. ${check.name.padEnd(20)} ${check.status}`);
  console.log(`   ${check.details}\n`);
});

// Overall Status
const passed = checks.filter(c => c.status.includes('✅')).length;
const failed = checks.filter(c => c.status.includes('❌')).length;
const warnings = checks.filter(c => c.status.includes('⚠️')).length;

console.log('═'.repeat(60));
console.log(`📈 SUMMARY: ${passed} passed, ${failed} failed, ${warnings} warnings`);

if (failed === 0) {
  console.log('\n🎉 PRODUCTION READY! ✅');
  console.log('Your application is ready for deployment to Vercel or other platforms.');
  console.log('\nNext steps:');
  console.log('1. Push code to GitHub');
  console.log('2. Connect repository to Vercel');
  console.log('3. Configure environment variables');
  console.log('4. Deploy!');
} else {
  console.log('\n⚠️  ISSUES FOUND');
  console.log('Please resolve the failed checks before deploying to production.');
}

console.log('\n📚 Documentation:');
console.log('- README.md - Project overview and setup');
console.log('- DEPLOYMENT.md - Deployment guide');
console.log('- PRODUCTION_READINESS.md - Production checklist');

process.exit(failed > 0 ? 1 : 0);
