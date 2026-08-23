import { PrismaClient } from "@prisma/client";

// Verhindert im Next.js-Dev-Modus (Hot Reload) das mehrfache Erzeugen von
// PrismaClient-Instanzen, was sonst schnell zu "too many connections" führt.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
