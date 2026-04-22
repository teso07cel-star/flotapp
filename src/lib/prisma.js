import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

/**
 * BLINDAJE ESTRUCTURAL v9.5.2 (ADAPTER-READY)
 * Estabilización final usando el adaptador nativo de PG para evitar fallos de inicialización.
 */

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL no detectada. Operando en Modo Resiliente (Build/Fallback).");
    return new PrismaClient();
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const getPrisma = () => prisma;
export default prisma;
