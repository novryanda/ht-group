# PowerShell script to fix Next.js 15 async params in route files

$files = @(
    "src/app/api/inventory/locations/[id]/route.ts",
    "src/app/api/inventory/materials/[id]/route.ts",
    "src/app/api/inventory/uom/[id]/route.ts",
    "src/app/api/inventory/warehouses/[id]/route.ts",
    "src/app/api/inventory/stock-count/[id]/post/route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        
        $content = Get-Content $file -Raw
        
        # Replace params type from { id: string } to Promise<{ id: string }>
        $content = $content -replace '\{ params \}: \{ params: \{ id: string \} \}', '{ params }: { params: Promise<{ id: string }> }'
        
        # Add await params destructuring after auth check
        # Pattern: const result = await SomeAPI.someMethod(params.id);
        # Replace with: const { id } = await params; const result = await SomeAPI.someMethod(id);
        
        # For GET, PATCH, DELETE, POST methods
        $content = $content -replace '(\s+)(const result = await \w+\.\w+\()params\.id', '$1const { id } = await params;$1$2id'
        
        Set-Content $file $content -NoNewline
        Write-Host "Fixed: $file"
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "Done!"

