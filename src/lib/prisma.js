import { PrismaClient } from '@prisma/client';
// CACHE BUSTER: 1778013137018
const prismaClientSingleton = () => {
  return new PrismaClient({ log: ['error'] });
};
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
export const getPrisma = () => prisma;
