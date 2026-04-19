import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ ERROR: DATABASE_URL no definida en .env");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 INICIANDO LIMPIEZA DE CHOFERES - v8.3");

  const choferes = await prisma.chofer.findMany();
  const seen = new Map();
  const toDelete = [];

  for (const c of choferes) {
    const normalName = c.nombre.trim().toUpperCase();
    if (seen.has(normalName)) {
      const original = seen.get(normalName);
      console.log(`FUSIONANDO: "${c.nombre}" (ID: ${c.id}) -> "${original.nombre}" (ID: ${original.id})`);
      
      // Mover registros
      const updateRes = await prisma.registroDiario.updateMany({
        where: { choferId: c.id },
        data: { choferId: original.id }
      });
      console.log(`  Se movieron ${updateRes.count} registros diarios.`);

      const inspRes = await prisma.inspeccionMensual.updateMany({
        where: { choferId: c.id },
        data: { choferId: original.id }
      });
      console.log(`  Se movieron ${inspRes.count} inspecciones mensuales.`);

      toDelete.push(c.id);
    } else {
      seen.set(normalName, c);
      if (c.nombre !== c.nombre.trim()) {
          await prisma.chofer.update({
              where: { id: c.id },
              data: { nombre: c.nombre.trim() }
          });
      }
    }
  }

  for (const id of toDelete) {
    try {
      await prisma.chofer.delete({ where: { id } });
      console.log(`✅ Chofer ID ${id} eliminado.`);
    } catch (e) {
      console.error(`❌ Error al eliminar ID ${id}:`, e.message);
    }
  }

  console.log("✅ LIMPIEZA DE CHOFERES COMPLETADA.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
