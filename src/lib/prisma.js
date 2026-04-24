import { PrismaClient } from '@prisma/client';

/**
 * ESTABILIZACIÓN NUCLEAR v10.0
 * Retornando al cliente estándar de Prisma para máxima compatibilidad con Vercel Integrations.
 */

const globalForPrisma = globalThis;

let prisma = globalForPrisma.prisma;

export const getPrisma = () => {
  if (!prisma) {
    const databaseUrl = process.env.NUEVA_URL || process.env.DATABASE_URL;
    const directUrl = process.env.NUEVA_URL_NON_POOLING || process.env.DIRECT_URL;
    
    if (process.env.NUEVA_URL) {
      console.log("🚀 Usando variables de integración (NUEVA_URL)");
    }

    prisma = new PrismaClient({
      datasources: {
        db: { url: databaseUrl },
      },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prisma;
};

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default getPrisma();
