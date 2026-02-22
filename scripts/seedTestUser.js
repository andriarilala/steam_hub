const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  const prisma = new PrismaClient();
  const email = 'test@example.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Test user already exists');
    return;
  }
  const hashed = await bcrypt.hash('Password123!', 10);
  await prisma.user.create({
    data: {
      email,
      name: 'Test User',
      role: 'youth',
      hashedPassword: hashed,
    },
  });
  console.log('Test user created with email', email, 'and password Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit());
