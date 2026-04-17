import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  console.log("🚀 PRISMA: Iniciando conexión...");
  
  if (!dbUrl) {
    console.warn("⚠️ PRISMA: No hay DATABASE_URL en .env");
    return new PrismaClient();
  }

  // Log para depuración
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`🔗 Conectando a: ${maskedUrl}`);

  try {
    const pool = new pg.Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ 
      adapter,
      log: ['error', 'warn'] 
    });
  } catch (error) {
    console.error("❌ ERROR CRÍTICO PRISMA:", error.message);
    return new PrismaClient();
  }
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
