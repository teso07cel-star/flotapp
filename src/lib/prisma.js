import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let prisma;

/**
 * Inicialización Táctica v8.6 (BLINDAJE LIGERO)
 * Removidas URLs hardcodeadas para evitar rechazos por seguridad.
 */
function createPrismaClient() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
  
  if (!connectionString || connectionString.includes('null:5432')) {
     // Si no hay URL, proporcionamos una dummy para que el constructor no explote en build
     return new PrismaClient({
       datasources: {
         db: { url: 'postgresql://postgres:postgres@localhost:5432/postgres' }
       }
     });
  }

  if (connectionString.startsWith('prisma://')) {
    return new PrismaClient();
  }

  const pool = new pg.Pool({ 
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // Menos tiempo de espera para reaccionar más rápido
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
