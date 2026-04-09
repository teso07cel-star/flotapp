import dotenv from "dotenv";
dotenv.config();
import prisma from "../src/lib/prisma.js";

async function cleanup() {
  console.log("🚀 Iniciando Limpieza Quirúrgica b4.0...");

  const toDelete = ["GABRIEL RODRIGUEZ", "JUAN PEREZ", "LUCAS", "RAMIRO"];
  
  // 1. ELIMINACIÓN DE OBSOLETOS
  for (const name of toDelete) {
    const chofer = await prisma.chofer.findFirst({ where: { nombre: { contains: name, mode: 'insensitive' } } });
    if (chofer) {
      console.log(`🗑️ Eliminando chofere obsoleto: ${chofer.nombre}`);
      await prisma.chofer.delete({ where: { id: chofer.id } });
    }
  }

  // 2. FUSIÓN DE DUPLICADOS: BRIAN LOPEZ
  const brians = await prisma.chofer.findMany({ 
    where: { nombre: { contains: "BRIAN", mode: 'insensitive' } },
    orderBy: { id: 'asc' }
  });

  if (brians.length > 1) {
    const mainBrian = brians[0];
    const duplicates = brians.slice(1);
    
    for (const dup of duplicates) {
      console.log(`⛙ Fusionando registros de ${dup.nombre} (ID:${dup.id}) hacia ${mainBrian.nombre} (ID:${mainBrian.id})`);
      await prisma.registroDiario.updateMany({
        where: { nombreConductor: dup.nombre },
        data: { nombreConductor: mainBrian.nombre }
      });
      await prisma.chofer.delete({ where: { id: dup.id } });
    }
  }

  // 3. FUSIÓN DE DUPLICADOS: GONZALO
  const gonzalos = await prisma.chofer.findMany({
    where: { nombre: { contains: "GONZALO", mode: 'insensitive' } },
    orderBy: { id: 'asc' }
  });

  if (gonzalos.length > 1) {
    const mainGonzalo = gonzalos[0];
    const duplicates = gonzalos.slice(1);

    for (const dup of duplicates) {
        console.log(`⛙ Fusionando registros de ${dup.nombre} (ID:${dup.id}) hacia ${mainGonzalo.nombre} (ID:${mainGonzalo.id})`);
        await prisma.registroDiario.updateMany({
          where: { nombreConductor: dup.nombre },
          data: { nombreConductor: mainGonzalo.nombre }
        });
        await prisma.chofer.delete({ where: { id: dup.id } });
    }
  }

  console.log("✅ Limpieza completada exitosamente.");
}

cleanup()
  .catch(e => console.error("❌ Error en limpieza:", e))
  .finally(() => process.exit());
