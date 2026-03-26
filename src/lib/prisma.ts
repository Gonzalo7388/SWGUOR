import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    // Esto evita que falle silenciosamente y te da un error claro en los logs
    console.error("CRÍTICO: DATABASE_URL no está definida en las variables de entorno.");
  }
  return new PrismaClient();
};

declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;