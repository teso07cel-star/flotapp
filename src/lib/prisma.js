import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL;
  const options = {
    log: ['error']
  };

  // En Prisma 7, si usamos un proxy de datos (db.prisma.io o prisma://), 
  // debemos pasarlo como accelerateUrl. datasources y datasourceUrl ya no son válidos.
  if (dbUrl && (dbUrl.includes('db.prisma.io') || dbUrl.includes('prisma://'))) {
    options.accelerateUrl = dbUrl;
  }

  return new PrismaClient(options);
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
