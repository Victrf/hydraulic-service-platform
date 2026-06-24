import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // clear existing plans
  await prisma.plan.deleteMany();

  // insert controlled plans
  await prisma.plan.createMany({
    data: [
      {
        name: 'Basic Plan',
        intervalMonths: 1,
      },
      {
        name: 'Standard Plan',
        intervalMonths: 3,
      },
      {
        name: 'Premium Plan',
        intervalMonths: 6,
      },
    ],
  });

  console.log('Plans seeded');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
