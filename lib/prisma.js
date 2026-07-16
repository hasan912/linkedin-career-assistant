import { PrismaClient } from "@prisma/client";

// Prevent creating multiple Prisma Client instances in dev (hot reload)
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
