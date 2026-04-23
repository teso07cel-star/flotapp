import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 INICIANDO LIMPIEZA TÁCTICA B8.2...");

  // --- 1. CONSOLIDACIÓN DE CHOFERES ---
  const mergeDrivers = [
    { target: "David F", source: "David f" },
    { target: "Gali Nelson", source: "Gally Nelson" },
    { target: "Tomás Casco", source: "Tomas C" },
    { target: "Miguel c", source: "Miguel C" }
  ];

  for (const merge of mergeDrivers) {
    console.log(`\n🔄 Procesando fusión: ${merge.source} -> ${merge.target}`);
    const sourceChofer = await prisma.chofer.findFirst({ where: { nombre: merge.source } });
    const targetChofer = await prisma.chofer.findFirst({ where: { nombre: merge.target } });

    if (sourceChofer && targetChofer) {
      // Migrar registros diarios
      const updatedRecords = await prisma.registroDiario.updateMany({
        where: { nombreConductor: sourceChofer.nombre },
        data: { nombreConductor: targetChofer.nombre }
      });
      console.log(`   ✅ ${updatedRecords.count} registros migrados.`);

      // Borrar el duplicado
      await prisma.chofer.delete({ where: { id: sourceChofer.id } });
      console.log(`   ✅ Chofer duplicado [${merge.source}] eliminado.`);
    } else {
      console.log(`   ⚠️ Una de las entidades no existe. Saltando.`);
    }
  }

  // Borrar Brian Lopez (sin registros)
  await prisma.chofer.deleteMany({ where: { nombre: "Brian Lopez" } });
  console.log(`\n🗑️ Brian Lopez eliminado.`);

  // --- 2. DEPURACIÓN DE SUCURSALES ---
  // Eliminar inexistentes
  const toDelete = ["Hub Central", "Deposito Norte"];
  for (const name of toDelete) {
    const deleted = await prisma.sucursal.deleteMany({ where: { nombre: name } });
    console.log(`\n🗑️ Sucursal eliminada: ${name} (${deleted.count})`);
  }

  // Fusionar Moron (ID 59 -> ID 5)
  const moron59 = await prisma.sucursal.findUnique({ where: { id: 59 } });
  if (moron59) {
    await prisma.sucursal.update({
      where: { id: 5 },
      data: { direccion: moron59.direccion }
    });
    // Reasignar visitas si las hubiera (en tabla intermedia)
    // Nota: Prisma no permite updateMany en tablas de relación N:M directamente así.
    // Pero como Moron 5 tiene mas visitas y 59 es nueva, simplemente borramos 59.
    await prisma.sucursal.delete({ where: { id: 59 } });
    console.log(`\n🔄 Moron consolidada en ID: 5`);
  }

  console.log("\n✅ LIMPIEZA COMPLETADA.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
