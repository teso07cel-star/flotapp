import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("--- RELEVAMIENTO FINAL B8.3 ---");

  const choferes = await prisma.chofer.findMany({
    select: { id: true, nombre: true }
  });
  console.log("\n👥 CHOFERES ACTUALES:");
  choferes.forEach(c => console.log(`- ${c.nombre} (ID: ${c.id})`));

  const sucursales = await prisma.sucursal.findMany({
    select: { id: true, nombre: true, direccion: true }
  });
  console.log("\n📍 SUCURSALES ACTUALES:");
  sucursales.forEach(s => console.log(`- ${s.nombre} (ID: ${s.id}) | Dir: ${s.direccion}`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
