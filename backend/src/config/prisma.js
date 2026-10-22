import { PrismaClient } from '@prisma/client';
import { NODE_ENV } from './env.js';

/**
 * Prisma Client Singleton Instance
 * Prevents multiple active connections to MySQL during development hot-reloads.
 */
const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };
export default prisma;
