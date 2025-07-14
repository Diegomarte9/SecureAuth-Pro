import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = 'Soporte@2511';
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email: 'soportemdev@gmail.com' },
    update: {},
    create: {
      username: 'Soportemdev',
      email: 'soportemdev@gmail.com',
      first_name: 'Soporte',
      last_name: 'Mdev',
      password_hash: passwordHash,
      role: 'ADMIN',
      status: 'active',
      is_active: true,
      is_verified: true,
    },
  });
  console.log('Usuario admin creado o actualizado');
}

main().finally(() => prisma.$disconnect()); 