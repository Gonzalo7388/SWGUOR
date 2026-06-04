const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const total = await prisma.ordenes_produccion.count();
    console.log('TOTAL_ORDENES_PRODUCCION:', total);
    const sample = await prisma.ordenes_produccion.findMany({ take: 5 });
    console.log('SAMPLE:', sample);
  } catch (e) {
    console.error('ERROR', e);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
})();
