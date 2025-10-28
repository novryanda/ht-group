import { db } from "../src/server/db";
import { PrismaClient, AccountClass, NormalSide, TaxCode, RecordStatus } from "@prisma/client";

async function seedPTKSAccounts() {
  console.log("🌱 Seeding PT PKS Chart of Accounts & System Account Map...");

  // Get or create PT-PKS company
  const company = await db.company.upsert({
    where: { code: "PT-PKS" },
    update: {},
    create: {
      code: "PT-PKS",
      name: "PT Trimitra Karya Sawitindo",
    },
  });

  console.log(`✅ Company: ${company.name}`);

  // Define accounts structure
  const accounts = [
    // === ASSET ACCOUNTS ===
    {
      code: "1-14000",
      name: "PERSEDIAAN",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "1-14010",
      name: "Persediaan - Material & Suku Cadang",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-14000",
      systemKey: "INVENTORY_GENERAL" as const,
    },
    {
      code: "1-14020",
      name: "Persediaan Dipinjamkan",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-14000",
      systemKey: "INVENTORY_ON_LOAN" as const,
    },
    {
      code: "1-14030",
      name: "Persediaan TBS",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-14000",
      systemKey: "INVENTORY_TBS" as const,
    },
    {
      code: "1-14040",
      name: "Persediaan CPO",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-14000",
      systemKey: "INVENTORY_CPO" as const,
    },
    {
      code: "1-14050",
      name: "Persediaan Kernel",
      class: AccountClass.ASSET,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "1-14000",
      systemKey: "INVENTORY_KERNEL" as const,
    },

    // === COGS ACCOUNTS ===
    {
      code: "5-51000",
      name: "BEBAN POKOK PRODUKSI",
      class: AccountClass.COGS,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "5-51010",
      name: "Beban Produksi - Material",
      class: AccountClass.COGS,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "5-51000",
      systemKey: "PRODUCTION_CONSUMPTION" as const,
    },
    {
      code: "5-52010",
      name: "Beban Pokok Penjualan - CPO",
      class: AccountClass.COGS,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "5-51000",
      systemKey: "COGS_CPO" as const,
    },
    {
      code: "5-52020",
      name: "Beban Pokok Penjualan - Kernel",
      class: AccountClass.COGS,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "5-51000",
      systemKey: "COGS_KERNEL" as const,
    },

    // === EXPENSE ACCOUNTS ===
    {
      code: "6-61000",
      name: "BIAYA OPERASIONAL",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "6-61020",
      name: "Biaya Pemeliharaan - Suku Cadang",
      class: AccountClass.EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-61000",
      systemKey: "MAINTENANCE_EXPENSE_DEFAULT" as const,
    },
    {
      code: "6-69000",
      name: "BIAYA LAIN-LAIN",
      class: AccountClass.OTHER_EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: false,
      parentCode: null,
      systemKey: null,
    },
    {
      code: "6-69010",
      name: "Kerugian Penyesuaian Persediaan",
      class: AccountClass.OTHER_EXPENSE,
      normalSide: NormalSide.DEBIT,
      isPosting: true,
      parentCode: "6-69000",
      systemKey: "INVENTORY_ADJUSTMENT_LOSS" as const,
    },
  ];

  // Create accounts with parent-child relationship
  const accountMap = new Map<string, string>(); // code -> id

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
        parentId: parentId,
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
        parentId: parentId,
        taxCode: TaxCode.NON_TAX,
        status: RecordStatus.AKTIF,
      },
    });
    accountMap.set(acc.code, account.id);
    console.log(`✅ Created child account: ${acc.code} - ${acc.name}`);

    // Create SystemAccountMap if this account has a systemKey
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

  console.log("✅ PT PKS Accounts & System Account Map seeded successfully!");
}

async function main() {
  try {
    await seedPTKSAccounts();
  } catch (error) {
    console.error("❌ Error seeding:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

main();
