import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const isBuildPhase = 
    process.env.NEXT_PHASE === 'phase-production-build' || 
    process.env.IS_BUILD === 'true' || 
    process.env.CI === 'true';

  // 1. BYPASS DE CONSTRUCCIÓN (BUILD-TIME GUARD)
  if (isBuildPhase) {
     console.log("🛡️ PRISMA: Modo Construcción Detectado - Aplicando Proxy de Seguridad Silencioso");
     return new Proxy({}, {
        get: (target, prop) => {
           if (prop === '$queryRawUnsafe' || prop === '$connect' || prop === '$disconnect' || prop === 'on' || prop === '$use') {
              return async () => [];
           }
           return new Proxy({}, {
              get: () => async () => []
           });
        }
     });
  }

  // 2. OBTENCIÓN Y PREPARACIÓN DE URL
  let dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (dbUrl) {
    // Corregir advertencias de SSL en Vercel/Postgres (pg driver)
    if (!dbUrl.includes("sslmode=")) {
      dbUrl += dbUrl.includes("?") ? "&sslmode=verify-full" : "?sslmode=verify-full";
    } else {
      // Reemplazar require/prefer por verify-full para evitar el warning de alias
      dbUrl = dbUrl.replace(/sslmode=(require|prefer|verify-ca)/g, "sslmode=verify-full");
    }
  }

  if (!dbUrl) {
     console.error("⚠️ PRISMA: Sin DATABASE_URL ni POSTGRES_URL - Usando Modo Resiliente");
     return new Proxy({}, {
        get: (target, prop) => {
           return new Proxy({}, {
              get: (target, method) => async (...args) => {
                 console.error(`⚠️ PRISMA: Intento de llamada a ${method.toString()} sin URL.`);
                 return null;
              }
           });
        }
     });
  }

  try {
     console.log("🚀 PRISMA: Inicializando Cliente Real con SSL Optimizado");
     return new PrismaClient({
        datasources: {
           db: { url: dbUrl }
        },
        log: ['error']
     });
  } catch (err) {
     console.error("⚠️ PRISMA: Error crítico en inicialización:", err.message);
     return new Proxy({}, {
        get: () => new Proxy({}, { get: () => async () => null })
     });
  }
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
