import { db } from "../src/server/db";
import { PrismaClient, AccountClass, NormalSide, TaxCode, RecordStatus } from "@prisma/client";

async function seedPTKSAccounts() {
  console.log("🌱 Seeding Chart of Accounts & System Account Map for company id: cmhc4mmj50004uo48r42eqnyp ...");

  // Gunakan id company yang sudah ada
  const company = { id: "cmhc4mmj50004uo48r42eqnyp" };

  // Define comprehensive accounts structure - using ONLY the valid SystemAccountKey enum values
  const accounts = [
    // === ASET LANCAR (CURRENT ASSETS) ===
    {
      code: "1-10000",
      name: "KAS DAN SETARA KAS",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "1-10010",
      name: "Kas",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-10000",
      systemKey: "CASH_DEFAULT" as const,
    },
    {
      code: "1-10020",
      name: "Bank - Rekening Operasional",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-10000",
      systemKey: "BANK_DEFAULT" as const,
    },
    {
      code: "1-10030",
      name: "Bank - Rekening Investasi",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-10000",
      systemKey: null,
    },
    {
      code: "1-10040",
      name: "Setara Kas - Deposito Berjangka",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-10000",
      systemKey: null,
    },

    // PIUTANG USAHA
    {
      code: "1-20000",
      name: "PIUTANG USAHA",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "1-20010",
      name: "Piutang Usaha - Pihak Ketiga",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-20000",
      systemKey: null,
    },
    {
      code: "1-20020",
      name: "Piutang Usaha - Pihak Berelasi",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-20000",
      systemKey: null,
    },
    {
      code: "1-20030",
      name: "Penyisihan Piutang Ragu-ragu",
      class: AccountClass.ASSET,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "1-20000",
      systemKey: null,
    },

    // PERSEDIAAN (INVENTORY)
    {
      code: "1-30000",
      name: "PERSEDIAAN",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "1-30010",
      name: "Persediaan - Bahan Baku",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-30000",
      systemKey: "INVENTORY_GENERAL" as const,
    },
    {
      code: "1-30020",
      name: "Persediaan - Barang Dalam Proses",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-30000",
      systemKey: null,
    },
    {
      code: "1-30030",
      name: "Persediaan - Barang Jadi",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-30000",
      systemKey: null,
    },
    {
      code: "1-30040",
      name: "Persediaan - Suku Cadang",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-30000",
      systemKey: null,
    },
    {
      code: "1-30050",
      name: "Persediaan TBS",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-30000",
      systemKey: "INVENTORY_TBS" as const,
    },
    {
      code: "1-30060",
      name: "Persediaan CPO",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-30000",
      systemKey: "INVENTORY_CPO" as const,
    },
    {
      code: "1-30070",
      name: "Persediaan Kernel",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-30000",
      systemKey: "INVENTORY_KERNEL" as const,
    },
    {
      code: "1-30080",
      name: "Persediaan Dipinjamkan",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-30000",
      systemKey: "INVENTORY_ON_LOAN" as const,
    },
    {
      code: "1-30090",
      name: "Penyisihan Penurunan Nilai Persediaan",
      class: AccountClass.ASSET,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "1-30000",
      systemKey: null,
    },

    // ASET LANCAR LAINNYA
    {
      code: "1-40000",
      name: "ASET LANCAR LAINNYA",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "1-40010",
      name: "Pajak Dibayar Dimuka",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-40000",
      systemKey: null,
    },
    {
      code: "1-40020",
      name: "Biaya Dibayar Dimuka",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-40000",
      systemKey: null,
    },

    // PPN MASUKAN
    {
      code: "1-60000",
      name: "PPN MASUKAN",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: null,
      systemKey: "PPN_MASUKAN" as const,
    },

    // ASET TIDAK LANCAR
    {
      code: "1-50000",
      name: "ASET TIDAK LANCAR",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "1-50010",
      name: "Tanah",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-50000",
      systemKey: null,
    },
    {
      code: "1-50020",
      name: "Bangunan dan Struktur",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-50000",
      systemKey: null,
    },
    {
      code: "1-50030",
      name: "Mesin dan Peralatan",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-50000",
      systemKey: null,
    },
    {
      code: "1-50040",
      name: "Kendaraan",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-50000",
      systemKey: null,
    },
    {
      code: "1-50050",
      name: "Peralatan Kantor",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-50000",
      systemKey: null,
    },
    {
      code: "1-50060",
      name: "Akumulasi Depresiasi - Bangunan",
      class: AccountClass.ASSET,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "1-50000",
      systemKey: null,
    },
    {
      code: "1-50070",
      name: "Akumulasi Depresiasi - Mesin",
      class: AccountClass.ASSET,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "1-50000",
      systemKey: null,
    },
    {
      code: "1-50080",
      name: "Akumulasi Depresiasi - Kendaraan",
      class: AccountClass.ASSET,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "1-50000",
      systemKey: null,
    },
    {
      code: "1-50090",
      name: "Akumulasi Depresiasi - Peralatan Kantor",
      class: AccountClass.ASSET,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "1-50000",
      systemKey: null,
    },

    // === KEWAJIBAN (LIABILITIES) ===
    {
      code: "2-10000",
      name: "HUTANG USAHA",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "2-10010",
      name: "Hutang Usaha - Pihak Ketiga",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "2-10000",
      systemKey: null,
    },
    {
      code: "2-10020",
      name: "Hutang Usaha - Pihak Berelasi",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "2-10000",
      systemKey: null,
    },

    // HUTANG USAHA - SUPPLIER TBS
    {
      code: "2-10100",
      name: "HUTANG USAHA - SUPPLIER TBS",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: null,
      systemKey: "AP_SUPPLIER_TBS" as const,
    },

    {
      code: "2-20000",
      name: "HUTANG JANGKA PENDEK",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "2-20010",
      name: "Pinjaman Jangka Pendek - Bank",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "2-20000",
      systemKey: null,
    },
    {
      code: "2-20020",
      name: "Hutang Pajak",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "2-20000",
      systemKey: null,
    },
    {
      code: "2-20030",
      name: "Hutang Biaya",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "2-20000",
      systemKey: null,
    },

    {
      code: "2-30000",
      name: "KEWAJIBAN JANGKA PANJANG",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "2-30010",
      name: "Pinjaman Jangka Panjang - Bank",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "2-30000",
      systemKey: null,
    },
    {
      code: "2-30020",
      name: "Hutang Obligasi",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "2-30000",
      systemKey: null,
    },

    // PAJAK LIABILITIES
    {
      code: "2-40000",
      name: "PPN KELUARAN",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: null,
      systemKey: "PPN_KELUARAN" as const,
    },
    {
      code: "2-50000",
      name: "PPH 22",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: null,
      systemKey: "PPH22_DEFAULT" as const,
    },
    {
      code: "2-60000",
      name: "PPH 23",
      class: AccountClass.LIABILITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: null,
      systemKey: "PPH23_DEFAULT" as const,
    },

    // === EKUITAS (EQUITY) ===
    {
      code: "3-10000",
      name: "MODAL SAHAM",
      class: AccountClass.EQUITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "3-20000",
      name: "AGIO SAHAM",
      class: AccountClass.EQUITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "3-30000",
      name: "LABA DITAHAN",
      class: AccountClass.EQUITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "3-40000",
      name: "LABA RUGI PERIODE BERJALAN",
      class: AccountClass.EQUITY,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: null,
      systemKey: null,
    },

    // === PENDAPATAN (REVENUE) ===
    {
      code: "4-10000",
      name: "PENJUALAN",
      class: AccountClass.REVENUE,
      normalSide: NormalSide.CREDIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "4-10010",
      name: "Penjualan - CPO",
      class: AccountClass.REVENUE,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "4-10000",
      systemKey: "SALES_CPO" as const,
    },
    {
      code: "4-10020",
      name: "Penjualan - Kernel",
      class: AccountClass.REVENUE,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: "4-10000",
      systemKey: "SALES_KERNEL" as const,
    },
    {
      code: "4-20000",
      name: "RETUR PENJUALAN",
      class: AccountClass.REVENUE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "4-30000",
      name: "POTONGAN PENJUALAN",
      class: AccountClass.REVENUE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "4-40000",
      name: "PENDAPATAN LAIN-LAIN",
      class: AccountClass.OTHER_INCOME,
      normalSide: NormalSide.CREDIT,
      isPosting: true,
      parentCode: null,
      systemKey: null,
    },

    // === BEBAN POKOK PENJUALAN (COGS) ===
    {
      code: "5-10000",
      name: "BEBAN POKOK PENJUALAN",
      class: AccountClass.COGS,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "5-10010",
      name: "Beban Pokok Penjualan - CPO",
      class: AccountClass.COGS,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "5-10000",
      systemKey: "COGS_CPO" as const,
    },
    {
      code: "5-10020",
      name: "Beban Pokok Penjualan - Kernel",
      class: AccountClass.COGS,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "5-10000",
      systemKey: "COGS_KERNEL" as const,
    },
    {
      code: "5-20000",
      name: "PEMBELIAN TBS",
      class: AccountClass.COGS,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: null,
      systemKey: "TBS_PURCHASE" as const,
    },
    {
      code: "5-30000",
      name: "BEBAN PRODUKSI - MATERIAL",
      class: AccountClass.COGS,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: null,
      systemKey: "PRODUCTION_CONSUMPTION" as const,
    },

    // === BEBAN OPERASIONAL (OPERATING EXPENSES) ===
    {
      code: "6-10000",
      name: "BEBAN PRODUKSI",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "6-10010",
      name: "Gaji dan Upah - Produksi",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-10000",
      systemKey: null,
    },
    {
      code: "6-10020",
      name: "Bahan Bakar - Produksi",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-10000",
      systemKey: null,
    },
    {
      code: "6-10030",
      name: "Pemeliharaan Mesin",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-10000",
      systemKey: "MAINTENANCE_EXPENSE_DEFAULT" as const,
    },
    {
      code: "6-10040",
      name: "Depresiasi - Mesin Produksi",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-10000",
      systemKey: null,
    },

    {
      code: "6-20000",
      name: "BEBAN DISTRIBUSI",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "6-20010",
      name: "Biaya Pengiriman",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-20000",
      systemKey: null,
    },
    {
      code: "6-20020",
      name: "Bahan Bakar - Distribusi",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-20000",
      systemKey: null,
    },
    {
      code: "6-20030",
      name: "Gaji dan Upah - Distribusi",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-20000",
      systemKey: null,
    },

    // BEBAN BONGKAR MUATAN
    {
      code: "6-25000",
      name: "BEBAN BONGKAR MUATAN",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "6-25010",
      name: "Beban Bongkar - SPTI",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-25000",
      systemKey: "UNLOADING_EXPENSE_SPTI" as const,
    },
    {
      code: "6-25020",
      name: "Beban Bongkar - SPLO",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-25000",
      systemKey: "UNLOADING_EXPENSE_SPLO" as const,
    },

    {
      code: "6-30000",
      name: "BEBAN ADMINISTRASI",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "6-30010",
      name: "Gaji dan Upah - Administrasi",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-30000",
      systemKey: null,
    },
    {
      code: "6-30020",
      name: "Biaya Kantor",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-30000",
      systemKey: null,
    },
    {
      code: "6-30030",
      name: "Biaya Utilitas",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-30000",
      systemKey: null,
    },
    {
      code: "6-30040",
      name: "Depresiasi - Peralatan Kantor",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-30000",
      systemKey: null,
    },
    {
      code: "6-30050",
      name: "Amortisasi",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-30000",
      systemKey: null,
    },

    {
      code: "6-40000",
      name: "BEBAN LAIN-LAIN",
      class: AccountClass.OTHER_EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "6-40010",
      name: "Kerugian Penjualan Aset Tetap",
      class: AccountClass.OTHER_EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-40000",
      systemKey: null,
    },
    {
      code: "6-40020",
      name: "Beban Bunga",
      class: AccountClass.OTHER_EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-40000",
      systemKey: null,
    },
    {
      code: "6-40030",
      name: "Rugi Selisih Kurs",
      class: AccountClass.OTHER_EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-40000",
      systemKey: null,
    },
    {
      code: "6-40040",
      name: "Kerugian Penyesuaian Persediaan",
      class: AccountClass.OTHER_EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-40000",
      systemKey: "INVENTORY_ADJUSTMENT_LOSS" as const,
    },
  ];

  // Create accounts with parent-child relationship
  const accountMap = new Map<string, string>();

  // First pass: create parent accounts
  for (const acc of accounts.filter((a) => !a.parentCode)) {
    const account = await db.account.upsert({
      where: {
        companyId_code: {
          companyId: company.id,
          code: acc.code,
        },
      },
      update: {
        name: acc.name,
        class: acc.class,
        normalSide: acc.normalSide,
        isPosting: acc.isPosting,
        taxCode: TaxCode.NON_TAX,
        status: RecordStatus.AKTIF,
      },
      create: {
        companyId: company.id,
        code: acc.code,
        name: acc.name,
        class: acc.class,
        normalSide: acc.normalSide,
        isPosting: acc.isPosting,
        taxCode: TaxCode.NON_TAX,
        status: RecordStatus.AKTIF,
      },
    });
    accountMap.set(acc.code, account.id);
    console.log(`✅ Created parent account: ${acc.code} - ${acc.name}`);

    // Create SystemAccountMap if this parent account has a systemKey
    if (acc.systemKey) {
      await db.systemAccountMap.upsert({
        where: {
          companyId_key: {
            companyId: company.id,
            key: acc.systemKey as any,
          },
        },
        update: {
          accountId: account.id,
        },
        create: {
          companyId: company.id,
          key: acc.systemKey as any,
          accountId: account.id,
        },
      });
      console.log(`   🔗 Mapped ${acc.systemKey} → ${acc.code}`);
    }
  }

  // Second pass: create child accounts
  for (const acc of accounts.filter((a) => a.parentCode)) {
    const parentId = accountMap.get(acc.parentCode!);
    if (!parentId) {
      console.error(`❌ Parent not found for ${acc.code}`);
      continue;
    }

    const account = await db.account.upsert({
      where: {
        companyId_code: {
          companyId: company.id,
          code: acc.code,
        },
      },
      update: {
        name: acc.name,
        class: acc.class,
        normalSide: acc.normalSide,
        isPosting: acc.isPosting,
        taxCode: TaxCode.NON_TAX,
        status: RecordStatus.AKTIF,
        parentId: parentId,
      },
      create: {
        companyId: company.id,
        code: acc.code,
        name: acc.name,
        class: acc.class,
        normalSide: acc.normalSide,
        isPosting: acc.isPosting,
        taxCode: TaxCode.NON_TAX,
        status: RecordStatus.AKTIF,
        parentId: parentId,
      },
    });
    accountMap.set(acc.code, account.id);
    console.log(`✅ Created child account: ${acc.code} - ${acc.name}`);
  }
}

// Jalankan seeding saat file dieksekusi
seedPTKSAccounts()
  .then(() => {
    console.log("✅ Seeding selesai");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });