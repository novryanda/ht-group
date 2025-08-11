import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Companies
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { code: 'PT-NILO' },
      update: {},
      create: {
        code: 'PT-NILO',
        name: 'PT NILO',
        description: 'PT NILO - Main operations company',
        isActive: true,
      },
    }),
    prisma.company.upsert({
      where: { code: 'PT-ZTA' },
      update: {},
      create: {
        code: 'PT-ZTA',
        name: 'PT ZTA',
        description: 'PT ZTA - Secondary operations',
        isActive: true,
      },
    }),
    prisma.company.upsert({
      where: { code: 'PT-TAM' },
      update: {},
      create: {
        code: 'PT-TAM',
        name: 'PT TAM',
        description: 'PT TAM - Fabrication specialist',
        isActive: true,
      },
    }),
    prisma.company.upsert({
      where: { code: 'PT-HTK' },
      update: {},
      create: {
        code: 'PT-HTK',
        name: 'PT HTK',
        description: 'PT HTK - Landscaping services',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Companies created');

  // Create Units for PT NILO
  const niloUnits = await Promise.all([
    prisma.unit.upsert({
      where: { companyId_code: { companyId: companies[0].id, code: 'hvac-rittal' } },
      update: {},
      create: {
        code: 'hvac-rittal',
        name: 'HVAC Rittal',
        type: 'HVAC_RITTAL',
        description: 'HVAC Rittal maintenance unit',
        companyId: companies[0].id,
        isActive: true,
      },
    }),
    prisma.unit.upsert({
      where: { companyId_code: { companyId: companies[0].id, code: 'hvac-split' } },
      update: {},
      create: {
        code: 'hvac-split',
        name: 'HVAC Split',
        type: 'HVAC_SPLIT',
        description: 'HVAC Split maintenance unit',
        companyId: companies[0].id,
        isActive: true,
      },
    }),
    prisma.unit.upsert({
      where: { companyId_code: { companyId: companies[0].id, code: 'fabrikasi' } },
      update: {},
      create: {
        code: 'fabrikasi',
        name: 'Fabrikasi',
        type: 'FABRIKASI',
        description: 'Fabrication unit',
        companyId: companies[0].id,
        isActive: true,
      },
    }),
    prisma.unit.upsert({
      where: { companyId_code: { companyId: companies[0].id, code: 'efluen' } },
      update: {},
      create: {
        code: 'efluen',
        name: 'Efluen',
        type: 'EFLUEN',
        description: 'Effluent treatment unit',
        companyId: companies[0].id,
        isActive: true,
      },
    }),
  ]);

  // Create Units for other companies
  await prisma.unit.upsert({
    where: { companyId_code: { companyId: companies[1].id, code: 'hvac-rittal' } },
    update: {},
    create: {
      code: 'hvac-rittal',
      name: 'HVAC Rittal',
      type: 'HVAC_RITTAL',
      description: 'HVAC Rittal maintenance unit',
      companyId: companies[1].id,
      isActive: true,
    },
  });

  await prisma.unit.upsert({
    where: { companyId_code: { companyId: companies[2].id, code: 'fabrikasi' } },
    update: {},
    create: {
      code: 'fabrikasi',
      name: 'Fabrikasi',
      type: 'FABRIKASI',
      description: 'Fabrication unit',
      companyId: companies[2].id,
      isActive: true,
    },
  });

  await prisma.unit.upsert({
    where: { companyId_code: { companyId: companies[3].id, code: 'cutting-grass' } },
    update: {},
    create: {
      code: 'cutting-grass',
      name: 'Cutting Grass',
      type: 'CUTTING_GRASS',
      description: 'Landscaping services unit',
      companyId: companies[3].id,
      isActive: true,
    },
  });

  console.log('✅ Units created');

  // Create demo users and employees
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@ht-group.com' },
      update: {},
      create: {
        email: 'admin@ht-group.com',
        name: 'Administrator',
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'supervisor@ht-group.com' },
      update: {},
      create: {
        email: 'supervisor@ht-group.com',
        name: 'Unit Supervisor',
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'technician@ht-group.com' },
      update: {},
      create: {
        email: 'technician@ht-group.com',
        name: 'Technician',
        emailVerified: new Date(),
      },
    }),
  ]);

  // Create employees
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-001' },
      update: {},
      create: {
        employeeCode: 'EMP-001',
        name: 'Administrator',
        email: 'admin@ht-group.com',
        position: 'PT Manager',
        department: 'Management',
        role: 'PT_MANAGER',
        hireDate: new Date('2023-01-01'),
        companyId: companies[0].id,
        unitId: niloUnits[0].id,
        userId: users[0].id,
        isActive: true,
      },
    }),
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-002' },
      update: {},
      create: {
        employeeCode: 'EMP-002',
        name: 'Unit Supervisor',
        email: 'supervisor@ht-group.com',
        position: 'Unit Supervisor',
        department: 'HVAC Rittal',
        role: 'UNIT_SUPERVISOR',
        hireDate: new Date('2023-02-01'),
        companyId: companies[0].id,
        unitId: niloUnits[0].id,
        userId: users[1].id,
        isActive: true,
      },
    }),
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-003' },
      update: {},
      create: {
        employeeCode: 'EMP-003',
        name: 'Technician',
        email: 'technician@ht-group.com',
        position: 'HVAC Technician',
        department: 'HVAC Rittal',
        role: 'TECHNICIAN',
        hireDate: new Date('2023-03-01'),
        companyId: companies[0].id,
        unitId: niloUnits[0].id,
        userId: users[2].id,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Users and Employees created');

  // Create sample assets
  const assets = await Promise.all([
    prisma.asset.upsert({
      where: { assetCode: 'AC-RTL-001' },
      update: {},
      create: {
        assetCode: 'AC-RTL-001',
        name: 'AC Rittal Unit 1',
        type: 'AC_RITTAL',
        brand: 'Rittal',
        model: 'SK-3000',
        serialNumber: 'RTL001-2023',
        location: 'Server Room A',
        status: 'ACTIVE',
        installDate: new Date('2023-01-15'),
        warrantyEnd: new Date('2025-01-15'),
        unitId: niloUnits[0].id,
      },
    }),
    prisma.asset.upsert({
      where: { assetCode: 'AC-RTL-002' },
      update: {},
      create: {
        assetCode: 'AC-RTL-002',
        name: 'AC Rittal Unit 2',
        type: 'AC_RITTAL',
        brand: 'Rittal',
        model: 'SK-5000',
        serialNumber: 'RTL002-2023',
        location: 'Server Room B',
        status: 'ACTIVE',
        installDate: new Date('2023-02-01'),
        warrantyEnd: new Date('2025-02-01'),
        unitId: niloUnits[0].id,
      },
    }),
  ]);

  console.log('✅ Assets created');

  // Create sample parts
  await Promise.all([
    prisma.part.upsert({
      where: { partCode: 'FILTER-001' },
      update: {},
      create: {
        partCode: 'FILTER-001',
        name: 'Air Filter Standard',
        description: 'Standard air filter for AC units',
        category: 'Filters',
        unit: 'pcs',
        unitPrice: 50000,
        stockQty: 100,
        minStock: 10,
        isActive: true,
      },
    }),
    prisma.part.upsert({
      where: { partCode: 'COOLANT-001' },
      update: {},
      create: {
        partCode: 'COOLANT-001',
        name: 'Refrigerant R410A',
        description: 'Refrigerant for AC systems',
        category: 'Chemicals',
        unit: 'kg',
        unitPrice: 150000,
        stockQty: 50,
        minStock: 5,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Parts created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
