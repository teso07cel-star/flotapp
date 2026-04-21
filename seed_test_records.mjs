import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  // Configurar entorno mock
  let moto = await prisma.vehiculo.findFirst({ where: { categoria: "MOTO" } });
  if (!moto) {
     moto = await prisma.vehiculo.create({ data: { patente: "MOTO-01", categoria: "MOTO", activo: true } });
  }

  let pickup = await prisma.vehiculo.findFirst({ where: { categoria: "PICKUP" } });
  if (!pickup) {
     pickup = await prisma.vehiculo.create({ data: { patente: "PICKUP-99", categoria: "PICKUP", activo: true } });
  }

  const sucursales = await prisma.sucursal.findMany({ take: 3 });

  if (sucursales.length < 3) {
      console.log("Not enough branches");
      process.exit(1);
  }

  // Crear registro para MOTO
  const recMoto = await prisma.registroDiario.create({
      data: {
          vehiculoId: moto.id,
          nombreConductor: "Test Moto",
          tipoReporte: "PARADA",
          fecha: new Date(),
          sucursales: {
              connect: [{ id: sucursales[0].id }, { id: sucursales[1].id }]
          }
      }
  });

  // Crear registro para PICKUP
  const recPickup = await prisma.registroDiario.create({
      data: {
          vehiculoId: pickup.id,
          nombreConductor: "Test Pickup",
          tipoReporte: "PARADA",
          fecha: new Date(),
          sucursales: {
              connect: [{ id: sucursales[0].id }, { id: sucursales[1].id }, { id: sucursales[2].id }]
          }
      }
  });

  console.log("Moto Record ID:", recMoto.id);
  console.log("Pickup Record ID:", recPickup.id);
}

seed().catch(console.error).finally(() => prisma.$disconnect());
