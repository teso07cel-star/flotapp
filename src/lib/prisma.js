import { PrismaClient } from '@prisma/client'

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL;
  const options = {
    log: ['error']
  };

  if (dbUrl) {
    if (dbUrl.includes('db.prisma.io') || dbUrl.includes('prisma://')) {
      // Caso Prisma Accelerate / Data Proxy
      options.accelerateUrl = dbUrl;
    } else {
      // Caso PostgreSQL estándar en Prisma 7: Requiere Adaptador
      const pool = new Pool({ connectionString: dbUrl });
      options.adapter = new PrismaPg(pool);
    }
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
