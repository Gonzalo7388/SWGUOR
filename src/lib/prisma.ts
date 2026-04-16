import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (typeof window === "undefined") { // Solo ejecutar en el servidor
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString || connectionString === "undefined") {
    // Durante el build de Vercel, a veces las variables no están disponibles
    // o el build intenta minificar archivos. Evitamos el crash.
    prismaInstance = globalForPrisma.prisma || new PrismaClient();
  } else {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
    });
  }
}

export const prisma = prismaInstance!;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;