import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient のシングルトン。
 * Next.js の開発時ホットリロードでコネクションが増え続けるのを防ぐ。
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
