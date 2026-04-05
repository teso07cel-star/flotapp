import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error("❌ ERROR: DATABASE_URL no está definida.");
    throw new Error("DATABASE_URL is not defined");
  }

  // Soporte SSL para bases de datos en la nube (prisma.io, supabase, etc)
  const isCloud = connectionString.includes("prisma.io") || connectionString.includes("supabase") || connectionString.includes("vercel");
  
  const pool = new pg.Pool({ 
    connectionString,
    connectionTimeoutMillis: 10000, 
    ssl: isCloud ? { rejectUnauthorized: false } : false
  });

  const adapter = new PrismaPg(pool);
  console.log("✅ Conectando Prisma al adaptador de base de datos...");
  return new PrismaClient({ adapter })
}

export function resetPrismaInstance() {
  console.log("♻️ Reseteando instancia de Prisma Client...");
  globalThis.prisma = undefined;
}

const globalForPrisma = globalThis

const prisma = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    if (prop === '$reset') return resetPrismaInstance;

    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = prismaClientSingleton();
    }
    return globalForPrisma.prisma[prop];
  }
});

export default prisma
