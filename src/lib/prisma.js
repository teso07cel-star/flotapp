import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  console.log("🚀 PRISMA: Iniciando conexión unificada...");
  
  if (!dbUrl) {
    console.warn("⚠️ PRISMA: No hay DATABASE_URL configurada");
    return new PrismaClient();
  }

  try {
    const pool = new pg.Pool({ 
      connectionString: dbUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    const adapter = new PrismaPg(pool);
    const client = new PrismaClient({ 
      adapter,
      log: ['error', 'warn'] 
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
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
}
