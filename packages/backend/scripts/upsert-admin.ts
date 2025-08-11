import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@chroniclex.dev';
  const username = 'admin';
  const password = 'AdminPass123!';
  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { username, passwordHash, role: 'ADMIN' },
    create: { email, username, passwordHash, role: 'ADMIN' }
  });

  console.log('Admin ensured:', { id: user.id, email: user.email, username: user.username, role: user.role });
  console.log('Credentials ->', { email, username, password });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
