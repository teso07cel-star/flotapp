import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("--- RELEVAMIENTO TÁCTICO B8.2 ---");

  const choferes = await prisma.chofer.findMany();
  console.log("\n👥 CHOFERES:");
  for (const c of choferes) {
    const records = await prisma.registroDiario.count({ where: { nombreConductor: c.nombre } });
    console.log(`- ${c.nombre} (ID: ${c.id}) | Registros: ${records}`);
  }

  const sucursales = await prisma.sucursal.findMany();
  console.log("\n📍 SUCURSALES:");
  for (const s of sucursales) {
    const records = await prisma.registroDiario.count({ 
      where: { sucursales: { some: { id: s.id } } } 
    });
    console.log(`- ${s.nombre} (ID: ${s.id}) | Direccion: ${s.direccion || 'S/D'} | Visitas: ${records}`);
  }

  const vehiculos = await prisma.vehiculo.findMany();
  console.log("\n🚗 VEHÍCULOS (OBJETIVO KM):");
  for (const v of vehiculos) {
    if (v.patente === "AF601QS" || v.patente === "AF668JR") {
        const records = await prisma.registroDiario.findMany({
            where: { vehiculoId: v.id },
            orderBy: { fecha: 'asc' }
        });
        const total = records.length > 0 ? (records[records.length-1].kmActual - records[0].kmActual) : 0;
        console.log(`- ${v.patente} | Registros: ${records.length} | Kilometraje actual en mes: ${total}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
