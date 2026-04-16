import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // BYPASS DE CONSTRUCCIÓN (BUILD-TIME GUARD)
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true') {
     console.log("🛡️ PRISMA: Modo Construcción Detectado - Aplicando Proxy de Seguridad");
     return new Proxy({}, {
        get: (target, prop) => {
           // Manejar $queryRawUnsafe y otros métodos directos
           if (prop === '$queryRawUnsafe' || prop === '$connect' || prop === '$disconnect') {
              return async () => [];
           }
           // Para modelos (chofer, vehiculo, etc.) retorna un proxy con métodos stub
           return new Proxy({}, {
              get: () => async () => []
           });
        }
     });
  }

  // URL explícita: intentar DATABASE_URL, luego POSTGRES_URL
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!dbUrl) {
     console.error("⚠️ PRISMA: Sin DATABASE_URL ni POSTGRES_URL - usando Proxy vacío");
     return new Proxy({}, {
        get: (target, prop) => {
           if (prop === '$queryRawUnsafe' || prop === '$connect' || prop === '$disconnect') {
              return async () => [];
           }
           return new Proxy({}, {
              get: (target, method) => async (...args) => {
                 const methodName = method.toString();
                 console.error(`⚠️ PRISMA: Llamada a ${methodName} sin URL configurada`);
                 if (methodName.includes('Many') || methodName.includes('groupBy') || methodName.includes('Raw')) {
                    return [];
                 }
                 return null;
              }
           });
        }
     });
  }

  try {
     return new PrismaClient({
        datasources: {
           db: { url: dbUrl }
        }
     });
  } catch (err) {
     console.error("⚠️ PRISMA: Error al crear PrismaClient:", err.message);
     return new Proxy({}, {
        get: (target, prop) => {
           if (prop === '$queryRawUnsafe' || prop === '$connect' || prop === '$disconnect') {
              return async () => [];
           }
           return new Proxy({}, {
              get: (target, method) => async (...args) => {
                 const methodName = method.toString();
                 if (methodName.includes('Many') || methodName.includes('groupBy') || methodName.includes('Raw')) {
                    return [];
                 }
                 return null;
              }
           });
        }
     });
  }
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
