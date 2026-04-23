import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 INICIANDO REFINAMIENTO MAESTRO B8.3...");

  // --- 1. RENOMBRAR Y CONSOLIDAR CONDUCTORES ---
  const renames = [
    { from: "David F", to: "David Francisconi" },
    { from: "Diego R", to: "Diego Retamar" },
    { from: "Gonzalo", to: "Gonzalo Martinez" },
    { from: "Gali Nelson", to: "Gally Nelson" },
    { from: "Gerardo", to: "Gerardo Visconti" },
    { from: "Jonathan", to: "Jonathan Vondrak" },
    { from: "Miguel c", to: "Miguel Cejas" },
    { from: "Tomás Casco", to: "Tomás Casco" }
  ];

  for (const item of renames) {
    console.log(`\n👤 Procesando Chofer: ${item.from} -> ${item.to}`);
    const chofer = await prisma.chofer.findFirst({ where: { nombre: item.from } });
    if (chofer) {
      // Actualizar nombre y migrar registros
      await prisma.registroDiario.updateMany({
        where: { nombreConductor: item.from },
        data: { nombreConductor: item.to }
      });
      await prisma.chofer.update({
        where: { id: chofer.id },
        data: { nombre: item.to }
      });
      console.log(`   ✅ Nombre actualizado y registros migrados.`);
    } else {
      console.log(`   ⚠️ No se encontró al chofer '${item.from}'.`);
    }
  }

  // --- 2. AGREGAR NUEVO CHOFER ---
  const daniel = await prisma.chofer.findFirst({ where: { nombre: "Daniel" } });
  if (!daniel) {
    await prisma.chofer.create({ data: { nombre: "Daniel" } });
    console.log(`\n🆕 Chofer 'Daniel' agregado al sistema.`);
  }

  // --- 3. LIMPIEZA DE SUCURSALES ---
  // Borrar Madero
  const madero = await prisma.sucursal.findFirst({ where: { nombre: { contains: "Madero", mode: 'insensitive' } } });
  if (madero) {
    await prisma.sucursal.delete({ where: { id: madero.id } });
    console.log(`\n🗑️ Sucursal 'Madero' eliminada.`);
  }

  // Actualizar Voy y Vuelvo y Nordelta 2
  const updates = [
    { name: "VOY Y VUELVO", direccion: "Av. Corrientes 809, CABA" },
    { name: "Nordelta 2", direccion: "Av. de los Lagos 6855" }
  ];

  for (const up of updates) {
    const s = await prisma.sucursal.findFirst({ where: { nombre: { contains: up.name, mode: 'insensitive' } } });
    if (s) {
      await prisma.sucursal.update({
        where: { id: s.id },
        data: { direccion: up.direccion }
      });
      console.log(`\n📍 Dirección actualizada para '${up.name}': ${up.direccion}`);
    }
  }

  console.log("\n🏁 REFINAMIENTO COMPLETADO.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
