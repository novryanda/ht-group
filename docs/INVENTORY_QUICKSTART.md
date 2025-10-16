# Material & Inventory Module - Quick Start Guide

## 🚀 Setup & Installation

### 1. Database Migration

```bash
# Validate Prisma schema
npx prisma validate

# Push schema to database (development)
npx prisma db push

# Or create migration (production)
npx prisma migrate dev --name add_inventory_module

# Generate Prisma Client
npx prisma generate
```

### 2. Verify Installation

Check that all tables are created:
- Uom
- UomConversion
- MaterialCategory
- Material
- Warehouse
- Location
- Stock
- StockLedger
- GoodsReceipt, GoodsReceiptItem
- GoodsIssue, GoodsIssueItem
- StockTransfer
- StockAdjustment, StockAdjustmentItem
- StockCount, StockCountLine

### 3. Seed Initial Data (Optional)

Create seed file `prisma/seed-inventory.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed UoMs
  await prisma.uom.createMany({
    data: [
      { code: "KG", name: "Kilogram", description: "Satuan berat" },
      { code: "LTR", name: "Liter", description: "Satuan volume" },
      { code: "PCS", name: "Pieces", description: "Satuan unit" },
      { code: "BOX", name: "Box", description: "Satuan kemasan" },
    ],
    skipDuplicates: true,
  });

  // Seed Categories
  await prisma.materialCategory.createMany({
    data: [
      { code: "RAW", name: "Raw Material", description: "Bahan baku" },
      { code: "PKG", name: "Packaging", description: "Bahan kemasan" },
      { code: "CHEM", name: "Chemical", description: "Bahan kimia" },
      { code: "SPARE", name: "Spare Parts", description: "Suku cadang" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx tsx prisma/seed-inventory.ts
```

## 📋 Usage Flow

### Step 1: Setup Master Data

1. **Create UoMs** (if not seeded)
   - Navigate to `/dashboard/pt-pks/datamaster/material-inventory/uom`
   - Click "Tambah" and create: KG, LTR, PCS, etc.

2. **Create Categories**
   - Navigate to `/dashboard/pt-pks/datamaster/material-inventory/categories`
   - Create categories: Raw Material, Packaging, etc.

3. **Create Warehouses**
   - Navigate to `/dashboard/pt-pks/datamaster/material-inventory/warehouses`
   - Example: WH-01 "Gudang Utama"

4. **Create Locations**
   - Navigate to `/dashboard/pt-pks/datamaster/material-inventory/locations`
   - Create hierarchy:
     - ZONE-A (type: ZONE)
     - RACK-A1 (type: RACK, parent: ZONE-A)
     - BIN-A1-01 (type: BIN, parent: RACK-A1)

5. **Create Materials**
   - Navigate to `/dashboard/pt-pks/datamaster/material-inventory/materials`
   - Fill: Code, Name, Category, Base UoM, Min/Max Stock
   - Example: MAT-001 "CPO (Crude Palm Oil)", Category: Raw Material, UoM: KG

### Step 2: Input Opening Balance

1. Navigate to `/dashboard/pt-pks/datamaster/material-inventory/opening-balance`
2. Add lines for each material-location combination
3. Enter opening quantity
4. Click "Post" - stock will be created with ledger type IN_OPENING

### Step 3: Daily Transactions

**Goods Receipt (Penerimaan Barang):**
1. Navigate to `/dashboard/pt-pks/datamaster/material-inventory/grn`
2. Click "Buat GRN"
3. Select warehouse, date
4. Add items: material, location, qty, UoM
5. Click "Simpan & Posting"
6. ✅ Stock automatically increased, ledger IN_GRN created

**Goods Issue (Pengeluaran Barang):**
1. Navigate to `/dashboard/pt-pks/datamaster/material-inventory/issue`
2. Click "Buat Issue"
3. Select warehouse, date, purpose
4. Add items: material, location, qty
5. Click "Simpan & Posting"
6. ✅ Stock automatically decreased, ledger OUT_ISSUE created
7. ⚠️ Error if insufficient stock

**Stock Transfer:**
1. Navigate to `/dashboard/pt-pks/datamaster/material-inventory/transfer`
2. Select material, from location, to location, qty
3. Click "Posting"
4. ✅ Stock moved, 2 ledgers created (OUT_TRANSFER + IN_TRANSFER)

**Stock Adjustment:**
1. Navigate to `/dashboard/pt-pks/datamaster/material-inventory/adjustment`
2. Add items with qty difference (positive = increase, negative = decrease)
3. Click "Posting"
4. ✅ Stock adjusted, ledger IN/OUT_ADJUSTMENT created

**Stock Count (Opname):**
1. Navigate to `/dashboard/pt-pks/datamaster/material-inventory/stock-count`
2. Click "Buat Stock Count"
3. Add lines: material, location, system qty (auto-filled), counted qty
4. Save as OPEN status
5. After verification, click "Post"
6. ✅ Differences posted as COUNT_DIFF_IN/OUT ledgers

### Step 4: View Reports

**Stock Report:**
- Navigate to `/dashboard/pt-pks/datamaster/material-inventory/stock`
- View current stock position per material-location
- See low stock alerts (qty < minStock)
- Export to Excel

**Stock Ledger (Kartu Stok):**
- Navigate to `/dashboard/pt-pks/datamaster/material-inventory/ledger`
- Filter by material, location, date range
- View all movements with before/after quantities
- Verify stock accuracy

## 🔧 API Testing

### Using Thunder Client / Postman

**1. Get Auth Token:**
Login via NextAuth and get session cookie.

**2. Test Endpoints:**

```bash
# List Materials
GET http://localhost:3000/api/inventory/materials?page=1&pageSize=20

# Create Material
POST http://localhost:3000/api/inventory/materials
Content-Type: application/json

{
  "code": "MAT-001",
  "name": "CPO",
  "categoryId": "clxxx...",
  "baseUomId": "clyyy...",
  "minStock": 100,
  "maxStock": 1000,
  "isActive": true
}

# Create GRN
POST http://localhost:3000/api/inventory/grn
Content-Type: application/json

{
  "warehouseId": "clzzz...",
  "date": "2025-10-15",
  "note": "Penerimaan dari supplier",
  "items": [
    {
      "materialId": "clxxx...",
      "locationId": "claaa...",
      "qty": 500,
      "uomId": "clbbb...",
      "note": "Batch A"
    }
  ]
}

# Get Stock Report
GET http://localhost:3000/api/inventory/stock?page=1&pageSize=50
```

## 🐛 Troubleshooting

### Issue: "STOCK_INSUFFICIENT" error
**Solution:** Check current stock before issuing. Use Stock Report to verify available quantity.

### Issue: "MATERIAL_INACTIVE" error
**Solution:** Ensure material is set to active in Material master data.

### Issue: "LOCATION_NOT_FOUND" error
**Solution:** Create location first in Location master data.

### Issue: Document number not auto-incrementing
**Solution:** Check `codegen.ts` implementation. Ensure `getLastXXXNoForMonth()` is working.

### Issue: Stock ledger beforeQty/afterQty mismatch
**Solution:** This indicates a transaction failed mid-way. Check Prisma transaction logs. All stock operations must be atomic.

### Issue: TypeScript errors in components
**Solution:** Run `npm run typecheck` to see all errors. Ensure all DTOs are properly imported from `~/server/types/inventory`.

## 📊 Performance Tips

1. **Add Database Indexes:**
```sql
CREATE INDEX idx_stock_material ON "Stock"("materialId");
CREATE INDEX idx_stock_location ON "Stock"("locationId");
CREATE INDEX idx_ledger_material ON "StockLedger"("materialId");
CREATE INDEX idx_ledger_date ON "StockLedger"("createdAt");
CREATE INDEX idx_grn_date ON "GoodsReceipt"("date");
```

2. **Pagination:** Always use pagination for large datasets (default pageSize: 20-50)

3. **Lazy Loading:** Use React Query's `enabled` option to defer non-critical queries

4. **Debounce Search:** Implement debounce on search inputs (300ms)

## 🔐 Security Checklist

- [x] All API routes check authentication (`await auth()`)
- [x] Write operations check authorization (UNIT_SUPERVISOR, PT_PKS_ADMIN, etc.)
- [x] Input validation with Zod schemas
- [x] SQL injection prevented by Prisma ORM
- [x] XSS prevented by React's auto-escaping
- [x] CSRF protection via NextAuth

## 📝 Next Development Tasks

See `docs/INVENTORY_MODULE.md` for full list of future enhancements:
- Integration with Purchasing module
- Barcode/QR code scanning
- Batch/Serial number tracking
- Expiry date management
- Advanced analytics dashboard

## 🆘 Support

For issues or questions:
1. Check `docs/INVENTORY_MODULE.md` for detailed documentation
2. Review Prisma schema in `prisma/schema.prisma`
3. Check service layer business logic in `src/server/services/`
4. Review API error responses for specific error codes

---

**Happy Coding! 🎉**

