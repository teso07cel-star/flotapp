import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let prisma;

/**
 * Inicialización Táctica v8.4.5 (RESILIENCIA NUCLEAR)
 * Se eliminan URLs hardcodeadas y se prioriza la conexión directa vía Vercel (DIRECT_URL).
 */
function createPrismaClient() {
  // Priorizar DIRECT_URL (Directa a DB) sobre DATABASE_URL (Proxy/Pool)
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ ERROR: No se encontró DATABASE_URL o DIRECT_URL");
    // Fallback silencioso (retornará errores en consultas, capturados por resiliencia nuclear)
    return new PrismaClient();
  }

  // Si la URL es de tipo prisma:// (Accelerate), no usamos adaptador de pg
  if (connectionString.startsWith('prisma://')) {
    console.log("🚀 CONEXIÓN VIA ACCELERATE (PRISMA PROXY)");
    return new PrismaClient();
  }

  console.log("🛠️ CONEXIÓN DIRECTA (ADAPTER PG) ACTIVA");

  const pool = new pg.Pool({ 
    connectionString,
    max: 5,
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
