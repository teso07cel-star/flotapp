import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Crea un proxy que intercepta todas las llamadas a Prisma
 * y devuelve valores seguros en lugar de lanzar errores fatales.
 */
function createSafetyProxy(message) {
  console.warn(`🛡️  [PRISMA SAFETY PROXY]: ${message}`);
  return new Proxy({}, {
    get: (target, prop) => {
      if (prop === '$connect' || prop === '$disconnect') return async () => {};
      if (prop === '$queryRawUnsafe' || prop === '$queryRaw') return async () => [];
      if (prop === '$transaction') {
        return async (fn) => {
          if (typeof fn === 'function') return await fn(createSafetyProxy(message));
          return [];
        };
      }
      
      return new Proxy({}, {
        get: (target, method) => async () => {
          console.warn(`🛡️  [PRISMA SECURE] Bloqueado (${message}): ${prop.toString()}.${method.toString()}`);
          const methodName = method.toString();
          if (methodName.includes('Many') || methodName.includes('groupBy') || methodName.includes('Raw') || methodName.includes('findFirst')) {
             return [];
          }
          return null;
        }
      });
    }
  });
}

const prismaClientSingleton = () => {
  // 1. GUARD DE CONSTRUCCIÓN (Vercel Build Phase)
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true') {
    return createSafetyProxy("Modo Construcción");
  }

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const options = { log: ['error'] };

  // 2. VALIDACIÓN DE URL Y SELECCIÓN DE MOTOR
  if (!dbUrl) {
    return createSafetyProxy("DATABASE_URL no definida");
  }

  try {
    if (dbUrl.startsWith('prisma://') || dbUrl.startsWith('prisma+postgres://')) {
      // SOLO usamos accelerateUrl si la URL parece válida (contiene api_key)
      if (dbUrl.includes('api_key=')) {
        options.accelerateUrl = dbUrl;
      } else {
        console.error("❌ Error: DATABASE_URL de tipo prisma:// detectada pero sin api_key.");
        return createSafetyProxy("URL de Accelerate inválida (falta api_key)");
      }
    } else {
      // Caso PostgreSQL estándar
      const pool = new Pool({ connectionString: dbUrl, max: 10 });
      options.adapter = new PrismaPg(pool);
    }

    return new PrismaClient(options);
  } catch (err) {
    console.error("🔥 Error crítico al instanciar PrismaClient:", err.message);
    return createSafetyProxy(`Fallo de Instanciación: ${err.message}`);
  }
}

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

