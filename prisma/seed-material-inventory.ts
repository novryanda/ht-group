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
  const unitKG = await prisma.unit.upsert({ where: { code: 'KG' }, update: {}, create: { code: 'KG', name: 'Kilogram', isBase: true, conversionToBase: 1.0, isActive: true } })

  // Create Categories
  const catUmum = await prisma.category.upsert({ where: { code: 'UMUM' }, update: {}, create: { code: 'UMUM', name: 'Umum' } })
  const catMaintenance = await prisma.category.upsert({ where: { code: 'MAINTENANCE' }, update: {}, create: { code: 'MAINTENANCE', name: 'Maintenance' } })
  const catTBS = await prisma.category.upsert({ where: { code: 'TBS' }, update: {}, create: { code: 'TBS', name: 'Tandan Buah Segar', description: 'Material TBS untuk weighbridge', isActive: true } })

  // Create ItemTypes
  const typeMaterial = await prisma.itemType.upsert({ where: { categoryId_code: { categoryId: catUmum.id, code: 'MATERIAL' } }, update: {}, create: { categoryId: catUmum.id, code: 'MATERIAL', name: 'Material' } })
  const typeSparepart = await prisma.itemType.upsert({ where: { categoryId_code: { categoryId: catMaintenance.id, code: 'SPAREPART' } }, update: {}, create: { categoryId: catMaintenance.id, code: 'SPAREPART', name: 'Sparepart' } })
  const typeConsumable = await prisma.itemType.upsert({ where: { categoryId_code: { categoryId: catMaintenance.id, code: 'CONSUMABLE' } }, update: {}, create: { categoryId: catMaintenance.id, code: 'CONSUMABLE', name: 'Consumable' } })
  const typeTBS = await prisma.itemType.upsert({ where: { categoryId_code: { categoryId: catTBS.id, code: 'TBS' } }, update: {}, create: { categoryId: catTBS.id, code: 'TBS', name: 'TBS', description: 'TBS Material', isActive: true } })

  // Create Warehouses
  const gudangUtama = await prisma.warehouse.upsert({ where: { code: 'PKS-UTAMA' }, update: {}, create: { code: 'PKS-UTAMA', name: 'Gudang Utama', address: 'Jl. PKS No.1', isActive: true } })
  const gudangMaint = await prisma.warehouse.upsert({ where: { code: 'PKS-MAINT' }, update: {}, create: { code: 'PKS-MAINT', name: 'Gudang Maintenance', address: 'Jl. PKS No.2', isActive: true } })

  // Create Items
  const itemBaut = await prisma.item.upsert({ where: { sku: 'BAUT-M8' }, update: {}, create: { sku: 'BAUT-M8', name: 'Baut M8', categoryId: catUmum.id, itemTypeId: typeMaterial.id, baseUnitId: unitPCS.id, isActive: true } })
  const itemOli = await prisma.item.upsert({ where: { sku: 'OLI-MESIN' }, update: {}, create: { sku: 'OLI-MESIN', name: 'Oli Mesin', categoryId: catMaintenance.id, itemTypeId: typeConsumable.id, baseUnitId: unitLITER.id, isActive: true } })
  const itemFilter = await prisma.item.upsert({ where: { sku: 'FILTER-UDARA' }, update: {}, create: { sku: 'FILTER-UDARA', name: 'Filter Udara', categoryId: catMaintenance.id, itemTypeId: typeSparepart.id, baseUnitId: unitSET.id, isActive: true } })
  const itemTBS = await prisma.item.upsert({ where: { sku: 'TBS-001' }, update: {}, create: { sku: 'TBS-001', name: 'Tandan Buah Segar', description: 'Material utama TBS untuk weighbridge', categoryId: catTBS.id, itemTypeId: typeTBS.id, baseUnitId: unitKG.id, valuationMethod: 'AVERAGE', isActive: true } })

  // Create StockBalance (saldo awal)
  await prisma.stockBalance.upsert({ where: { itemId_warehouseId_binId: { itemId: itemBaut.id, warehouseId: gudangUtama.id, binId: "" } }, update: {}, create: { itemId: itemBaut.id, warehouseId: gudangUtama.id, qtyOnHand: 100, avgCost: 500 } })
  await prisma.stockBalance.upsert({ where: { itemId_warehouseId_binId: { itemId: itemOli.id, warehouseId: gudangUtama.id, binId: "" } }, update: {}, create: { itemId: itemOli.id, warehouseId: gudangUtama.id, qtyOnHand: 50, avgCost: 75000 } })
  await prisma.stockBalance.upsert({ where: { itemId_warehouseId_binId: { itemId: itemFilter.id, warehouseId: gudangMaint.id, binId: "" } }, update: {}, create: { itemId: itemFilter.id, warehouseId: gudangMaint.id, qtyOnHand: 20, avgCost: 120000 } })
  await prisma.stockBalance.upsert({ where: { itemId_warehouseId_binId: { itemId: itemTBS.id, warehouseId: gudangUtama.id, binId: "" } }, update: {}, create: { itemId: itemTBS.id, warehouseId: gudangUtama.id, qtyOnHand: 10000, avgCost: 1800 } })


  console.log('✅ Seed material & inventory + transaksi gudang selesai!')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
