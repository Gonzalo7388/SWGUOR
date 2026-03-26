import { PrismaClient } from '@prisma/client';

interface PrismaConfig {
  datasources?: {
    db?: {
      url?: string;
    };
  };
  log?: ('query' | 'error' | 'warn' | 'info')[];
}

const prismaClientSingleton = () => {
  const config: PrismaConfig = {
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  };

  return new PrismaClient(config as any); 

};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;