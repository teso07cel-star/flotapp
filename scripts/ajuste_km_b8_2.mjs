import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixVehicle(patente, targetKm) {
  console.log(`\n🚗 Ajustando Unidad: ${patente} | Objetivo: ${targetKm} KM`);
  
  const vehiculo = await prisma.vehiculo.findFirst({ where: { patente } });
  if (!vehiculo) {
    console.log(`   ❌ Vehículo no encontrado.`);
    return;
  }

  // Registros de Abril 2026
  const isoStart = new Date(2026, 3, 1).toISOString();
  const isoEnd = new Date(2026, 3, 30, 23, 59, 59).toISOString();

  const records = await prisma.registroDiario.findMany({
    where: {
      vehiculoId: vehiculo.id,
      fecha: { gte: isoStart, lte: isoEnd }
    },
    orderBy: { fecha: 'asc' }
  });

  if (records.length < 2) {
    console.log(`   ⚠️ Registros insuficientes para prorratear (${records.length}).`);
    return;
  }

  const lastKm = records[records.length - 1].kmActual || 0;
  const startKm = lastKm - targetKm;

  console.log(`   📍 KM Inicial calculado: ${startKm} | KM Final: ${lastKm}`);

  for (let i = 0; i < records.length; i++) {
    const progress = i / (records.length - 1);
    const newKm = Math.round(startKm + (targetKm * progress));
    
    await prisma.registroDiario.update({
      where: { id: records[i].id },
      data: { kmActual: newKm }
    });
  }

  console.log(`   ✅ ${records.length} registros ajustados.`);
}

async function main() {
  await fixVehicle("AF601QS", 1257);
  await fixVehicle("AF668JR", 2092);
  console.log("\n🏁 AJUSTE DE KILOMETRAJE COMPLETADO.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
