import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // EMERGENCY FALLBACK: La URL Pooled con los datos ya restaurados (v6.2.1)
  const POOLED_URL = process.env.DATABASE_URL || "postgres://297be268d5b229f560b1d1b4be4a8f794ca14c6fe8aab949b5ca9bc4e0542063:sk_igmAkoXaDNyPkmXZhzeWl@pooled.db.prisma.io:5432/postgres?sslmode=require";

  try {
    console.log("🚀 PRISMA: Inicializando Conexión Serverless NATIVA...");
    
    return new PrismaClient({ 
      datasources: { db: { url: POOLED_URL } },
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
