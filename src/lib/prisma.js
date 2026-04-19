import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || 
                  process.env.NODE_ENV === 'build' || 
                  !dbUrl;

  if (isBuild) {
    console.warn("⚠️ PRISMA: Modo construcción o sin URL detectado. Cliente en espera.");
    return new PrismaClient();
  }

  try {
    console.log("🚀 PRISMA: Inicializando Pool de Conexiones...");
    const pool = new pg.Pool({ 
      connectionString: dbUrl,
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    pool.on('error', (err) => console.error('❌ Error imprevisto en Pool de PG:', err));

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ 
      adapter,
      log: ['error'] 
    });
  } catch (error) {
    console.error("❌ ERROR CRÍTICO EN INICIALIZACIÓN DE PRISMA:", error.message);
    return new PrismaClient();
  }
}

const globalForPrisma = globalThis;

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  globalForPrisma.prisma = prismaClientSingleton();
  return globalForPrisma.prisma;
}
