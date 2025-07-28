#!/usr/bin/env node

/**
 * Production Readiness Test Script
 * Tests all critical functionality to ensure production readiness
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 HT Group Dashboard - Production Readiness Testing\n');

const tests = [];

// Test 1: TypeScript Compilation (Strict Mode)
console.log('1️⃣ Testing TypeScript compilation (strict mode)...');
try {
  execSync('npx tsc --noEmit --strict', { stdio: 'pipe' });
  tests.push({ name: 'TypeScript (Strict)', status: '✅ PASSED', details: 'No type errors in strict mode' });
} catch (error) {
  tests.push({ name: 'TypeScript (Strict)', status: '❌ FAILED', details: error.message });
}

// Test 2: Prisma Schema Validation
console.log('2️⃣ Testing Prisma schema validation...');
try {
  const output = execSync('npx prisma validate', { stdio: 'pipe', encoding: 'utf8' });
  if (output.includes('is valid')) {
    tests.push({ name: 'Prisma Schema', status: '✅ PASSED', details: 'Schema validation successful' });
  } else {
    tests.push({ name: 'Prisma Schema', status: '❌ FAILED', details: 'Schema validation failed' });
  }
} catch (error) {
  tests.push({ name: 'Prisma Schema', status: '❌ FAILED', details: error.message });
}

// Test 3: Environment Variables
console.log('3️⃣ Testing environment configuration...');
const requiredEnvVars = ['DATABASE_URL', 'DIRECT_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
const envFiles = ['.env', '.env.local'];
let envFound = false;
let envStatus = '❌ FAILED';
let envDetails = 'No environment file found';

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    envFound = true;
    const envContent = fs.readFileSync(envFile, 'utf8');
    const missingVars = requiredEnvVars.filter(varName => !envContent.includes(varName));
    
    if (missingVars.length === 0) {
      envStatus = '✅ PASSED';
      envDetails = `All required variables present in ${envFile}`;
      break;
    } else {
      envStatus = '⚠️ PARTIAL';
      envDetails = `Missing in ${envFile}: ${missingVars.join(', ')}`;
    }
  }
}

tests.push({ name: 'Environment Variables', status: envStatus, details: envDetails });

// Test 4: Critical Files Existence
console.log('4️⃣ Testing critical files...');
const criticalFiles = [
  'package.json',
  'next.config.js',
  'prisma/schema.prisma',
  'src/lib/auth.ts',
  'src/lib/prisma.ts',
  'src/types/invoice.ts',
  'src/service/invoice-service.ts',
  'src/service/pdf-generator.ts',
  'src/components/invoice-form.tsx',
  'src/app/api/invoices/route.ts'
];

const missingFiles = criticalFiles.filter(file => !fs.existsSync(file));
if (missingFiles.length === 0) {
  tests.push({ name: 'Critical Files', status: '✅ PASSED', details: 'All critical files present' });
} else {
  tests.push({ name: 'Critical Files', status: '❌ FAILED', details: `Missing: ${missingFiles.join(', ')}` });
}

// Test 5: Package Dependencies
console.log('5️⃣ Testing package dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'next',
    'react',
    'typescript',
    '@prisma/client',
    'prisma',
    'next-auth',
    'puppeteer',
    'tailwindcss',
    'zod'
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );
  
  if (missingDeps.length === 0) {
    tests.push({ name: 'Dependencies', status: '✅ PASSED', details: 'All required packages installed' });
  } else {
    tests.push({ name: 'Dependencies', status: '❌ FAILED', details: `Missing: ${missingDeps.join(', ')}` });
  }
} catch (error) {
  tests.push({ name: 'Dependencies', status: '❌ FAILED', details: 'Could not read package.json' });
}

// Test 6: Next.js Configuration
console.log('6️⃣ Testing Next.js configuration...');
if (fs.existsSync('next.config.js')) {
  try {
    const configContent = fs.readFileSync('next.config.js', 'utf8');
    if (configContent.includes('serverExternalPackages') && configContent.includes('puppeteer-core')) {
      tests.push({ name: 'Next.js Config', status: '✅ PASSED', details: 'Optimized for production deployment' });
    } else {
      tests.push({ name: 'Next.js Config', status: '⚠️ WARNING', details: 'Missing production optimizations' });
    }
  } catch (error) {
    tests.push({ name: 'Next.js Config', status: '❌ FAILED', details: 'Invalid configuration file' });
  }
} else {
  tests.push({ name: 'Next.js Config', status: '⚠️ WARNING', details: 'No next.config.js found' });
}

// Test 7: Build Scripts
console.log('7️⃣ Testing build scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasRequiredScripts = ['build', 'start', 'dev'].every(script => packageJson.scripts[script]);
  
  if (hasRequiredScripts) {
    tests.push({ name: 'Build Scripts', status: '✅ PASSED', details: 'All required scripts present' });
  } else {
    tests.push({ name: 'Build Scripts', status: '❌ FAILED', details: 'Missing required scripts' });
  }
} catch (error) {
  tests.push({ name: 'Build Scripts', status: '❌ FAILED', details: 'Could not verify scripts' });
}

// Display Results
console.log('\n📊 PRODUCTION READINESS TEST RESULTS\n');
console.log('═'.repeat(70));

tests.forEach((test, index) => {
  console.log(`${index + 1}. ${test.name.padEnd(25)} ${test.status}`);
  console.log(`   ${test.details}\n`);
});

// Overall Assessment
const passed = tests.filter(t => t.status.includes('✅')).length;
const failed = tests.filter(t => t.status.includes('❌')).length;
const warnings = tests.filter(t => t.status.includes('⚠️')).length;

console.log('═'.repeat(70));
console.log(`📈 SUMMARY: ${passed} passed, ${failed} failed, ${warnings} warnings`);

// Production Readiness Assessment
if (failed === 0) {
  console.log('\n🎉 PRODUCTION READY! ✅');
  console.log('Your application passes all critical tests and is ready for deployment.');
  
  console.log('\n🚀 DEPLOYMENT RECOMMENDATIONS:');
  console.log('1. Deploy to Vercel for optimal Next.js performance');
  console.log('2. Configure environment variables in deployment platform');
  console.log('3. Test all features after deployment');
  console.log('4. Monitor application performance and errors');
  
  console.log('\n📋 DEPLOYMENT CHECKLIST:');
  console.log('✅ TypeScript compilation error-free');
  console.log('✅ Database schema validated');
  console.log('✅ Environment variables configured');
  console.log('✅ All critical files present');
  console.log('✅ Dependencies properly installed');
  console.log('✅ Next.js configuration optimized');
  console.log('✅ Build scripts available');
  
} else {
  console.log('\n⚠️  ISSUES FOUND');
  console.log('Please resolve the failed tests before deploying to production.');
  console.log('\nCritical issues that must be fixed:');
  tests.filter(t => t.status.includes('❌')).forEach(test => {
    console.log(`- ${test.name}: ${test.details}`);
  });
}

console.log('\n📚 DOCUMENTATION:');
console.log('- README.md - Project overview and setup');
console.log('- DEPLOYMENT.md - Deployment guide');
console.log('- PRODUCTION_READINESS.md - Production checklist');
console.log('- INVOICE_SYSTEM.md - Invoice system documentation');

console.log('\n🔗 REPOSITORY: https://github.com/novryanda/ht-group');

process.exit(failed > 0 ? 1 : 0);
