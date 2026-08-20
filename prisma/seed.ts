import { prisma } from '../src/lib/prisma';
import { PlatformRole } from '../src/generated/prisma/enums';

import bcrypt from 'bcrypt';

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  const superAdmin = await prisma.platformUser.upsert({
    where: { email: 'admin@yourplatform.com' },
    update: {},
    create: {
      email: 'admin@mytravelcrm.com',
      passwordHash,
      fullName: 'Platform Owner',
      role: PlatformRole.SUPER_ADMIN,
    },
  });

  console.log('Seeded platform user:', superAdmin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });