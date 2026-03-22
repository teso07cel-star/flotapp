import { PrismaClient } from '@prisma/client'

const databaseUrl = 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_PRISMA_DATABASE_URL ||
  process.env.DATABASE_URL;

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasourceUrl: databaseUrl,
  })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
