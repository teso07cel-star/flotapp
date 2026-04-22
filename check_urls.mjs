import pkg from 'pg';
const { Pool } = pkg;
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const URLS = [
  { name: 'ENV_URL', url: 'postgres://297be268d5b229f560b1d1b4be4a8f794ca14c6fe8aab949b5ca9bc4e0542063:sk_YkfRXETKpERjvQa772uH4@pooled.db.prisma.io:5432/postgres?sslmode=require' },
  { name: 'MIGRATION_SCRIPT_URL', url: 'postgres://297be268d5b229f560b1d1b4be4a8f794ca14c6fe8aab949b5ca9bc4e0542063:sk_igmAkoXaDNyPkmXZhzeWl@pooled.db.prisma.io:5432/postgres?sslmode=require' }
];

async function check(urlObj) {
  console.log(`\n--- Checking ${urlObj.name} ---`);
  const pool = new Pool({ connectionString: urlObj.url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const vCount = await prisma.vehiculo.count();
    const sCount = await prisma.sucursal.count();
    const cCount = await prisma.chofer.count();
    const rCount = await prisma.registroDiario.count();
    
    console.log(`Vehículos: ${vCount}`);
    console.log(`Sucursales: ${sCount}`);
    console.log(`Choferes: ${cCount}`);
    console.log(`Registros: ${rCount}`);

    if (vCount > 0) {
        const sampleV = await prisma.vehiculo.findFirst();
        console.log(`Sample Vehicle Patente: ${sampleV.patente}`);
    }
  } catch (err) {
    console.error(`Error in ${urlObj.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

async function main() {
  for (const urlObj of URLS) {
    await check(urlObj);
  }
}

main();
