import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  // EMERGENCY FALLBACK: La URL Pooled con los datos ya restaurados (v6.2.1)
  const POOLED_URL = "postgres://297be268d5b229f560b1d1b4be4a8f794ca14c6fe8aab949b5ca9bc4e0542063:sk_igmAkoXaDNyPkmXZhzeWl@pooled.db.prisma.io:5432/postgres?sslmode=require";

  try {
    console.log("🚀 PRISMA: Inicializando Pool de Conexiones DIRECTO (Bypass Accelerate)...");
    const pool = new pg.Pool({ 
      connectionString: POOLED_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    });
    
    pool.on('error', (err) => console.error('❌ Error imprevisto en Pool de PG:', err));

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ 
      adapter,
      log: ['error'] 
    });
  } catch (error) {
    console.error("❌ ERROR CRÍTICO EN INICIALIZACIÓN DE PRISMA:", error.message);
    // Intentamos instanciar Prisma directamente con la URL si el adaptador falla
    return new PrismaClient({ 
      datasources: { db: { url: POOLED_URL } }
    });
  }
}

const globalForPrisma = globalThis;

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  globalForPrisma.prisma = prismaClientSingleton();
  return globalForPrisma.prisma;
}
