# Safe Production Build Script for Windows
Write-Host "🚀 Starting safe production build..." -ForegroundColor Green

# Set environment variables
$env:NODE_ENV = "production"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NODE_OPTIONS = "--max-old-space-size=4096"

# Clean previous build
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Cleaned .next directory" -ForegroundColor Green
}

# Run TypeScript check
Write-Host "🔍 Running TypeScript check..." -ForegroundColor Yellow
try {
    & npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) {
        throw "TypeScript check failed"
    }
    Write-Host "✅ TypeScript check passed" -ForegroundColor Green
} catch {
    Write-Host "❌ TypeScript check failed: $_" -ForegroundColor Red
    exit 1
}

# Run production build
Write-Host "🏗️ Running production build..." -ForegroundColor Yellow
try {
    & npx next build --no-lint
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "✅ Production build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed: $_" -ForegroundColor Red
    exit 1
}

# Verify build output
Write-Host "📊 Verifying build output..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Write-Host "✅ Build directory created" -ForegroundColor Green
    
    # Check for key files
    $keyFiles = @(".next\BUILD_ID", ".next\static", ".next\server")
    foreach ($file in $keyFiles) {
        if (Test-Path $file) {
            Write-Host "✅ $file exists" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $file missing" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ Build directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Production build verification complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test the build: npm run start" -ForegroundColor White
Write-Host "2. Deploy to Vercel or your preferred platform" -ForegroundColor White
