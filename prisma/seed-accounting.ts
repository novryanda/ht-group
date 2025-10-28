import { PrismaClient, AccountClass, NormalSide, TaxCode, SystemAccountKey, RecordStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('💰 Starting accounting data seeding...')

  // Get PT PKS company
  const ptPks = await prisma.company.findFirst({
    where: { name: 'PT Perkebunan Sawit' }
  })

  if (!ptPks) {
    console.error('❌ PT Perkebunan Sawit not found! Please run seed.ts first.')
    return
  }

  console.log(`✅ Found company: ${ptPks.name}`)

  // Create fiscal period for 2025
  console.log('📅 Creating fiscal periods for 2025...')
  const fiscalPeriods = []
  
  for (let month = 1; month <= 12; month++) {
    const startDate = new Date(2025, month - 1, 1)
    const endDate = new Date(2025, month, 0, 23, 59, 59)
    
    const period = await prisma.fiscalPeriod.upsert({
      where: {
        companyId_year_month: {
          companyId: ptPks.id,
          year: 2025,
          month: month
        }
      },
      update: {},
      create: {
        companyId: ptPks.id,
        year: 2025,
        month: month,
        startDate: startDate,
        endDate: endDate,
        isClosed: month < 10 // Close periods before October
      }
    })
    fiscalPeriods.push(period)
  }
  
  console.log(`✅ Created ${fiscalPeriods.length} fiscal periods`)

  // Create Chart of Accounts
  console.log('📊 Creating Chart of Accounts...')

  const accounts = [
    // === ASSET (1-xxxx) ===
    { code: '1-0000', name: 'AKTIVA', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false },
    
    // Current Assets
    { code: '1-1000', name: 'AKTIVA LANCAR', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false, parentCode: '1-0000' },
    { code: '1-1100', name: 'Kas dan Bank', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false, parentCode: '1-1000' },
    { code: '1-1101', name: 'Kas Kecil', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: true, parentCode: '1-1100', taxCode: TaxCode.NON_TAX },
    { code: '1-1102', name: 'Bank Mandiri - Operasional', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: true, parentCode: '1-1100', taxCode: TaxCode.NON_TAX },
    { code: '1-1103', name: 'Bank BCA - Payroll', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: true, parentCode: '1-1100', taxCode: TaxCode.NON_TAX },
    
    { code: '1-1200', name: 'Piutang', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false, parentCode: '1-1000' },
    { code: '1-1201', name: 'Piutang Dagang - CPO', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-1200' },
    { code: '1-1202', name: 'Piutang Dagang - Kernel', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-1200' },
    { code: '1-1203', name: 'Piutang Karyawan', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-1200' },
    
    { code: '1-1300', name: 'Persediaan', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false, parentCode: '1-1000' },
    { code: '1-1301', name: 'Persediaan TBS', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-1300' },
    { code: '1-1302', name: 'Persediaan CPO', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-1300' },
    { code: '1-1303', name: 'Persediaan Kernel', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-1300' },
    { code: '1-1304', name: 'Persediaan Material', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-1300' },
    { code: '1-1305', name: 'Persediaan Material Dipinjamkan', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-1300' },
    
    { code: '1-1400', name: 'Uang Muka & Biaya Dibayar Dimuka', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false, parentCode: '1-1000' },
    { code: '1-1401', name: 'Uang Muka Pembelian', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-1400' },
    { code: '1-1402', name: 'PPN Masukan', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-1400', taxCode: TaxCode.PPN_MASUKAN },
    { code: '1-1403', name: 'PPh 22 Dibayar Dimuka', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-1400', taxCode: TaxCode.PPH22 },
    { code: '1-1404', name: 'PPh 23 Dibayar Dimuka', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-1400', taxCode: TaxCode.PPH23 },
    
    // Fixed Assets
    { code: '1-2000', name: 'AKTIVA TETAP', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false, parentCode: '1-0000' },
    { code: '1-2100', name: 'Tanah', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-2000' },
    { code: '1-2200', name: 'Bangunan', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-2000' },
    { code: '1-2201', name: 'Akumulasi Penyusutan Bangunan', class: AccountClass.ASSET, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '1-2000' },
    { code: '1-2300', name: 'Mesin dan Peralatan', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-2000' },
    { code: '1-2301', name: 'Akumulasi Penyusutan Mesin', class: AccountClass.ASSET, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '1-2000' },
    { code: '1-2400', name: 'Kendaraan', class: AccountClass.ASSET, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '1-2000' },
    { code: '1-2401', name: 'Akumulasi Penyusutan Kendaraan', class: AccountClass.ASSET, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '1-2000' },

    // === LIABILITY (2-xxxx) ===
    { code: '2-0000', name: 'KEWAJIBAN', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: false, isCashBank: false },
    
    // Current Liabilities
    { code: '2-1000', name: 'KEWAJIBAN LANCAR', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: false, isCashBank: false, parentCode: '2-0000' },
    { code: '2-1100', name: 'Hutang Dagang', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: false, isCashBank: false, parentCode: '2-1000' },
    { code: '2-1101', name: 'Hutang Supplier TBS', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '2-1100' },
    { code: '2-1102', name: 'Hutang Supplier Material', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '2-1100' },
    
    { code: '2-1200', name: 'Hutang Pajak', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: false, isCashBank: false, parentCode: '2-1000' },
    { code: '2-1201', name: 'PPN Keluaran', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '2-1200', taxCode: TaxCode.PPN_KELUARAN },
    { code: '2-1202', name: 'PPh 21 Terutang', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '2-1200', taxCode: TaxCode.PPH21 },
    { code: '2-1203', name: 'PPh 23 Terutang', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '2-1200', taxCode: TaxCode.PPH23 },
    
    { code: '2-1300', name: 'Hutang Lain-lain', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: false, isCashBank: false, parentCode: '2-1000' },
    { code: '2-1301', name: 'Hutang Gaji', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '2-1300' },
    { code: '2-1302', name: 'Hutang BPJS', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '2-1300' },
    
    // Long-term Liabilities
    { code: '2-2000', name: 'KEWAJIBAN JANGKA PANJANG', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: false, isCashBank: false, parentCode: '2-0000' },
    { code: '2-2100', name: 'Hutang Bank Jangka Panjang', class: AccountClass.LIABILITY, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '2-2000' },

    // === EQUITY (3-xxxx) ===
    { code: '3-0000', name: 'EKUITAS', class: AccountClass.EQUITY, normalSide: NormalSide.CREDIT, isPosting: false, isCashBank: false },
    { code: '3-1000', name: 'Modal Disetor', class: AccountClass.EQUITY, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '3-0000' },
    { code: '3-2000', name: 'Laba Ditahan', class: AccountClass.EQUITY, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '3-0000' },
    { code: '3-3000', name: 'Laba Tahun Berjalan', class: AccountClass.EQUITY, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '3-0000' },

    // === REVENUE (4-xxxx) ===
    { code: '4-0000', name: 'PENDAPATAN', class: AccountClass.REVENUE, normalSide: NormalSide.CREDIT, isPosting: false, isCashBank: false },
    { code: '4-1000', name: 'Pendapatan Penjualan', class: AccountClass.REVENUE, normalSide: NormalSide.CREDIT, isPosting: false, isCashBank: false, parentCode: '4-0000' },
    { code: '4-1001', name: 'Penjualan CPO', class: AccountClass.REVENUE, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '4-1000', taxCode: TaxCode.PPN_KELUARAN },
    { code: '4-1002', name: 'Penjualan Kernel', class: AccountClass.REVENUE, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '4-1000', taxCode: TaxCode.PPN_KELUARAN },
    { code: '4-1003', name: 'Penjualan PKO', class: AccountClass.REVENUE, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '4-1000', taxCode: TaxCode.PPN_KELUARAN },

    // === COGS (5-xxxx) ===
    { code: '5-0000', name: 'BEBAN POKOK PENJUALAN', class: AccountClass.COGS, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false },
    { code: '5-1000', name: 'HPP CPO', class: AccountClass.COGS, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '5-0000' },
    { code: '5-2000', name: 'HPP Kernel', class: AccountClass.COGS, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '5-0000' },
    
    // === EXPENSE (6-xxxx) ===
    { code: '6-0000', name: 'BEBAN OPERASIONAL', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false },
    
    // Production Expenses
    { code: '6-1000', name: 'Biaya Produksi', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false, parentCode: '6-0000' },
    { code: '6-1001', name: 'Biaya Pembelian TBS', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-1000' },
    { code: '6-1002', name: 'Biaya Bongkar SPTI', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-1000' },
    { code: '6-1003', name: 'Biaya Bongkar SPLO', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-1000' },
    { code: '6-1004', name: 'Biaya Konsumsi Material Produksi', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-1000' },
    { code: '6-1005', name: 'Biaya Tenaga Kerja Langsung', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-1000' },
    { code: '6-1006', name: 'Biaya Listrik Produksi', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-1000' },
    
    // Maintenance Expenses
    { code: '6-2000', name: 'Biaya Pemeliharaan', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false, parentCode: '6-0000' },
    { code: '6-2001', name: 'Biaya Pemeliharaan Mesin', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-2000' },
    { code: '6-2002', name: 'Biaya Pemeliharaan Kendaraan', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-2000' },
    { code: '6-2003', name: 'Biaya Pemeliharaan Bangunan', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-2000' },
    { code: '6-2004', name: 'Biaya Material Pemeliharaan', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-2000' },
    
    // General & Administrative
    { code: '6-3000', name: 'Biaya Umum & Administrasi', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false, parentCode: '6-0000' },
    { code: '6-3001', name: 'Gaji Karyawan', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-3000' },
    { code: '6-3002', name: 'BPJS Perusahaan', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-3000' },
    { code: '6-3003', name: 'Biaya Perjalanan Dinas', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-3000' },
    { code: '6-3004', name: 'Biaya Listrik Kantor', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-3000' },
    { code: '6-3005', name: 'Biaya Telepon & Internet', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-3000' },
    { code: '6-3006', name: 'Biaya ATK', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-3000' },
    { code: '6-3007', name: 'Biaya Penyusutan', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-3000' },
    
    // Selling Expenses
    { code: '6-4000', name: 'Biaya Penjualan', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false, parentCode: '6-0000' },
    { code: '6-4001', name: 'Biaya Komisi Penjualan', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-4000' },
    { code: '6-4002', name: 'Biaya Pengiriman', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-4000' },
    
    // Loss on inventory
    { code: '6-5000', name: 'Biaya Lain-lain', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false, parentCode: '6-0000' },
    { code: '6-5001', name: 'Kerugian Penyusutan Persediaan', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-5000' },
    { code: '6-5002', name: 'Biaya Administrasi Bank', class: AccountClass.EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '6-5000' },

    // === OTHER INCOME (7-xxxx) ===
    { code: '7-0000', name: 'PENDAPATAN LAIN-LAIN', class: AccountClass.OTHER_INCOME, normalSide: NormalSide.CREDIT, isPosting: false, isCashBank: false },
    { code: '7-1000', name: 'Pendapatan Bunga Bank', class: AccountClass.OTHER_INCOME, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '7-0000' },
    { code: '7-2000', name: 'Pendapatan Sewa', class: AccountClass.OTHER_INCOME, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '7-0000' },
    { code: '7-3000', name: 'Lain-lain', class: AccountClass.OTHER_INCOME, normalSide: NormalSide.CREDIT, isPosting: true, isCashBank: false, parentCode: '7-0000' },

    // === OTHER EXPENSE (8-xxxx) ===
    { code: '8-0000', name: 'BEBAN LAIN-LAIN', class: AccountClass.OTHER_EXPENSE, normalSide: NormalSide.DEBIT, isPosting: false, isCashBank: false },
    { code: '8-1000', name: 'Beban Bunga Bank', class: AccountClass.OTHER_EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '8-0000' },
    { code: '8-2000', name: 'Beban Denda', class: AccountClass.OTHER_EXPENSE, normalSide: NormalSide.DEBIT, isPosting: true, isCashBank: false, parentCode: '8-0000' },
  ]

  const createdAccounts = new Map<string, any>()

  // Create accounts in order (parents first)
  for (const acc of accounts) {
    const parentId = acc.parentCode ? createdAccounts.get(acc.parentCode)?.id : null
    
    const account = await prisma.account.upsert({
      where: {
        companyId_code: {
          companyId: ptPks.id,
          code: acc.code
        }
      },
      update: {},
      create: {
        companyId: ptPks.id,
        code: acc.code,
        name: acc.name,
        class: acc.class,
        normalSide: acc.normalSide,
        isPosting: acc.isPosting,
        isCashBank: acc.isCashBank,
        taxCode: acc.taxCode || TaxCode.NON_TAX,
        status: RecordStatus.AKTIF,
        parentId: parentId,
      }
    })
    
    createdAccounts.set(acc.code, account)
  }

  console.log(`✅ Created ${createdAccounts.size} accounts`)

  // Create System Account Mappings
  console.log('🔗 Creating system account mappings...')

  const systemMappings = [
    { key: SystemAccountKey.TBS_PURCHASE, code: '6-1001' },
    { key: SystemAccountKey.INVENTORY_TBS, code: '1-1301' },
    { key: SystemAccountKey.AP_SUPPLIER_TBS, code: '2-1101' },
    { key: SystemAccountKey.UNLOADING_EXPENSE_SPTI, code: '6-1002' },
    { key: SystemAccountKey.UNLOADING_EXPENSE_SPLO, code: '6-1003' },
    { key: SystemAccountKey.SALES_CPO, code: '4-1001' },
    { key: SystemAccountKey.SALES_KERNEL, code: '4-1002' },
    { key: SystemAccountKey.INVENTORY_CPO, code: '1-1302' },
    { key: SystemAccountKey.INVENTORY_KERNEL, code: '1-1303' },
    { key: SystemAccountKey.INVENTORY_GENERAL, code: '1-1304' },
    { key: SystemAccountKey.COGS_CPO, code: '5-1000' },
    { key: SystemAccountKey.COGS_KERNEL, code: '5-2000' },
    { key: SystemAccountKey.CASH_DEFAULT, code: '1-1101' },
    { key: SystemAccountKey.BANK_DEFAULT, code: '1-1102' },
    { key: SystemAccountKey.PPN_KELUARAN, code: '2-1201' },
    { key: SystemAccountKey.PPN_MASUKAN, code: '1-1402' },
    { key: SystemAccountKey.PPH22_DEFAULT, code: '1-1403' },
    { key: SystemAccountKey.PPH23_DEFAULT, code: '1-1404' },
    { key: SystemAccountKey.INVENTORY_ON_LOAN, code: '1-1305' },
    { key: SystemAccountKey.INVENTORY_ADJUSTMENT_LOSS, code: '6-5001' },
    { key: SystemAccountKey.PRODUCTION_CONSUMPTION, code: '6-1004' },
    { key: SystemAccountKey.MAINTENANCE_EXPENSE_DEFAULT, code: '6-2004' },
  ]

  for (const mapping of systemMappings) {
    const account = createdAccounts.get(mapping.code)
    if (account) {
      await prisma.systemAccountMap.upsert({
        where: {
          companyId_key: {
            companyId: ptPks.id,
            key: mapping.key
          }
        },
        update: {},
        create: {
          companyId: ptPks.id,
          key: mapping.key,
          accountId: account.id
        }
      })
    }
  }

  console.log(`✅ Created ${systemMappings.length} system account mappings`)

  // Create Opening Balances for October 2025
  console.log('💵 Creating opening balances for October 2025...')

  const octoberPeriod = fiscalPeriods.find(p => p.month === 10)
  
  if (octoberPeriod) {
    const openingBalances = [
      // Assets
      { code: '1-1101', debit: 5000000, credit: 0 }, // Kas Kecil
      { code: '1-1102', debit: 250000000, credit: 0 }, // Bank Mandiri
      { code: '1-1103', debit: 150000000, credit: 0 }, // Bank BCA
      { code: '1-1301', debit: 80000000, credit: 0 }, // Persediaan TBS
      { code: '1-1302', debit: 500000000, credit: 0 }, // Persediaan CPO
      { code: '1-1303', debit: 150000000, credit: 0 }, // Persediaan Kernel
      { code: '1-1304', debit: 75000000, credit: 0 }, // Persediaan Material
      { code: '1-2100', debit: 2000000000, credit: 0 }, // Tanah
      { code: '1-2200', debit: 3000000000, credit: 0 }, // Bangunan
      { code: '1-2201', debit: 0, credit: 300000000 }, // Akum Penyusutan Bangunan
      { code: '1-2300', debit: 5000000000, credit: 0 }, // Mesin
      { code: '1-2301', debit: 0, credit: 1500000000 }, // Akum Penyusutan Mesin
      { code: '1-2400', debit: 500000000, credit: 0 }, // Kendaraan
      { code: '1-2401', debit: 0, credit: 150000000 }, // Akum Penyusutan Kendaraan
      
      // Liabilities
      { code: '2-1101', debit: 0, credit: 120000000 }, // Hutang Supplier TBS
      { code: '2-1102', debit: 0, credit: 45000000 }, // Hutang Supplier Material
      { code: '2-2100', debit: 0, credit: 2000000000 }, // Hutang Bank JP
      
      // Equity
      { code: '3-1000', debit: 0, credit: 5000000000 }, // Modal Disetor
      { code: '3-2000', debit: 0, credit: 2335000000 }, // Laba Ditahan
    ]

    for (const ob of openingBalances) {
      const account = createdAccounts.get(ob.code)
      if (account) {
        await prisma.openingBalance.upsert({
          where: {
            companyId_periodId_accountId: {
              companyId: ptPks.id,
              periodId: octoberPeriod.id,
              accountId: account.id
            }
          },
          update: {},
          create: {
            companyId: ptPks.id,
            periodId: octoberPeriod.id,
            accountId: account.id,
            debit: ob.debit,
            credit: ob.credit
          }
        })
      }
    }

    console.log(`✅ Created ${openingBalances.length} opening balances`)
  }

  // Create Journal Entries for October 2025
  console.log('📝 Creating sample journal entries...')

  const journalEntries = []

  // Entry 1: Pembelian TBS (Oct 5, 2025)
  const entry1 = await prisma.journalEntry.create({
    data: {
      companyId: ptPks.id,
      entryNumber: 'JU-2025-10-001',
      date: new Date('2025-10-05'),
      sourceType: 'Manual',
      memo: 'Pembelian TBS dari Supplier - Periode Oktober Minggu 1',
      status: 'POSTED',
      postedAt: new Date('2025-10-05'),
      createdById: 'system',
      lines: {
        create: [
          {
            accountId: createdAccounts.get('1-1301')!.id, // Persediaan TBS
            debit: 85000000,
            credit: 0,
            description: 'Pembelian TBS 42.5 ton @ Rp 2,000,000/ton'
          },
          {
            accountId: createdAccounts.get('2-1101')!.id, // Hutang Supplier TBS
            debit: 0,
            credit: 85000000,
            description: 'Hutang kepada supplier TBS'
          }
        ]
      }
    }
  })
  journalEntries.push(entry1)

  // Entry 2: Pembayaran Hutang Supplier (Oct 10, 2025)
  const entry2 = await prisma.journalEntry.create({
    data: {
      companyId: ptPks.id,
      entryNumber: 'JU-2025-10-002',
      date: new Date('2025-10-10'),
      sourceType: 'Manual',
      memo: 'Pelunasan hutang supplier TBS',
      status: 'POSTED',
      postedAt: new Date('2025-10-10'),
      createdById: 'system',
      lines: {
        create: [
          {
            accountId: createdAccounts.get('2-1101')!.id, // Hutang Supplier TBS
            debit: 120000000,
            credit: 0,
            description: 'Pelunasan hutang periode sebelumnya'
          },
          {
            accountId: createdAccounts.get('1-1102')!.id, // Bank Mandiri
            debit: 0,
            credit: 120000000,
            description: 'Transfer bank ke supplier'
          }
        ]
      }
    }
  })
  journalEntries.push(entry2)

  // Entry 3: Penjualan CPO (Oct 12, 2025)
  const entry3 = await prisma.journalEntry.create({
    data: {
      companyId: ptPks.id,
      entryNumber: 'JU-2025-10-003',
      date: new Date('2025-10-12'),
      sourceType: 'Manual',
      memo: 'Penjualan CPO 50 ton kepada PT Buyer ABC',
      status: 'POSTED',
      postedAt: new Date('2025-10-12'),
      createdById: 'system',
      lines: {
        create: [
          {
            accountId: createdAccounts.get('1-1201')!.id, // Piutang CPO
            debit: 555000000, // 50 ton x Rp 11,100,000 (termasuk PPN 11%)
            credit: 0,
            description: 'Piutang penjualan CPO 50 ton'
          },
          {
            accountId: createdAccounts.get('4-1001')!.id, // Penjualan CPO
            debit: 0,
            credit: 500000000,
            description: 'Pendapatan penjualan CPO @ Rp 10,000,000/ton'
          },
          {
            accountId: createdAccounts.get('2-1201')!.id, // PPN Keluaran
            debit: 0,
            credit: 55000000,
            description: 'PPN Keluaran 11%'
          }
        ]
      }
    }
  })
  journalEntries.push(entry3)

  // Entry 4: HPP CPO (Oct 12, 2025)
  const entry4 = await prisma.journalEntry.create({
    data: {
      companyId: ptPks.id,
      entryNumber: 'JU-2025-10-004',
      date: new Date('2025-10-12'),
      sourceType: 'Manual',
      memo: 'HPP untuk penjualan CPO 50 ton',
      status: 'POSTED',
      postedAt: new Date('2025-10-12'),
      createdById: 'system',
      lines: {
        create: [
          {
            accountId: createdAccounts.get('5-1000')!.id, // HPP CPO
            debit: 400000000,
            credit: 0,
            description: 'Beban pokok penjualan CPO 50 ton'
          },
          {
            accountId: createdAccounts.get('1-1302')!.id, // Persediaan CPO
            debit: 0,
            credit: 400000000,
            description: 'Pengurangan persediaan CPO'
          }
        ]
      }
    }
  })
  journalEntries.push(entry4)

  // Entry 5: Penerimaan Pembayaran (Oct 15, 2025)
  const entry5 = await prisma.journalEntry.create({
    data: {
      companyId: ptPks.id,
      entryNumber: 'JU-2025-10-005',
      date: new Date('2025-10-15'),
      sourceType: 'Manual',
      memo: 'Penerimaan pembayaran dari PT Buyer ABC',
      status: 'POSTED',
      postedAt: new Date('2025-10-15'),
      createdById: 'system',
      lines: {
        create: [
          {
            accountId: createdAccounts.get('1-1102')!.id, // Bank Mandiri
            debit: 555000000,
            credit: 0,
            description: 'Penerimaan transfer dari buyer'
          },
          {
            accountId: createdAccounts.get('1-1201')!.id, // Piutang CPO
            debit: 0,
            credit: 555000000,
            description: 'Pelunasan piutang CPO'
          }
        ]
      }
    }
  })
  journalEntries.push(entry5)

  // Entry 6: Biaya Gaji (Oct 25, 2025)
  const entry6 = await prisma.journalEntry.create({
    data: {
      companyId: ptPks.id,
      entryNumber: 'JU-2025-10-006',
      date: new Date('2025-10-25'),
      sourceType: 'Manual',
      memo: 'Pembayaran gaji karyawan bulan Oktober 2025',
      status: 'POSTED',
      postedAt: new Date('2025-10-25'),
      createdById: 'system',
      lines: {
        create: [
          {
            accountId: createdAccounts.get('6-3001')!.id, // Gaji Karyawan
            debit: 125000000,
            credit: 0,
            description: 'Beban gaji bulan Oktober'
          },
          {
            accountId: createdAccounts.get('1-1103')!.id, // Bank BCA Payroll
            debit: 0,
            credit: 125000000,
            description: 'Transfer gaji ke rekening karyawan'
          }
        ]
      }
    }
  })
  journalEntries.push(entry6)

  // Entry 7: Biaya Listrik (Oct 26, 2025)
  const entry7 = await prisma.journalEntry.create({
    data: {
      companyId: ptPks.id,
      entryNumber: 'JU-2025-10-007',
      date: new Date('2025-10-26'),
      sourceType: 'Manual',
      memo: 'Pembayaran tagihan listrik Oktober 2025',
      status: 'POSTED',
      postedAt: new Date('2025-10-26'),
      createdById: 'system',
      lines: {
        create: [
          {
            accountId: createdAccounts.get('6-1006')!.id, // Biaya Listrik Produksi
            debit: 45000000,
            credit: 0,
            description: 'Listrik produksi pabrik'
          },
          {
            accountId: createdAccounts.get('6-3004')!.id, // Biaya Listrik Kantor
            debit: 8000000,
            credit: 0,
            description: 'Listrik kantor administrasi'
          },
          {
            accountId: createdAccounts.get('1-1102')!.id, // Bank Mandiri
            debit: 0,
            credit: 53000000,
            description: 'Transfer pembayaran PLN'
          }
        ]
      }
    }
  })
  journalEntries.push(entry7)

  // Entry 8: Pembelian Material (Oct 18, 2025)
  const entry8 = await prisma.journalEntry.create({
    data: {
      companyId: ptPks.id,
      entryNumber: 'JU-2025-10-008',
      date: new Date('2025-10-18'),
      sourceType: 'Manual',
      memo: 'Pembelian material maintenance dan spare parts',
      status: 'POSTED',
      postedAt: new Date('2025-10-18'),
      createdById: 'system',
      lines: {
        create: [
          {
            accountId: createdAccounts.get('1-1304')!.id, // Persediaan Material
            debit: 30000000,
            credit: 0,
            description: 'Pembelian spare parts mesin'
          },
          {
            accountId: createdAccounts.get('1-1402')!.id, // PPN Masukan
            debit: 3300000,
            credit: 0,
            description: 'PPN Masukan 11%'
          },
          {
            accountId: createdAccounts.get('2-1102')!.id, // Hutang Supplier Material
            debit: 0,
            credit: 33300000,
            description: 'Hutang kepada supplier material'
          }
        ]
      }
    }
  })
  journalEntries.push(entry8)

  // Entry 9: Pemakaian Material Maintenance (Oct 20, 2025)
  const entry9 = await prisma.journalEntry.create({
    data: {
      companyId: ptPks.id,
      entryNumber: 'JU-2025-10-009',
      date: new Date('2025-10-20'),
      sourceType: 'GoodsIssue',
      sourceId: 'GI-MAINTENANCE-001',
      memo: 'Pemakaian material untuk maintenance mesin produksi',
      status: 'POSTED',
      postedAt: new Date('2025-10-20'),
      createdById: 'system',
      lines: {
        create: [
          {
            accountId: createdAccounts.get('6-2004')!.id, // Biaya Material Pemeliharaan
            debit: 12000000,
            credit: 0,
            description: 'Material untuk maintenance mesin',
            dept: 'Maintenance',
            costCenter: 'PROD-PKS'
          },
          {
            accountId: createdAccounts.get('1-1304')!.id, // Persediaan Material
            debit: 0,
            credit: 12000000,
            description: 'Pengurangan persediaan material'
          }
        ]
      }
    }
  })
  journalEntries.push(entry9)

  // Entry 10: Penjualan Kernel (Oct 22, 2025)
  const entry10 = await prisma.journalEntry.create({
    data: {
      companyId: ptPks.id,
      entryNumber: 'JU-2025-10-010',
      date: new Date('2025-10-22'),
      sourceType: 'Manual',
      memo: 'Penjualan Kernel 30 ton',
      status: 'POSTED',
      postedAt: new Date('2025-10-22'),
      createdById: 'system',
      lines: {
        create: [
          {
            accountId: createdAccounts.get('1-1102')!.id, // Bank Mandiri
            debit: 166500000, // 30 ton x Rp 5,000,000 x 1.11
            credit: 0,
            description: 'Penerimaan cash penjualan Kernel'
          },
          {
            accountId: createdAccounts.get('4-1002')!.id, // Penjualan Kernel
            debit: 0,
            credit: 150000000,
            description: 'Pendapatan penjualan Kernel @ Rp 5,000,000/ton'
          },
          {
            accountId: createdAccounts.get('2-1201')!.id, // PPN Keluaran
            debit: 0,
            credit: 16500000,
            description: 'PPN Keluaran 11%'
          }
        ]
      }
    }
  })
  journalEntries.push(entry10)

  // Entry 11: HPP Kernel (Oct 22, 2025)
  const entry11 = await prisma.journalEntry.create({
    data: {
      companyId: ptPks.id,
      entryNumber: 'JU-2025-10-011',
      date: new Date('2025-10-22'),
      sourceType: 'Manual',
      memo: 'HPP untuk penjualan Kernel 30 ton',
      status: 'POSTED',
      postedAt: new Date('2025-10-22'),
      createdById: 'system',
      lines: {
        create: [
          {
            accountId: createdAccounts.get('5-2000')!.id, // HPP Kernel
            debit: 120000000,
            credit: 0,
            description: 'Beban pokok penjualan Kernel 30 ton'
          },
          {
            accountId: createdAccounts.get('1-1303')!.id, // Persediaan Kernel
            debit: 0,
            credit: 120000000,
            description: 'Pengurangan persediaan Kernel'
          }
        ]
      }
    }
  })
  journalEntries.push(entry11)

  // Entry 12: Biaya BPJS (Oct 28, 2025)
  const entry12 = await prisma.journalEntry.create({
    data: {
      companyId: ptPks.id,
      entryNumber: 'JU-2025-10-012',
      date: new Date('2025-10-28'),
      sourceType: 'Manual',
      memo: 'Pembayaran BPJS karyawan bulan Oktober 2025',
      status: 'POSTED',
      postedAt: new Date('2025-10-28'),
      createdById: 'system',
      lines: {
        create: [
          {
            accountId: createdAccounts.get('6-3002')!.id, // BPJS Perusahaan
            debit: 15000000,
            credit: 0,
            description: 'Beban BPJS perusahaan'
          },
          {
            accountId: createdAccounts.get('1-1102')!.id, // Bank Mandiri
            debit: 0,
            credit: 15000000,
            description: 'Transfer pembayaran BPJS'
          }
        ]
      }
    }
  })
  journalEntries.push(entry12)

  console.log(`✅ Created ${journalEntries.length} journal entries`)

  console.log('\n🎉 Accounting data seeding completed!')
  console.log('\n📋 Summary:')
  console.log(`- Company: ${ptPks.name}`)
  console.log(`- Fiscal Periods: 12 periods for 2025`)
  console.log(`- Chart of Accounts: ${createdAccounts.size} accounts`)
  console.log(`- System Account Mappings: ${systemMappings.length} mappings`)
  console.log(`- Opening Balances: Set for October 2025`)
  console.log(`- Journal Entries: ${journalEntries.length} entries for October 2025`)
  console.log('\n💡 You can now access the financial reports:')
  console.log('   - Jurnal Umum: View all journal entries')
  console.log('   - Buku Besar: View ledger per account')
  console.log('   - Neraca: View balance sheet as of specific date')
  console.log('   - Laporan Laba Rugi: View income statement for period')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during accounting seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
