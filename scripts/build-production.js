#!/usr/bin/env node

/**
 * Production Build Script
 * Handles Windows-specific build issues and ensures clean production build
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Production Build for HT Group Dashboard\n');

// Set working directory to project root
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

console.log(`📁 Working directory: ${process.cwd()}`);

// Set environment variables for build
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Clean previous build
console.log('🧹 Cleaning previous build...');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ Cleaned .next directory');
  }
} catch (error) {
  console.log('⚠️ Could not clean .next directory:', error.message);
}

// Run TypeScript check first
console.log('\n🔍 Running TypeScript check...');
try {
  execSync('npx tsc --noEmit', { 
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  console.log('✅ TypeScript check passed');
} catch (error) {
  console.error('❌ TypeScript check failed');
  process.exit(1);
}

// Run the build with specific options
console.log('\n🏗️ Building production bundle...');
try {
  execSync('npx next build', { 
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
      NEXT_TELEMETRY_DISABLED: '1',
      // Limit file watching to avoid permission issues
      WATCHPACK_POLLING: 'true'
    }
  });
  console.log('\n✅ Production build completed successfully!');
} catch (error) {
  console.error('\n❌ Production build failed');
  console.error('Error details:', error.message);
  process.exit(1);
}

// Verify build output
console.log('\n📊 Verifying build output...');
const buildDir = path.join(projectRoot, '.next');
if (fs.existsSync(buildDir)) {
  const stats = fs.statSync(buildDir);
  console.log(`✅ Build directory created: ${buildDir}`);
  console.log(`📁 Build size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  // Check for key build files
  const keyFiles = [
    '.next/BUILD_ID',
    '.next/static',
    '.next/server'
  ];
  
  keyFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`⚠️ ${file} missing`);
    }
  });
} else {
  console.error('❌ Build directory not found');
  process.exit(1);
}

console.log('\n🎉 Production build verification complete!');
console.log('\nNext steps:');
console.log('1. Test the build: npm run start');
console.log('2. Deploy to Vercel or your preferred platform');
console.log('3. Configure environment variables for production');

process.exit(0);
