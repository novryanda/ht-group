import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12);

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
  const ztaUnit = await prisma.unit.upsert({
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

  const tamUnit = await prisma.unit.upsert({
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

  const htkUnit = await prisma.unit.upsert({
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

  // Create PT-specific admin users with passwords
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin.nilo@ht-group.com' },
      update: { password: hashedPassword },
      create: {
        email: 'admin.nilo@ht-group.com',
        name: 'PT NILO Administrator',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin.zta@ht-group.com' },
      update: { password: hashedPassword },
      create: {
        email: 'admin.zta@ht-group.com',
        name: 'PT ZTA Administrator',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin.tam@ht-group.com' },
      update: { password: hashedPassword },
      create: {
        email: 'admin.tam@ht-group.com',
        name: 'PT TAM Administrator',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin.htk@ht-group.com' },
      update: { password: hashedPassword },
      create: {
        email: 'admin.htk@ht-group.com',
        name: 'PT HTK Administrator',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'executive@ht-group.com' },
      update: { password: hashedPassword },
      create: {
        email: 'executive@ht-group.com',
        name: 'Group Executive',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    }),
  ]);

  // Create PT-specific admin employees
  const employees = await Promise.all([
    // PT NILO Admin
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-NILO-001' },
      update: {},
      create: {
        employeeCode: 'EMP-NILO-001',
        name: 'PT NILO Administrator',
        email: 'admin.nilo@ht-group.com',
        position: 'PT Administrator',
        department: 'Management',
        role: 'PT_NILO_ADMIN' as UserRole,
        hireDate: new Date('2023-01-01'),
        companyId: companies[0].id,
        unitId: niloUnits[0].id,
        userId: users[0].id, // admin.nilo@ht-group.com
        isActive: true,
      },
    }),
    // PT ZTA Admin
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-ZTA-001' },
      update: {},
      create: {
        employeeCode: 'EMP-ZTA-001',
        name: 'PT ZTA Administrator',
        email: 'admin.zta@ht-group.com',
        position: 'PT Administrator',
        department: 'Management',
        role: 'PT_ZTA_ADMIN' as UserRole,
        hireDate: new Date('2023-01-01'),
        companyId: companies[1].id,
        unitId: ztaUnit.id,
        userId: users[1].id, // admin.zta@ht-group.com
        isActive: true,
      },
    }),
    // PT TAM Admin
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-TAM-001' },
      update: {},
      create: {
        employeeCode: 'EMP-TAM-001',
        name: 'PT TAM Administrator',
        email: 'admin.tam@ht-group.com',
        position: 'PT Administrator',
        department: 'Management',
        role: 'PT_TAM_ADMIN' as UserRole,
        hireDate: new Date('2023-01-01'),
        companyId: companies[2].id,
        unitId: tamUnit.id,
        userId: users[2].id, // admin.tam@ht-group.com
        isActive: true,
      },
    }),
    // PT HTK Admin
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-HTK-001' },
      update: {},
      create: {
        employeeCode: 'EMP-HTK-001',
        name: 'PT HTK Administrator',
        email: 'admin.htk@ht-group.com',
        position: 'PT Administrator',
        department: 'Management',
        role: 'PT_HTK_ADMIN' as UserRole,
        hireDate: new Date('2023-01-01'),
        companyId: companies[3].id,
        unitId: htkUnit.id,
        userId: users[3].id, // admin.htk@ht-group.com
        isActive: true,
      },
    }),
    // Group Executive
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-EXEC-001' },
      update: {},
      create: {
        employeeCode: 'EMP-EXEC-001',
        name: 'Group Executive',
        email: 'executive@ht-group.com',
        position: 'Group Executive',
        department: 'Executive',
        role: 'EXECUTIVE' as UserRole,
        hireDate: new Date('2023-01-01'),
        companyId: undefined, // Executive has access to all companies
        unitId: null, // Executive is not tied to specific unit
        userId: users[4].id, // executive@ht-group.com
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
    // ZTA Assets
    prisma.asset.upsert({
      where: { assetCode: 'AC-ZTA-001' },
      update: {},
      create: {
        assetCode: 'AC-ZTA-001',
        name: 'AC ZTA Unit 1',
        type: 'AC_RITTAL',
        brand: 'Rittal',
        model: 'SK-2000',
        serialNumber: 'ZTA001-2023',
        location: 'Data Center',
        status: 'ACTIVE',
        installDate: new Date('2023-03-01'),
        warrantyEnd: new Date('2025-03-01'),
        unitId: ztaUnit.id,
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
    prisma.part.upsert({
      where: { partCode: 'STEEL-001' },
      update: {},
      create: {
        partCode: 'STEEL-001',
        name: 'Steel Bar 6mm',
        description: 'Steel bar for fabrication',
        category: 'Raw Materials',
        unit: 'meter',
        unitPrice: 25000,
        stockQty: 200,
        minStock: 20,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Parts created');

  // Create sample work orders for PT NILO
  const workOrders = await Promise.all([
    prisma.workOrder.upsert({
      where: { woNumber: 'WO-NILO-001' },
      update: {},
      create: {
        woNumber: 'WO-NILO-001',
        title: 'AC Rittal Unit 1 Maintenance',
        description: 'Routine maintenance for AC Rittal Unit 1',
        type: 'PREVENTIVE_MAINTENANCE',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        scheduledDate: new Date('2024-08-15'),
        estimatedHours: 4,
        assetId: assets[0].id,
        assignedToId: employees[0].id,
        createdById: employees[0].id,
        companyId: companies[0].id,
        unitId: niloUnits[0].id,
      },
    }),
    prisma.workOrder.upsert({
      where: { woNumber: 'WO-NILO-002' },
      update: {},
      create: {
        woNumber: 'WO-NILO-002',
        title: 'AC Rittal Unit 2 Filter Replacement',
        description: 'Replace air filters for AC Rittal Unit 2',
        type: 'PREVENTIVE_MAINTENANCE',
        priority: 'LOW',
        status: 'CLOSED',
        scheduledDate: new Date('2024-08-10'),
        startDate: new Date('2024-08-10'),
        endDate: new Date('2024-08-10'),
        estimatedHours: 2,
        actualHours: 1.5,
        assetId: assets[1].id,
        assignedToId: employees[0].id,
        createdById: employees[0].id,
        companyId: companies[0].id,
        unitId: niloUnits[0].id,
      },
    }),
    // Work orders for ZTA
    prisma.workOrder.upsert({
      where: { woNumber: 'WO-ZTA-001' },
      update: {},
      create: {
        woNumber: 'WO-ZTA-001',
        title: 'AC ZTA Unit 1 Inspection',
        description: 'Monthly inspection for AC ZTA Unit 1',
        type: 'INSPECTION',
        priority: 'MEDIUM',
        status: 'APPROVED',
        scheduledDate: new Date('2024-08-20'),
        estimatedHours: 3,
        assetId: assets[2].id,
        assignedToId: employees[1].id,
        createdById: employees[1].id,
        companyId: companies[1].id,
        unitId: ztaUnit.id,
      },
    }),
  ]);

  console.log('✅ Work Orders created');

  // Create sample jobs for PT TAM (Fabrication)
  const jobs = await Promise.all([
    prisma.job.upsert({
      where: { jobNumber: 'JOB-TAM-001' },
      update: {},
      create: {
        jobNumber: 'JOB-TAM-001',
        title: 'Steel Frame Fabrication',
        description: 'Custom steel frame fabrication for client project',
        type: 'FABRICATION',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-08-01'),
        estimatedCost: 12000000,
        contractValue: 15000000,
        customerName: 'PT Client Gamma',
        progress: 60,
        companyId: companies[2].id,
        unitId: tamUnit.id,
      },
    }),
    prisma.job.upsert({
      where: { jobNumber: 'JOB-TAM-002' },
      update: {},
      create: {
        jobNumber: 'JOB-TAM-002',
        title: 'Metal Cutting Service',
        description: 'Precision metal cutting for industrial components',
        type: 'FABRICATION',
        status: 'CLOSED',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-20'),
        estimatedCost: 6500000,
        actualCost: 7000000,
        contractValue: 8500000,
        customerName: 'PT Client Delta',
        progress: 100,
        companyId: companies[2].id,
        unitId: tamUnit.id,
      },
    }),
    // HTK Jobs
    prisma.job.upsert({
      where: { jobNumber: 'JOB-HTK-001' },
      update: {},
      create: {
        jobNumber: 'JOB-HTK-001',
        title: 'Garden Maintenance Contract',
        description: 'Monthly garden maintenance for corporate client',
        type: 'CUTTING_GRASS',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-08-01'),
        estimatedCost: 2500000,
        contractValue: 3000000,
        customerName: 'PT Client Echo',
        progress: 40,
        companyId: companies[3].id,
        unitId: htkUnit.id,
      },
    }),
  ]);

  console.log('✅ Jobs created');

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { code: 'CUST-001' },
      update: {},
      create: {
        code: 'CUST-001',
        name: 'PT Client Alpha',
        email: 'contact@client-alpha.com',
        phone: '+62-21-1234567',
        address: 'Jakarta, Indonesia',
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { code: 'CUST-002' },
      update: {},
      create: {
        code: 'CUST-002',
        name: 'PT Client Beta',
        email: 'contact@client-beta.com',
        phone: '+62-21-2345678',
        address: 'Surabaya, Indonesia',
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { code: 'CUST-003' },
      update: {},
      create: {
        code: 'CUST-003',
        name: 'PT Client Gamma',
        email: 'contact@client-gamma.com',
        phone: '+62-21-3456789',
        address: 'Bandung, Indonesia',
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { code: 'CUST-004' },
      update: {},
      create: {
        code: 'CUST-004',
        name: 'PT Client Delta',
        email: 'contact@client-delta.com',
        phone: '+62-21-4567890',
        address: 'Medan, Indonesia',
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { code: 'CUST-005' },
      update: {},
      create: {
        code: 'CUST-005',
        name: 'PT Client Echo',
        email: 'contact@client-echo.com',
        phone: '+62-21-5678901',
        address: 'Semarang, Indonesia',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Customers created');

  // Create sample invoices for revenue tracking
  const invoices = await Promise.all([
    prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-NILO-001' },
      update: {},
      create: {
        invoiceNumber: 'INV-NILO-001',
        description: 'HVAC Maintenance Services - August 2024',
        subtotal: 2500000,
        totalAmount: 2500000,
        paidAmount: 2500000,
        remainingAmount: 0,
        status: 'PAID',
        issueDate: new Date('2024-08-01'),
        dueDate: new Date('2024-08-31'),
        companyId: companies[0].id,
        customerId: customers[0].id,
      },
    }),
    prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-ZTA-001' },
      update: {},
      create: {
        invoiceNumber: 'INV-ZTA-001',
        description: 'HVAC Split Maintenance - August 2024',
        subtotal: 1800000,
        totalAmount: 1800000,
        paidAmount: 900000,
        remainingAmount: 900000,
        status: 'PARTIALLY_PAID',
        issueDate: new Date('2024-08-05'),
        dueDate: new Date('2024-09-05'),
        companyId: companies[1].id,
        customerId: customers[1].id,
      },
    }),
    prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-TAM-001' },
      update: {},
      create: {
        invoiceNumber: 'INV-TAM-001',
        description: 'Steel Fabrication Project - July 2024',
        subtotal: 8500000,
        totalAmount: 8500000,
        paidAmount: 8500000,
        remainingAmount: 0,
        status: 'PAID',
        issueDate: new Date('2024-07-20'),
        dueDate: new Date('2024-08-20'),
        companyId: companies[2].id,
        customerId: customers[2].id,
      },
    }),
    prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-HTK-001' },
      update: {},
      create: {
        invoiceNumber: 'INV-HTK-001',
        description: 'Landscaping Services - August 2024',
        subtotal: 750000,
        totalAmount: 750000,
        paidAmount: 0,
        remainingAmount: 750000,
        status: 'APPROVED',
        issueDate: new Date('2024-08-10'),
        dueDate: new Date('2024-09-10'),
        companyId: companies[3].id,
        customerId: customers[4].id,
      },
    }),
  ]);

  console.log('✅ Invoices created');

  // Create additional employees for each PT
  const additionalEmployees = await Promise.all([
    // PT NILO additional employees
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-NILO-002' },
      update: {},
      create: {
        employeeCode: 'EMP-NILO-002',
        name: 'Ahmad Supervisor',
        email: 'ahmad.supervisor@pt-nilo.com',
        position: 'HVAC Supervisor',
        department: 'HVAC Rittal',
        role: 'UNIT_SUPERVISOR' as UserRole,
        hireDate: new Date('2023-02-01'),
        companyId: companies[0].id,
        unitId: niloUnits[0].id,
        isActive: true,
      },
    }),
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-NILO-003' },
      update: {},
      create: {
        employeeCode: 'EMP-NILO-003',
        name: 'Budi Technician',
        email: 'budi.tech@pt-nilo.com',
        position: 'HVAC Technician',
        department: 'HVAC Split',
        role: 'TECHNICIAN' as UserRole,
        hireDate: new Date('2023-03-01'),
        companyId: companies[0].id,
        unitId: niloUnits[1].id,
        isActive: true,
      },
    }),
    // PT ZTA employees
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-ZTA-002' },
      update: {},
      create: {
        employeeCode: 'EMP-ZTA-002',
        name: 'Citra Supervisor',
        email: 'citra.supervisor@pt-zta.com',
        position: 'HVAC Supervisor',
        department: 'HVAC Operations',
        role: 'UNIT_SUPERVISOR' as UserRole,
        hireDate: new Date('2023-02-15'),
        companyId: companies[1].id,
        unitId: ztaUnit.id,
        isActive: true,
      },
    }),
    // PT TAM employees
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-TAM-002' },
      update: {},
      create: {
        employeeCode: 'EMP-TAM-002',
        name: 'Dedi Welder',
        email: 'dedi.welder@pt-tam.com',
        position: 'Senior Welder',
        department: 'Fabrication',
        role: 'TECHNICIAN' as UserRole,
        hireDate: new Date('2023-01-15'),
        companyId: companies[2].id,
        unitId: tamUnit.id,
        isActive: true,
      },
    }),
    // PT HTK employees
    prisma.employee.upsert({
      where: { employeeCode: 'EMP-HTK-002' },
      update: {},
      create: {
        employeeCode: 'EMP-HTK-002',
        name: 'Eko Gardener',
        email: 'eko.gardener@pt-htk.com',
        position: 'Senior Gardener',
        department: 'Landscaping',
        role: 'TECHNICIAN' as UserRole,
        hireDate: new Date('2023-03-01'),
        companyId: companies[3].id,
        unitId: htkUnit.id,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Additional Employees created');

  // Create Chart of Accounts
  const accounts = await Promise.all([
    // Assets
    prisma.chartOfAccount.upsert({
      where: { accountCode: '1000' },
      update: {},
      create: {
        accountCode: '1000',
        accountName: 'Cash and Cash Equivalents',
        accountType: 'ASSET',
        isActive: true,
      },
    }),
    prisma.chartOfAccount.upsert({
      where: { accountCode: '1200' },
      update: {},
      create: {
        accountCode: '1200',
        accountName: 'Accounts Receivable',
        accountType: 'ASSET',
        isActive: true,
      },
    }),
    prisma.chartOfAccount.upsert({
      where: { accountCode: '1500' },
      update: {},
      create: {
        accountCode: '1500',
        accountName: 'Equipment and Machinery',
        accountType: 'ASSET',
        isActive: true,
      },
    }),
    // Liabilities
    prisma.chartOfAccount.upsert({
      where: { accountCode: '2000' },
      update: {},
      create: {
        accountCode: '2000',
        accountName: 'Accounts Payable',
        accountType: 'LIABILITY',
        isActive: true,
      },
    }),
    // Revenue
    prisma.chartOfAccount.upsert({
      where: { accountCode: '4000' },
      update: {},
      create: {
        accountCode: '4000',
        accountName: 'Service Revenue',
        accountType: 'REVENUE',
        isActive: true,
      },
    }),
    prisma.chartOfAccount.upsert({
      where: { accountCode: '4100' },
      update: {},
      create: {
        accountCode: '4100',
        accountName: 'Fabrication Revenue',
        accountType: 'REVENUE',
        isActive: true,
      },
    }),
    // Expenses
    prisma.chartOfAccount.upsert({
      where: { accountCode: '5000' },
      update: {},
      create: {
        accountCode: '5000',
        accountName: 'Material Costs',
        accountType: 'EXPENSE',
        isActive: true,
      },
    }),
    prisma.chartOfAccount.upsert({
      where: { accountCode: '5100' },
      update: {},
      create: {
        accountCode: '5100',
        accountName: 'Labor Costs',
        accountType: 'EXPENSE',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Chart of Accounts created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📋 Demo Users:');
  console.log('- executive@ht-group.com (Super Admin - can see all PTs)');
  console.log('- admin.nilo@ht-group.com (PT NILO Admin)');
  console.log('- admin.zta@ht-group.com (PT ZTA Admin)');
  console.log('- admin.tam@ht-group.com (PT TAM Admin)');
  console.log('- admin.htk@ht-group.com (PT HTK Admin)');
  console.log('Password for all users: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
