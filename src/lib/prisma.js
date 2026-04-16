import { PrismaClient } from '@prisma/client'

/**
 * Super Safety Proxy V2: Blindaje total ante fallos de base de datos.
 */
function createSafetyProxy(message) {
  console.warn(`🛡️  [PRISMA SAFETY PROXY]: ${message}`);
  const stubArray = async () => [];
  const stubNull = async () => null;
  const stubVoid = async () => {};

  return new Proxy({}, {
    get: (target, prop) => {
      if (prop === '$connect' || prop === '$disconnect') return stubVoid;
      if (prop === '$transaction') return async (fn) => (typeof fn === 'function' ? fn(createSafetyProxy(message)) : []);
      if (typeof prop === 'string' && prop.startsWith('$')) return stubArray;

      return new Proxy({}, {
        get: (target, method) => {
          const m = method.toString();
          if (m.includes('Many') || m.includes('groupBy') || m.includes('Raw') || m.includes('count')) return stubArray;
          return stubNull;
        }
      });
    }
  });
}

const prismaClientSingleton = () => {
  // Guard de fase de construcción en Vercel
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true') {
    return createSafetyProxy("Modo Build");
  }

  try {
    // Pattern V2: Minimalista. Prisma 7 lee la URL de DATABASE_URL automáticamente.
    // Evitamos pasar 'adapter' o 'accelerateUrl' explícitamente para prevenir errores de compatibilidad.
    return new PrismaClient({
      log: ['error']
    });
  } catch (err) {
    console.error("🔥 Error crítico en constructor Prisma:", err.message);
    return createSafetyProxy(err.message);
  }
}

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


