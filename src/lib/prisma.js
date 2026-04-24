import { PrismaClient } from '@prisma/client';

/**
 * MOTOR DE CONEXIÓN ULTRA-RESILIENTE v11.0
 * Protocolo de Emergencia: Bypass total de Vercel Integrations.
 */

const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;

export const getPrisma = () => {
  if (!prisma) {
    // CLAVE TÁCTICA DE EMERGENCIA (Bypass absoluto)
    const TACTICAL_URL = "postgres://prisma:694f47952e47614e5b8823d6837a718c@db.prisma.io/prisma-postgres-flecha-rosa?sslmode=require";
    
    // Prioridad: NUEVA_URL -> DATABASE_URL -> TACTICAL_URL
    const databaseUrl = process.env.NUEVA_URL || process.env.DATABASE_URL || TACTICAL_URL;
    
    console.log("🛡️ MOTOR DE DATOS BLINDADO INICIADO");

    prisma = new PrismaClient({
      datasources: {
        db: { url: databaseUrl },
      },
      log: ['error'], 
    });
  }
  return prisma;
};

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default getPrisma();
