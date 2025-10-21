// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Disable all Prisma logging
process.env.DEBUG = '';
process.env.PRISMA_QUERY_ENGINE_DEBUG = '';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [], // Explicitly disable all logging
    errorFormat: 'minimal', // Reduce error verbosity
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
