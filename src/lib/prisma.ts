
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

    const makeUnavailable = () => {
      const thrower = () => {
        throw new Error('Prisma client unavailable: DATABASE_URL is not set');
      };

      const proxy = new Proxy(thrower as any, {
        get() {
          return proxy;
        },
        apply() {
          throw new Error('Prisma client unavailable: DATABASE_URL is not set');
        },
      });

      // Mark proxy so callers can detect availability without invoking it
      (proxy as any).__prisma_unavailable = true;

      return proxy as unknown as PrismaClient;
    };

    return makeUnavailable();
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
export const prismaAvailable = !(prisma as any).__prisma_unavailable;