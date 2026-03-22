import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

// En Prisma 7 con la integración de Prisma Postgres, el cliente se encarga de todo.
// Solo nos aseguramos de no crear mil instancias en desarrollo.

const prismaClientSingleton = () => {
  return new PrismaClient()
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
