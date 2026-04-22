import { PrismaClient } from '@prisma/client';

let prisma;

/**
 * Inicialización Táctica v9.1 (BLINDAJE DE CONEXIÓN)
 * Conexión nativa de Prisma para evitar fallos de tiempo de espera (congelamiento) en Vercel.
 */
function createPrismaClient() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  
  // Si no hay URL (común en pasos de build estáticos de Vercel), proporcionamos una dummy
  if (!connectionString || connectionString.includes('null:5432')) {
     return new PrismaClient({
       datasources: {
         db: { url: 'postgresql://postgres:postgres@localhost:5432/postgres' }
       }
     });
  }

  // Permite que Prisma gestione la conexión al Pooler en un entorno Serverless
  return new PrismaClient({
    datasources: {
      db: { url: connectionString }
    }
  });
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
