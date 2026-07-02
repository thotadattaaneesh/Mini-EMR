const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Mark Johnson
  const mark = await prisma.user.upsert({
    where: { email: 'mark@some-email-provider.net' },
    update: {},
    create: {
      name: 'Mark Johnson',
      email: 'mark@some-email-provider.net',
      password: await bcrypt.hash('Password123!', 12),
      appointments: {
        create: [
          {
            provider: 'Dr Kim West',
            datetime: new Date('2026-04-16T16:30:00.000-07:00'),
            repeat: 'weekly',
          },
          {
            provider: 'Dr Lin James',
            datetime: new Date('2026-04-19T18:30:00.000-07:00'),
            repeat: 'monthly',
          },
        ],
      },
      prescriptions: {
        create: [
          {
            medication: 'Lexapro',
            dosage: '5mg',
            quantity: 2,
            refill_on: new Date('2026-04-05'),
            refill_schedule: 'monthly',
          },
          {
            medication: 'Ozempic',
            dosage: '1mg',
            quantity: 1,
            refill_on: new Date('2026-04-10'),
            refill_schedule: 'monthly',
          },
        ],
      },
    },
  });

  // 2. Create Lisa Smith
  const lisa = await prisma.user.upsert({
    where: { email: 'lisa@some-email-provider.net' },
    update: {},
    create: {
      name: 'Lisa Smith',
      email: 'lisa@some-email-provider.net',
      password: await bcrypt.hash('Password123!', 12),
      appointments: {
        create: [
          {
            provider: 'Dr Sally Field',
            datetime: new Date('2026-04-22T18:15:00.000-07:00'),
            repeat: 'monthly',
          },
          {
            provider: 'Dr Lin James',
            datetime: new Date('2026-04-25T20:00:00.000-07:00'),
            repeat: 'weekly',
          },
        ],
      },
      prescriptions: {
        create: [
          {
            medication: 'Metformin',
            dosage: '500mg',
            quantity: 2,
            refill_on: new Date('2026-04-15'),
            refill_schedule: 'monthly',
          },
          {
            medication: 'Diovan',
            dosage: '100mg',
            quantity: 1,
            refill_on: new Date('2026-04-25'),
            refill_schedule: 'monthly',
          },
        ],
      },
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
