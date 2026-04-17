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

  let client;
  try {
    const pool = new pg.Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    client = new PrismaClient({ 
      adapter,
      log: ['error', 'warn'] 
    });
    
    // GUARDIA DE AUTO-SEEDING (TACTICA b4.0)
    // Solo se ejecuta en producción si la base está vacía
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
       console.log("🔍 PRISMA: Verificando integridad de datos...");
       client.chofer.count().then(count => {
          if (count === 0) {
             console.log("🌱 PRISMA: Base vacía detectada. Iniciando Auto-Seeding de Emergencia...");
             const seedUrl = (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000') + '/api/maintenance/seed';
             fetch(seedUrl).catch(e => console.error("❌ ERROR AUTO-SEED:", e.message));
          }
       }).catch(e => console.error("⚠️ PRISMA: Error en guardia de seeding:", e.message));
    }

    return client;
  } catch (error) {
    console.error("❌ ERROR CRÍTICO PRISMA:", error.message);
    return new PrismaClient();
  }
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
