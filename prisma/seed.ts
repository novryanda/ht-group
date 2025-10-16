import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Hash password for all users (using a default password)
  const defaultPassword = await bcrypt.hash('admin123', 12)

  // Create Companies
  console.log('📊 Creating companies...')

  const companies = [
    { name: 'PT NILO' },
    { name: 'PT ZTA' },
    { name: 'PT TAM' },
    { name: 'PT HTK' },
    { name: 'PT Perkebunan Sawit' }
  ]

  const createdCompanies = []

  for (const company of companies) {
    const existingCompany = await prisma.company.findUnique({
      where: { name: company.name }
    })

    if (!existingCompany) {
      const newCompany = await prisma.company.create({
        data: company
      })
      createdCompanies.push(newCompany)
      console.log(`✅ Created company: ${company.name}`)
    } else {
      createdCompanies.push(existingCompany)
      console.log(`⚠️ Company already exists: ${company.name}`)
    }
  }

  // Create Super Admin
  console.log('👑 Creating Super Admin...')

  const superAdminEmail = 'superadmin@htgroup.com'
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail }
  })

  if (!existingSuperAdmin) {
    const superAdmin = await prisma.user.create({
      data: {
        name: 'Super Administrator',
        email: superAdminEmail,
        password: defaultPassword,
        role: UserRole.EXECUTIVE,
      }
    })
    console.log(`✅ Created Super Admin: ${superAdmin.email}`)
  } else {
    console.log(`⚠️ Super Admin already exists: ${superAdminEmail}`)
  }

  // Create Admin users for each company
  console.log('👥 Creating company administrators...')

  const companyAdmins = [
    {
      name: 'Admin PT NILO',
      email: 'admin@ptnilo.com',
      role: UserRole.PT_NILO_ADMIN,
      companyName: 'PT NILO'
    },
    {
      name: 'Admin PT ZTA',
      email: 'admin@ptzta.com',
      role: UserRole.PT_ZTA_ADMIN,
      companyName: 'PT ZTA'
    },
    {
      name: 'Admin PT TAM',
      email: 'admin@pttam.com',
      role: UserRole.PT_TAM_ADMIN,
      companyName: 'PT TAM'
    },
    {
      name: 'Admin PT HTK',
      email: 'admin@pthtk.com',
      role: UserRole.PT_HTK_ADMIN,
      companyName: 'PT HTK'
    },
    {
      name: 'Admin PT PKS',
      email: 'admin@ptpks.com',
      role: UserRole.PT_PKS_ADMIN,
      companyName: 'PT Perkebunan Sawit'
    }
  ]

  for (const admin of companyAdmins) {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: admin.email }
    })

    if (!existingAdmin) {
      const company = createdCompanies.find(c => c.name === admin.companyName)

      const newAdmin = await prisma.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          password: defaultPassword,
          role: admin.role,
        }
      })

      // Create Employee record for the admin
      if (company) {
        await prisma.employee.create({
          data: {
            nama: admin.name,
            jabatan: 'Administrator',
            devisi: 'IT/Admin',
            level: 'Manager',
            tgl_masuk_kerja: new Date(),
            status_pkwt: 'TETAP',
            companyId: company.id,
            userId: newAdmin.id
          }
        })
      }

      console.log(`✅ Created admin: ${admin.email} for ${admin.companyName}`)
    } else {
      console.log(`⚠️ Admin already exists: ${admin.email}`)
    }
  }

  // Create some sample employees for demonstration
  console.log('👷 Creating sample employees...')

  const sampleEmployees = [
    {
      nama: 'John Doe',
      jenis_kelamin: 'L',
      jabatan: 'Supervisor',
      devisi: 'Operations',
      companyName: 'PT NILO'
    },
    {
      nama: 'Jane Smith',
      jenis_kelamin: 'P',
      jabatan: 'Technician',
      devisi: 'Maintenance',
      companyName: 'PT ZTA'
    },
    {
      nama: 'Ahmad Rahman',
      jenis_kelamin: 'L',
      jabatan: 'Operator',
      devisi: 'Production',
      companyName: 'PT TAM'
    }
  ]

  for (const emp of sampleEmployees) {
    const company = createdCompanies.find(c => c.name === emp.companyName)

    if (company) {
      const existingEmployee = await prisma.employee.findFirst({
        where: {
          nama: emp.nama,
          companyId: company.id
        }
      })

      if (!existingEmployee) {
        await prisma.employee.create({
          data: {
            nama: emp.nama,
            jenis_kelamin: emp.jenis_kelamin,
            jabatan: emp.jabatan,
            devisi: emp.devisi,
            level: 'Staff',
            tgl_masuk_kerja: new Date(),
            status_pkwt: 'PKWT',
            companyId: company.id
          }
        })
        console.log(`✅ Created employee: ${emp.nama} at ${emp.companyName}`)
      } else {
        console.log(`⚠️ Employee already exists: ${emp.nama}`)
      }
    }
  }

  // Create Transporters (PT PKS DataMaster)
  console.log('🚚 Creating transporters...')

  // Get first buyer for contract relation (if exists)
  const firstBuyer = await prisma.buyer.findFirst()

  // Transporter 1: Perusahaan PKP_11
  const transporter1 = await prisma.transporter.upsert({
    where: { npwp: '123456789012345' },
    update: {},
    create: {
      type: 'PERUSAHAAN',
      legalName: 'PT Angkutan Sawit Jaya',
      tradeName: 'ASJ Transport',
      npwp: '123456789012345',
      pkpStatus: 'PKP_11',
      addressLine: 'Jl. Raya Industri No. 45',
      city: 'Pekanbaru',
      province: 'Riau',
      postalCode: '28292',
      picName: 'Budi Santoso',
      picPhone: '081234567890',
      picEmail: 'budi@asjtransport.com',
      bankName: 'Bank Mandiri',
      bankAccountNo: '1234567890',
      bankAccountNm: 'PT Angkutan Sawit Jaya',
      isVerified: true,
      status: 'AKTIF',
      vehicles: {
        create: [
          {
            plateNo: 'BM 1234 AB',
            type: 'Truk Tangki',
            capacityTons: 25,
            stnkValidThru: new Date('2025-12-31'),
            kirValidThru: new Date('2025-06-30'),
            gpsId: 'GPS001',
          },
          {
            plateNo: 'BM 5678 CD',
            type: 'Truk Tangki',
            capacityTons: 30,
            stnkValidThru: new Date('2026-03-15'),
            kirValidThru: new Date('2025-09-15'),
            gpsId: 'GPS002',
          },
        ],
      },
      drivers: {
        create: [
          {
            name: 'Ahmad Yani',
            phone: '082111222333',
            nik: '1471012345678901',
            simType: 'SIM B2 Umum',
            simValidThru: new Date('2026-01-15'),
          },
          {
            name: 'Slamet Riyadi',
            phone: '082444555666',
            nik: '1471019876543210',
            simType: 'SIM B2 Umum',
            simValidThru: new Date('2025-11-20'),
          },
        ],
      },
      tariffs: {
        create: [
          {
            origin: 'Kebun Sawit A',
            destination: 'PKS Riau',
            commodity: 'TBS',
            unit: 'TON',
            price: 150000,
            includeToll: false,
            includeUnload: true,
            includeTax: false,
          },
          {
            origin: 'PKS Riau',
            destination: 'SPBE Jakarta',
            commodity: 'CPO',
            unit: 'TON',
            price: 250000,
            includeToll: true,
            includeUnload: false,
            includeTax: true,
          },
        ],
      },
      contracts: firstBuyer ? {
        create: [
          {
            contractNo: 'CONT/ASJ/2024/001',
            buyerId: firstBuyer.id,
            commodity: 'CPO',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
          },
        ],
      } : undefined,
    },
  })
  console.log(`✅ Created transporter: ${transporter1.legalName}`)

  // Transporter 2: Perorangan NON_PKP
  // Check if transporter already exists
  const existingTransporter2 = await prisma.transporter.findFirst({
    where: { legalName: 'Transportir Pak Joko' }
  })

  let transporter2
  if (!existingTransporter2) {
    transporter2 = await prisma.transporter.create({
      data: {
      type: 'PERORANGAN',
      legalName: 'Transportir Pak Joko',
      tradeName: 'Joko Transport',
      pkpStatus: 'NON_PKP',
      addressLine: 'Jl. Pasar Minggu No. 12',
      city: 'Dumai',
      province: 'Riau',
      postalCode: '28811',
      picName: 'Joko Widodo',
      picPhone: '085777888999',
      picEmail: 'joko@gmail.com',
      bankName: 'Bank BRI',
      bankAccountNo: '9876543210',
      bankAccountNm: 'Joko Widodo',
      isVerified: true,
      status: 'AKTIF',
      vehicles: {
        create: [
          {
            plateNo: 'BM 9999 XY',
            type: 'Truk Bak Terbuka',
            capacityTons: 15,
            stnkValidThru: new Date('2025-08-20'),
            kirValidThru: new Date('2025-04-10'),
          },
          {
            plateNo: 'BM 7777 ZZ',
            type: 'Truk Bak Terbuka',
            capacityTons: 18,
            stnkValidThru: new Date('2026-02-28'),
            kirValidThru: new Date('2025-10-31'),
          },
        ],
      },
      drivers: {
        create: [
          {
            name: 'Joko Widodo',
            phone: '085777888999',
            nik: '1471087654321098',
            simType: 'SIM B1',
            simValidThru: new Date('2025-12-15'),
          },
          {
            name: 'Bambang Sutrisno',
            phone: '081999888777',
            nik: '1471011223344556',
            simType: 'SIM B1',
            simValidThru: new Date('2026-05-10'),
          },
        ],
      },
      tariffs: {
        create: [
          {
            origin: 'Kebun Sawit B',
            destination: 'PKS Dumai',
            commodity: 'TBS',
            unit: 'TRIP',
            price: 500000,
            includeToll: false,
            includeUnload: false,
            includeTax: false,
          },
          {
            origin: 'Cluster C',
            destination: 'PKS Dumai',
            commodity: 'TBS',
            unit: 'KM',
            price: 5000,
            includeToll: false,
            includeUnload: false,
            includeTax: false,
          },
        ],
      },
      },
    })
    console.log(`✅ Created transporter: ${transporter2.legalName}`)
  } else {
    transporter2 = existingTransporter2
    console.log(`⚠️ Transporter already exists: ${transporter2.legalName}`)
  }

  console.log('🎉 Database seeding completed!')
  console.log('\n📋 Summary:')
  console.log('Companies created: PT NILO, PT ZTA, PT TAM, PT HTK, PT Perkebunan Sawit')
  console.log('Super Admin: superadmin@htgroup.com (password: admin123)')
  console.log('Company Admins:')
  console.log('  - admin@ptnilo.com (PT NILO Admin)')
  console.log('  - admin@ptzta.com (PT ZTA Admin)')
  console.log('  - admin@pttam.com (PT TAM Admin)')
  console.log('  - admin@pthtk.com (PT HTK Admin)')
  console.log('  - admin@ptpks.com (PT PKS Admin)')
  console.log('Transporters: 2 (1 Perusahaan PKP, 1 Perorangan Non-PKP)')
  console.log('\n🔐 Default password for all accounts: admin123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
