import { PrismaClient } from '@prisma/client';

/**
 * Prisma client wrapper that does not crash the app when DATABASE_URL is
 * missing. We expose a typed proxy that lazily instantiates the real
 * PrismaClient and a `hasDatabase` flag that callers can use to short-circuit
 * before performing queries.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const hasDatabase = Boolean(process.env.DATABASE_URL);

function buildClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });
}

function getClient(): PrismaClient {
  if (!hasDatabase) {
    throw new Error('DATABASE_URL is not configured. Set it in your environment to use the database.');
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = buildClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop);
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
