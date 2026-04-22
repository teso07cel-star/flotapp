import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let prisma;

/**
 * Inicialización Táctica v8.4.8 (BLINDAJE TOTAL)
 * Corregido error de inyección de código y aseguramiento de build estable.
 */
function createPrismaClient() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
  
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
