import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let prisma;

/**
 * Inicialización Táctica v8.4.4 (NUCLEAR BYPASS)
 * Optimizado para Prisma 7.5.0 sin URL en el esquema.
 */
function createPrismaClient() {
  const directUrl = 'postgresql://postgres.siqxydghsjmvmjgkmvps:admin123@db.siqxydghsjmvmjgkmvps.supabase.co:5432/postgres';
  
  console.log("🛠️ NUCLEAR BYPASS v2.1: Conexión Directa Supabase Activa");

  const pool = new pg.Pool({ 
    connectionString: directUrl,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  const adapter = new PrismaPg(pool);
  
  // En Prisma 7 con adaptador, el cliente se encarga de usar el datasource configurado en el config o el adapter
  return new PrismaClient({ adapter });
}

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }
  prisma = global.prisma;
}

export const getPrisma = () => prisma;
export default prisma;
