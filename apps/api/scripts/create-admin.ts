import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: {
      email: 'admin@krania.com',
    },
  });

  if (existing) {
    console.log('Admin already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash('admin@123', 10);

  await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@krania.com',
      passwordHash,
      role: Role.admin,
      active: true,
    },
  });

  console.log('Admin created successfully.');
}

main().finally(async () => {
  await prisma.$disconnect();
});
