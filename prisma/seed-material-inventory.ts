import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get PT PKS company
  const company = await prisma.company.findFirst({ where: { name: 'PT Perkebunan Sawit' } })
  if (!company) throw new Error('PT PKS not found')

  // Create Units
  const unitPCS = await prisma.unit.upsert({ where: { code: 'PCS' }, update: {}, create: { code: 'PCS', name: 'PCS' } })
  const unitLITER = await prisma.unit.upsert({ where: { code: 'LITER' }, update: {}, create: { code: 'LITER', name: 'LITER' } })
  const unitSET = await prisma.unit.upsert({ where: { code: 'SET' }, update: {}, create: { code: 'SET', name: 'SET' } })

  // Create Categories
  const catUmum = await prisma.category.upsert({ where: { code: 'UMUM' }, update: {}, create: { code: 'UMUM', name: 'Umum' } })
  const catMaintenance = await prisma.category.upsert({ where: { code: 'MAINTENANCE' }, update: {}, create: { code: 'MAINTENANCE', name: 'Maintenance' } })

  // Create ItemTypes
  const typeMaterial = await prisma.itemType.upsert({ where: { categoryId_code: { categoryId: catUmum.id, code: 'MATERIAL' } }, update: {}, create: { categoryId: catUmum.id, code: 'MATERIAL', name: 'Material' } })
  const typeSparepart = await prisma.itemType.upsert({ where: { categoryId_code: { categoryId: catMaintenance.id, code: 'SPAREPART' } }, update: {}, create: { categoryId: catMaintenance.id, code: 'SPAREPART', name: 'Sparepart' } })
  const typeConsumable = await prisma.itemType.upsert({ where: { categoryId_code: { categoryId: catMaintenance.id, code: 'CONSUMABLE' } }, update: {}, create: { categoryId: catMaintenance.id, code: 'CONSUMABLE', name: 'Consumable' } })

  // Create Warehouses
  const gudangUtama = await prisma.warehouse.upsert({ where: { code: 'PKS-UTAMA' }, update: {}, create: { code: 'PKS-UTAMA', name: 'Gudang Utama', address: 'Jl. PKS No.1', isActive: true } })
  const gudangMaint = await prisma.warehouse.upsert({ where: { code: 'PKS-MAINT' }, update: {}, create: { code: 'PKS-MAINT', name: 'Gudang Maintenance', address: 'Jl. PKS No.2', isActive: true } })

  // Create Items
  const itemBaut = await prisma.item.upsert({ where: { sku: 'BAUT-M8' }, update: {}, create: { sku: 'BAUT-M8', name: 'Baut M8', categoryId: catUmum.id, itemTypeId: typeMaterial.id, baseUnitId: unitPCS.id, isActive: true } })
  const itemOli = await prisma.item.upsert({ where: { sku: 'OLI-MESIN' }, update: {}, create: { sku: 'OLI-MESIN', name: 'Oli Mesin', categoryId: catMaintenance.id, itemTypeId: typeConsumable.id, baseUnitId: unitLITER.id, isActive: true } })
  const itemFilter = await prisma.item.upsert({ where: { sku: 'FILTER-UDARA' }, update: {}, create: { sku: 'FILTER-UDARA', name: 'Filter Udara', categoryId: catMaintenance.id, itemTypeId: typeSparepart.id, baseUnitId: unitSET.id, isActive: true } })

  // Create StockBalance (saldo awal)
  await prisma.stockBalance.upsert({ where: { itemId_warehouseId_binId: { itemId: itemBaut.id, warehouseId: gudangUtama.id, binId: "" } }, update: {}, create: { itemId: itemBaut.id, warehouseId: gudangUtama.id, qtyOnHand: 100, avgCost: 500 } })
  await prisma.stockBalance.upsert({ where: { itemId_warehouseId_binId: { itemId: itemOli.id, warehouseId: gudangUtama.id, binId: "" } }, update: {}, create: { itemId: itemOli.id, warehouseId: gudangUtama.id, qtyOnHand: 50, avgCost: 75000 } })
  await prisma.stockBalance.upsert({ where: { itemId_warehouseId_binId: { itemId: itemFilter.id, warehouseId: gudangMaint.id, binId: "" } }, update: {}, create: { itemId: itemFilter.id, warehouseId: gudangMaint.id, qtyOnHand: 20, avgCost: 120000 } })

  // Create GoodsReceipt (contoh penerimaan barang)
  const receipt = await prisma.goodsReceipt.create({
    data: {
      docNumber: 'GR/PKS/2025/001',
      date: new Date('2025-10-01'),
      warehouseId: gudangUtama.id,
      sourceType: 'PURCHASE',
      note: 'Pembelian material awal',
      glStatus: 'PENDING',
      createdById: 'seed-user',
      lines: {
        create: [
          { itemId: itemBaut.id, unitId: unitPCS.id, qty: 100, unitCost: 500 },
          { itemId: itemOli.id, unitId: unitLITER.id, qty: 50, unitCost: 75000 },
        ]
      }
    }
  })

  // Create GoodsIssue (contoh pengeluaran barang)
  const issue = await prisma.goodsIssue.create({
    data: {
      docNumber: 'GI/PKS/2025/001',
      date: new Date('2025-10-05'),
      warehouseId: gudangUtama.id,
      purpose: 'ISSUE',
      targetDept: 'Produksi',
      pickerName: 'Budi',
      status: 'APPROVED',
      note: 'Pengeluaran untuk produksi',
      createdById: 'seed-user',
      lines: {
        create: [
          { itemId: itemBaut.id, unitId: unitPCS.id, qty: 10 },
          { itemId: itemOli.id, unitId: unitLITER.id, qty: 5 },
        ]
      }
    }
  })

  // Create ItemRequest (contoh permintaan barang)
  await prisma.itemRequest.create({
    data: {
      reqNumber: 'REQ/PKS/2025/001',
      date: new Date('2025-10-03'),
      requestDept: 'Maintenance',
      reason: 'Penggantian filter udara',
      status: 'PENDING',
      createdById: 'seed-user',
      lines: {
        create: [
          { itemId: itemFilter.id, unitId: unitSET.id, qty: 2 },
        ]
      }
    }
  })

  console.log('✅ Seed material & inventory + transaksi gudang selesai!')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
