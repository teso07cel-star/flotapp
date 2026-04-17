import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error'] });

async function verify() {
  try {
    const choferes = await prisma.chofer.count();
    const sucursales = await prisma.sucursal.count();
    const registros = await prisma.registroDiario.count();
    console.log(`✅ Base de Datos Conectada Correctamente.`);
    console.log(`📊 Datos visibles para Prisma:`);
    console.log({
      sucursales,
      choferes,
      registros
    });
  } catch (err) {
    console.error("❌ Error de conectividad Prisma:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
