import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AsyncLocalStorage } from 'async_hooks';

export const auditUserStore = new AsyncLocalStorage<{ userId: bigint }>();

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

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

function getClient(): PrismaClient {
  if (typeof window !== 'undefined') {
    throw new Error('Prisma cannot be used on the client side.');
  }

  global.prismaGlobal ??= buildClient();

  return global.prismaGlobal;
}

export const prisma = prismaInstance!;
export const prismaAvailable = !(prisma as any).__prisma_unavailable;
