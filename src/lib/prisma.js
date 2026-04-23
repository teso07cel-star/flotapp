import { PrismaClient } from '@prisma/client';

/**
 * ESTABILIZACIÓN NUCLEAR v10.0
 * Retornando al cliente estándar de Prisma para máxima compatibilidad con Vercel Integrations.
 */

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const getPrisma = () => prisma;
export default prisma;
