import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// === GLOBAL DATE CRASH PROTECTOR ===
// Next.js React Server Serializer calls .toISOString() implicitly on Date objects passing from Server to Client.
// If a DB Date is out of bounds (e.g. year > 9999), V8 throws a RangeError which crashes Vercel (Error 1273075880).
// This monkey-patch gracefully falls back to a 1970 date instead of taking down the entire server route.
const originalToISOString = Date.prototype.toISOString;
Date.prototype.toISOString = function (...args) {
  try {
    return originalToISOString.apply(this, args);
  } catch (err) {
    return "1970-01-01T00:00:00.000Z";
  }
};
// ===================================

const prismaClientSingleton = () => {
  const envUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  // Usamos esta URL como principal porque es la única que hemos verificado que funciona y tiene los datos
  const PRIMARY_URL = "postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require&connect_timeout=300";
  
  const connectionString = envUrl && !envUrl.includes("supabase.co") ? envUrl : PRIMARY_URL;
  
  const pool = new pg.Pool({ 
    connectionString,
    connectionTimeoutMillis: 30000, // 30 segundos de timeout
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis

/**
 * Proxy para inicialización perezosa (Lazy) de Prisma.
 * Esto evita que el build de Next.js falle al evaluar el módulo 
 * si la base de datos no está disponible en ese preciso instante.
 */
const prisma = new Proxy({}, {
  get(target, prop) {
    // Si se intenta tratar al proxy como una promesa, devolvemos undefined
    if (prop === 'then') return undefined;

    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = prismaClientSingleton();
    }
    return globalForPrisma.prisma[prop];
  }
});

export default prisma
