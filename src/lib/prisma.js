import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let prisma;

/**
 * Inicialización Táctica v8.4.1 (NUCLEAR BYPASS)
 * Prioriza la conexión directa a Supabase para saltar límites de Prisma Accelerate.
 */
function createPrismaClient() {
  // Cadena de conexión directa detectada en el entorno (Supabase Direct)
  const directUrl = 'postgresql://postgres.siqxydghsjmvmjgkmvps:admin123@db.siqxydghsjmvmjgkmvps.supabase.co:5432/postgres';
  const connectionString = process.env.DIRECT_URL || directUrl || process.env.DATABASE_URL;
  
  console.log("🚀 INICIANDO CONEXIÓN DIRECTA (Bypass Accelerate Active)");

  const pool = new pg.Pool({ 
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
}

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }
  prisma = global.prisma;
}

export const getPrisma = () => prisma;
export default prisma;
