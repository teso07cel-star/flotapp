import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let prisma;

/**
 * Inicialización Táctica v8.4.7 (REPARACIÓN DE EMERGENCIA)
 * Se blinda contra fallos de inicialización y se priorizan variables de entorno.
 */
function createPrismaClient() {
  // Priorizar DIRECT_URL (Directa a DB) sobre DATABASE_URL (Proxy/Pool)
  // Se usa un fallback 'dummy' solo para evitar el error de inicialización de Prisma en el build.
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
  
  if (!connectionString || connectionString.includes('null:5432')) {
    if (process.env.NODE_ENV === 'production') {
      console.warn("⚠️ ALERTA: Sin URL válida en producción. Modo degradado activo.");
    }
  }

  // Si la URL es de tipo prisma:// (Accelerate), no usamos adaptador de pg
  if (connectionString.startsWith('prisma://')) {
    return new PrismaClient();
  }

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
