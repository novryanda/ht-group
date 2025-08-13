import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkExecutiveUser() {
  console.log('🔍 Checking executive user data...');
  
  // Find executive user
  const user = await prisma.user.findUnique({
    where: { email: 'executive@ht-group.com' },
    include: {
      employee: {
        include: {
          company: true
        }
      }
    }
  });
  
  console.log('Executive User (executive@ht-group.com):', JSON.stringify(user, null, 2));
  
  // Check all users
  const allUsers = await prisma.user.findMany({
    include: {
      employee: {
        include: {
          company: true
        }
      }
    }
  });
  
  console.log('All Users:', JSON.stringify(allUsers, null, 2));
  
  await prisma.$disconnect();
}

checkExecutiveUser().catch(console.error);
