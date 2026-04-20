import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  // EMERGENCY FALLBACK: La URL Pooled con los datos ya restaurados (v6.2.1)
  const POOLED_FALLBACK = "postgres://297be268d5b229f560b1d1b4be4a8f794ca14c6fe8aab949b5ca9bc4e0542063:sk_igmAkoXaDNyPkmXZhzeWl@pooled.db.prisma.io:5432/postgres?sslmode=require";

  let dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  // DETECCIÓN ESTRATÉGICA: Si la URL es la de Accelerate (que está bloqueada), forzar el uso de la Pooled
  if (dbUrl && dbUrl.includes("accelerate.prisma-data.net")) {
    console.warn("⚠️ PRISMA: Detectada conexión restringida (Accelerate). Conmutando a POOLED_FALLBACK...");
    dbUrl = POOLED_FALLBACK;
  }

  // Si no hay ninguna URL, usar el fallback por defecto
  if (!dbUrl) {
    console.warn("⚠️ PRISMA: No se detectó DATABASE_URL. Usando POOLED_FALLBACK por seguridad.");
    dbUrl = POOLED_FALLBACK;
  }

  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || 
                  process.env.NODE_ENV === 'build';

  if (isBuild) {
    console.warn("⚠️ PRISMA: Modo construcción detectado.");
    return new PrismaClient();
  }

  try {
    console.log("🚀 PRISMA: Inicializando Pool de Conexiones sobre Host:", new URL(dbUrl).host);
    const pool = new pg.Pool({ 
      connectionString: dbUrl,
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
    // Último intento sin adaptador si falla el Pool
    return new PrismaClient({ datasourceUrl: dbUrl });
  }
}

const globalForPrisma = globalThis;

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  globalForPrisma.prisma = prismaClientSingleton();
  return globalForPrisma.prisma;
}
