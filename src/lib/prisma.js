
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const TACTICAL_URL = "postgres://prisma:694f47952e47614e5b8823d6837a718c@db.prisma.io/prisma-postgres-flecha-rosa?sslmode=require";
  let databaseUrl = process.env.NUEVA_URL || process.env.DATABASE_URL || TACTICAL_URL;
  
  // Forzar pooler de transacciones si es Supabase (puerto 6543) o limitar conexiones
  if (!databaseUrl.includes("connection_limit")) {
    databaseUrl += (databaseUrl.includes("?") ? "&" : "?") + "connection_limit=2";
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: ['error'],
  });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  
  // Bootstrap de emergencia
  prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Chofer" ("id" SERIAL PRIMARY KEY, "nombre" TEXT UNIQUE NOT NULL);
    CREATE TABLE IF NOT EXISTS "Autorizacion" ("id" SERIAL PRIMARY KEY, "fecha" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, "nombre" TEXT NOT NULL, "patente" TEXT NOT NULL, "estado" TEXT DEFAULT 'PENDIENTE');
  `).catch(e => console.error("Bootstrap deferred:", e.message));

  return prisma;
};

const prisma = getPrisma();
export default prisma;
