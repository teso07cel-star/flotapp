import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let prisma;

/**
 * Inicialización Táctica v8.4.1 (NUCLEAR BYPASS)
 * Prioriza la conexión directa a Supabase para saltar límites de Prisma Accelerate.
 */
function createPrismaClient() {
  // FUERZA BRUTA: Usamos la conexión directa de Supabase detectada
  const directUrl = 'postgresql://postgres.siqxydghsjmvmjgkmvps:admin123@db.siqxydghsjmvmjgkmvps.supabase.co:5432/postgres';
  const connectionString = process.env.DATABASE_URL || directUrl;
  
  console.log("🛠️ NUCLEAR BYPASS v2: Conectando directamente a Supabase...");

  const pool = new pg.Pool({ 
    connectionString: directUrl, // Forzamos la directa pase lo que pase
    max: 5, // Más ligero para evitar cuellos de botella
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
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
