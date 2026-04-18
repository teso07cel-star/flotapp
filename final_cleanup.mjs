import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL no definida');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function mergeDrivers(canonicalId, duplicateId) {
  console.log(`Merging driver ${duplicateId} into ${canonicalId}...`);
  
  // Update daily records
  const dailyUpdate = await prisma.registroDiario.updateMany({
    where: { choferId: duplicateId },
    data: { choferId: canonicalId }
  });
  console.log(`  Moved ${dailyUpdate.count} daily records.`);

  // Update monthly inspections
  const inspectionUpdate = await prisma.inspeccionMensual.updateMany({
    where: { choferId: duplicateId },
    data: { choferId: canonicalId }
  });
  console.log(`  Moved ${inspectionUpdate.count} inspections.`);

  // Delete duplicate
  await prisma.chofer.delete({ where: { id: duplicateId } });
  console.log(`  Deleted duplicate driver ${duplicateId}.`);
}

async function mergeVehicles(canonicalId, duplicateId) {
  console.log(`Merging vehicle ${duplicateId} into ${canonicalId}...`);

  // Update daily records
  const dailyUpdate = await prisma.registroDiario.updateMany({
    where: { vehiculoId: duplicateId },
    data: { vehiculoId: canonicalId }
  });
  console.log(`  Moved ${dailyUpdate.count} daily records.`);

  // Update expenses
  const expenseUpdate = await prisma.gasto.updateMany({
    where: { vehiculoId: duplicateId },
    data: { vehiculoId: canonicalId }
  });
  console.log(`  Moved ${expenseUpdate.count} expenses.`);

  // Update inspections
  const inspectionUpdate = await prisma.inspeccionMensual.updateMany({
    where: { vehiculoId: duplicateId },
    data: { vehiculoId: canonicalId }
  });
  console.log(`  Moved ${inspectionUpdate.count} inspections.`);

  // Update maintenance
  const maintUpdate = await prisma.mantenimiento.updateMany({
    where: { vehiculoId: duplicateId },
    data: { vehiculoId: canonicalId }
  });
  console.log(`  Moved ${maintUpdate.count} maintenance records.`);

  // Delete duplicate
  await prisma.vehiculo.delete({ where: { id: duplicateId } });
  console.log(`  Deleted duplicate vehicle ${duplicateId}.`);
}

async function main() {
  console.log('🚀 INICIANDO LIMPIEZA FINAL DE PRODUCCIÓN - v8.3');

  // MERGE VEHICLES
  // AF 668 JR (1354) -> AF668JR (13)
  try {
    await mergeVehicles(13, 1354);
  } catch (e) {
    console.warn('⚠️ Error merging vehicles (might already be fixed):', e.message);
  }

  // MERGE DRIVERS
  const driverMerges = [
    { canon: 1421, dup: 2 },    // Brian Lopez
    { canon: 142, dup: 8 },     // Miguel c
    { canon: 113, dup: 1428 },  // Gali Nelson
    { canon: 111, dup: 1437 },  // Tomás Casco
    { canon: 9, dup: 1423 },    // David Francisconi
  ];

  for (const m of driverMerges) {
    try {
      await mergeDrivers(m.canon, m.dup);
    } catch (e) {
      console.warn(`⚠️ Error merging driver ${m.dup}:`, e.message);
    }
  }

  // NORMALIZE REMAINING NAMES
  console.log('🧹 Normalizando nombres de conductores...');
  const drivers = await prisma.chofer.findMany();
  for (const d of drivers) {
    const cleanName = d.nombre.trim();
    if (cleanName !== d.nombre) {
      await prisma.chofer.update({
        where: { id: d.id },
        data: { nombre: cleanName }
      });
      console.log(`  Normalized: "${d.nombre}" -> "${cleanName}"`);
    }
  }

  console.log('✅ PROTOCOLO DE LIMPIEZA COMPLETADO.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
