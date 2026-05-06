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
    let databaseUrl = process.env.NUEVA_URL || process.env.DATABASE_URL || TACTICAL_URL;
    
    // AUTO-FIX: Supabase Connection Pool (Fix for MAX CLIENTS REACHED IN SESSION MODE)
    if (databaseUrl && databaseUrl.includes('supabase.com') && databaseUrl.includes(':5432')) {
       databaseUrl = databaseUrl.replace(':5432', ':6543');
       if (!databaseUrl.includes('pgbouncer=true')) {
          databaseUrl += databaseUrl.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
       }
       console.log("🛡️ AUTO-FIX: Supabase Pooler activado en puerto 6543");
    }
    
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
