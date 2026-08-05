import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

console.log("Initializing Prisma...", { 
  dbUrl: process.env.DATABASE_URL,
  nextAuthUrl: process.env.NEXTAUTH_URL 
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || "file:./dev.db",
    }),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

