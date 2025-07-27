import { PrismaClient, UserRole } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Super Admin user
  const superAdminPassword = await bcrypt.hash('superadmin123', 12)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@htgroup.com' },
    update: {},
    create: {
      email: 'superadmin@htgroup.com',
      name: 'Super Admin',
      password: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  })

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@htgroup.com' },
    update: {},
    create: {
      email: 'admin@htgroup.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  // Create Member user
  const memberPassword = await bcrypt.hash('member123', 12)
  const member = await prisma.user.upsert({
    where: { email: 'member@htgroup.com' },
    update: {},
    create: {
      email: 'member@htgroup.com',
      name: 'Member User',
      password: memberPassword,
      role: UserRole.MEMBER,
      isActive: true,
    },
  })

  console.log('✅ Seeding completed!')
  console.log('📧 Test users created:')
  console.log('   Super Admin: superadmin@htgroup.com / superadmin123')
  console.log('   Admin: admin@htgroup.com / admin123')
  console.log('   Member: member@htgroup.com / member123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
