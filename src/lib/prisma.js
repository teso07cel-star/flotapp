import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true';

  if (isBuildPhase) {
    console.log("🛡️ PRISMA: Modo Construcción Detectado - Aplicando Proxy de Seguridad");
    return createPrismaProxy("BUILD_PHASE");
  }

  return new PrismaClient({
    log: ['error']
  });
}

function createPrismaProxy(errorMessage) {
  return new Proxy({}, {
    get: (target, prop) => {
      return new Proxy({}, {
        get: (target, method) => async () => {
          console.warn(`[PRISMA SECURE] Bloqueado (${errorMessage}): ${prop.toString()}.${method.toString()}`);
          if (method.toString().includes('Many') || method.toString().includes('groupBy')) return [];
          return null;
        }
      });
    }
  });
}

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
