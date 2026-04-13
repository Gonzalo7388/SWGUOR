import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Asegúrate de que DATABASE_URL esté en tu .env y apunte a Supabase (puerto 5432 o 6543 si es pgbouncer)
const connectionString = `${process.env.DATABASE_URL}`;

// Instanciamos el pool de conexiones de pg
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;