import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing plans
  await prisma.plan.deleteMany();

  // Insert plans
  await prisma.plan.createMany({
    data: [
      {
        name: 'Basic Plan',
        intervalMonths: 1,
        frequency: 'Monthly',
        price: 1000,
      },
      {
        name: 'Standard Plan',
        intervalMonths: 3,
        frequency: 'Quarterly',
        price: 2500,
      },
      {
        name: 'Premium Plan',
        intervalMonths: 6,
        frequency: 'Half-Yearly',
        price: 4500,
      },
    ],
  });

  console.log('Plans seeded');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
