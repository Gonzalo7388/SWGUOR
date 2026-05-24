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
    throw new Error('DATABASE_URL is not set.');
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

export const prisma = new Proxy<PrismaClient>(
  Object.create(PrismaClient.prototype) as PrismaClient,
  {
    get(target, prop: keyof PrismaClient) {
      return getClient()[prop];
    },
  }
);