// script to verify prisma and user data
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    console.log('found user:', user);
  } catch (e) {
    console.error('error querying user:', e);
  } finally {
    await prisma.$disconnect();
  }
})();