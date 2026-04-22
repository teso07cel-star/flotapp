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
     process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
  } else {
     // Forzamos la variable de entorno para que Prisma la tome automáticamente sin parámetros
     process.env.DATABASE_URL = connectionString;
  }

  // Inicialización limpia sin opciones, evitando "Unknown property datasources"
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
