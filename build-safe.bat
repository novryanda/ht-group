@echo off
echo Starting safe production build...

REM Set environment variables
set NODE_ENV=production
set NEXT_TELEMETRY_DISABLED=1
set NODE_OPTIONS=--max-old-space-size=4096

REM Clean previous build
if exist .next rmdir /s /q .next

REM Run TypeScript check
echo Running TypeScript check...
npx tsc --noEmit
if %errorlevel% neq 0 (
    echo TypeScript check failed
    exit /b 1
)

REM Run build with limited scope
echo Running production build...
npx next build --no-lint
if %errorlevel% neq 0 (
    echo Build failed
    exit /b 1
)

echo Build completed successfully!
