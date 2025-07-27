import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/generated/prisma"

export async function createUser(data: {
  email: string
  password: string
  name?: string
  role?: UserRole
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12)
  
  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || UserRole.MEMBER,
    },
  })
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}
