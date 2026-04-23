import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const vehicles = await prisma.vehiculo.findMany();
  console.log('--- VEHICLES IN PRODUCTION ---');
  vehicles.forEach(v => {
    console.log(`ID: ${v.id} | Patente: ${v.patente}`);
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
