import { prisma } from '../src/lib/prisma';
import { PlatformRole } from '../src/generated/prisma/enums';
import bcrypt from 'bcrypt';

export async function seedPlatformUser() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  const superAdmin = await prisma.platformUser.upsert({
    where: {
      email: 'admin@mytravelcrm.com',
    },
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