import { PrismaClient } from '@prisma/client';

let prisma;

/**
 * Inicialización Táctica v9.1 (BLINDAJE DE CONEXIÓN)
 * Conexión nativa de Prisma para evitar fallos de tiempo de espera (congelamiento) en Vercel.
 */
function createPrismaClient() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  
  if (!connectionString || connectionString.includes('null:5432')) {
     // Si no hay URL, proporcionamos una dummy para que el constructor no explote en el build
     return new PrismaClient({
       datasources: {
         db: { url: 'postgresql://postgres:postgres@localhost:5432/postgres' }
       }
     });
  }

  // Permite que Prisma gestione la conexión al Pooler en un entorno Serverless
  return new PrismaClient();
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
