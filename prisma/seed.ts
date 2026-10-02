import { prisma } from '../src/lib/prisma';
import { seedPlatformUser } from './platform-user-seed';
import { seedTenants } from './seed-tenants';

async function main() {
  console.log('Starting database seeding...');
  // await seedPlatformUser();
  await seedTenants();
  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });