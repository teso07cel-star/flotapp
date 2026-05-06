import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;

export const getPrisma = () => {
  if (!prisma) {
    // La verdadera URL de Supabase del usuario
    const TRUE_SUPABASE_URL = "postgresql://postgres.siqxydghsjmvmjgkmvps:admiflotappbriana1227@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
    
    // Forzamos el uso de la verdadera URL (ignora la de Vercel si está mal configurada)
    const databaseUrl = TRUE_SUPABASE_URL;

    console.log("🛡️ MOTOR DE DATOS BLINDADO INICIADO (URL REAL)");

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
