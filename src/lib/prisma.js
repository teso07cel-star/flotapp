import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  console.log("🚀 PRISMA: Iniciando conexión unificada...");
  
  if (!dbUrl || process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'build') {
    console.warn("⚠️ PRISMA: Modo BUILD detectado o sin URL. Devolviendo cliente dummy.");
    return new PrismaClient();
  }

  try {
    const pool = new pg.Pool({ 
      connectionString: dbUrl,
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    const adapter = new PrismaPg(pool);
    const client = new PrismaClient({ 
      adapter,
      log: ['error'] 
    });
    
    return client;
  } catch (error) {
    console.error("❌ ERROR CRÍTICO PRISMA:", error.message);
    return new PrismaClient();
  }
}

const globalForPrisma = globalThis

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  
  const client = prismaClientSingleton();
  globalForPrisma.prisma = client;
  return client;
}
