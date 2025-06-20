import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('YourSecurePassword', 12);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'Example',
      password_hash: passwordHash,
      role: 'ADMIN',
      status: 'active',
      is_active: true,
      is_verified: true,
    },
  });
  console.log('Example admin user created or updated');
}

main().finally(() => prisma.$disconnect()); 