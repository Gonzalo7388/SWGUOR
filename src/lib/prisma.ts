
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AsyncLocalStorage } from 'async_hooks';

// ── Almacén del usuario por request (seguro con concurrencia) ──────────────
export const auditUserStore = new AsyncLocalStorage<{ userId: bigint }>();

// ── Singleton global ───────────────────────────────────────────────────────
const globalForPrisma = global as unknown as { prisma: PrismaClient };

function buildClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString || connectionString === 'undefined') {
    // Build de Vercel sin variables disponibles — cliente mínimo
    return new PrismaClient();
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
  });
}

let prismaInstance: PrismaClient;

if (typeof window === 'undefined') {
  prismaInstance = globalForPrisma.prisma ?? buildClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma = prismaInstance!;