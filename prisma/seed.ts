
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

	for (const company of companies) {
		const existingCompany = await prisma.company.findUnique({
			where: { name: company.name }
		})
		if (!existingCompany) {
			await prisma.company.create({
				data: company
			})
			console.log(`✅ Created company: ${company.name}`)
		} else {
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
		await prisma.user.create({
			data: {
				name: 'Super Administrator',
				email: superAdminEmail,
				password: defaultPassword,
				role: UserRole.EXECUTIVE,
			}
		})
		console.log(`✅ Created Super Admin: ${superAdminEmail}`)
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
		},
		{
			name: 'Admin PT ZTA',
			email: 'admin@ptzta.com',
			role: UserRole.PT_ZTA_ADMIN,
		},
		{
			name: 'Admin PT TAM',
			email: 'admin@pttam.com',
			role: UserRole.PT_TAM_ADMIN,
		},
		{
			name: 'Admin PT HTK',
			email: 'admin@pthtk.com',
			role: UserRole.PT_HTK_ADMIN,
		},
		{
			name: 'Admin PT PKS',
			email: 'admin@ptpks.com',
			role: UserRole.PT_PKS_ADMIN,
		}
	]

	for (const admin of companyAdmins) {
		const existingAdmin = await prisma.user.findUnique({
			where: { email: admin.email }
		})
		if (!existingAdmin) {
			await prisma.user.create({
				data: {
					name: admin.name,
					email: admin.email,
					password: defaultPassword,
					role: admin.role,
				}
			})
			console.log(`✅ Created admin: ${admin.email}`)
		} else {
			console.log(`⚠️ Admin already exists: ${admin.email}`)
		}
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
