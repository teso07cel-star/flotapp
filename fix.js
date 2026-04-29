const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBranches() {
  try {
    const records = await prisma.registroDiario.findMany({
      where: {
        fecha: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        },
        tipoReporte: "PARADA",
      },
      include: {
        sucursales: true
      }
    });

    let orphaned = records.filter(r => r.sucursales.length === 0);
    console.log(`Encontrados ${orphaned.length} registros PARADA sin sucursales este mes.`);

    if (orphaned.length > 0) {
      // Find "Otros" branch
      let otrosBranch = await prisma.sucursal.findFirst({
        where: { nombre: { contains: "Otro", mode: "insensitive" } }
      });

      if (!otrosBranch) {
        otrosBranch = await prisma.sucursal.create({
          data: { nombre: "Otros", direccion: "No especificado" }
        });
        console.log("Creada sucursal 'Otros' porque no existía.");
      }

      console.log(`Asignando sucursal 'Otros' (ID: ${otrosBranch.id}) a los ${orphaned.length} registros huérfanos...`);

      let count = 0;
      for (const record of orphaned) {
        await prisma.registroDiario.update({
          where: { id: record.id },
          data: {
            sucursales: {
              connect: [{ id: otrosBranch.id }]
            }
          }
        });
        count++;
      }
      console.log(`¡Recuperadas ${count} bitácoras exitosamente!`);
    } else {
      console.log("No se encontraron registros huérfanos para recuperar.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBranches();
