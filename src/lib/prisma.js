import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error("❌ ERROR: DATABASE_URL no está definida.");
    throw new Error("DATABASE_URL is not defined");
  }

  // Soporte SSL para bases de datos en la nube
  const isCloud = connectionString.includes("prisma.io") || connectionString.includes("supabase") || connectionString.includes("vercel");
  
  const pool = new pg.Pool({ 
    connectionString,
    connectionTimeoutMillis: 20000, // Aumentado a 20s para resiliencia en Vercel
    query_timeout: 15000,          // Timeout de query de 15s
    max: 10,                       // Límite de conexiones para evitar saturación serverless
    ssl: isCloud ? { rejectUnauthorized: false } : false
  });

  const adapter = new PrismaPg(pool);
  console.log("✅ Conectando Prisma al adaptador resiliente de base de datos...");
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
