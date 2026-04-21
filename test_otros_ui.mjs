import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  let pickup = await prisma.vehiculo.findFirst({ where: { categoria: "PICKUP" } });
  if (!pickup) {
     pickup = await prisma.vehiculo.create({ data: { patente: "TEST-999", categoria: "PICKUP", activo: true } });
  }

  const sucursalNames = ["Puerto Madero", "Plaza Italia", "Otros"];
  const sucursalesDb = [];

  for (const name of sucursalNames) {
      let ext = await prisma.sucursal.findFirst({ where: { nombre: name } });
      if (!ext) {
          ext = await prisma.sucursal.create({ data: { nombre: name, direccion: name, activa: true } });
      }
      sucursalesDb.push(ext);
  }

  // Create record
  const rec = await prisma.registroDiario.create({
      data: {
          vehiculoId: pickup.id,
          nombreConductor: "Test Visual",
          tipoReporte: "PARADA",
          fecha: new Date(),
          sucursales: {
              connect: sucursalesDb.map(s => ({ id: s.id }))
          }
      }
  });

  console.log("Visual Test ID:", rec.id);
}

seed().catch(console.error).finally(() => prisma.$disconnect());
