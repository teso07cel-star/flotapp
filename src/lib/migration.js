"use server";
import prisma from "./prisma.js";

export async function exportAllData() {
  try {
    const data = {
      vehiculos: await prisma.vehiculo.findMany(),
      sucursales: await prisma.sucursal.findMany(),
      choferes: await prisma.chofer.findMany(),
      gastos: await prisma.gasto.findMany(),
      mantenimientos: await prisma.mantenimiento.findMany(),
      autorizaciones: await prisma.autorizacion.findMany(),
      registrosDiarios: await prisma.registroDiario.findMany({
        include: { sucursales: true }
      }),
    };
    return { success: true, data };
  } catch (error) {
    console.error("Export error:", error);
    return { success: false, error: error.message };
  }
}

export async function importAllData(data) {
  try {
    await prisma.gasto.deleteMany({});
    await prisma.mantenimiento.deleteMany({});
    await prisma.registroDiario.deleteMany({});
    await prisma.autorizacion.deleteMany({});
    await prisma.chofer.deleteMany({});
    await prisma.sucursal.deleteMany({});
    await prisma.vehiculo.deleteMany({});

    console.log("Importing Vehiculos...");
    await prisma.vehiculo.createMany({ data: data.vehiculos || [] });
    
    console.log("Importing Sucursales...");
    await prisma.sucursal.createMany({ data: data.sucursales || [] });
    
    console.log("Importing Choferes...");
    await prisma.chofer.createMany({ data: data.choferes || [] });
    
    console.log("Importing Gastos...");
    await prisma.gasto.createMany({ data: data.gastos || [] });

    console.log("Importing Mantenimientos...");
    await prisma.mantenimiento.createMany({ data: data.mantenimientos || [] });

    console.log("Importing Autorizaciones...");
    await prisma.autorizacion.createMany({ data: data.autorizaciones || [] });

    console.log("Importing Registros Diarios...");
    for (const reg of (data.registrosDiarios || [])) {
      const { sucursales, ...regData } = reg;
      await prisma.registroDiario.create({
        data: {
          ...regData,
          sucursales: {
            connect: (sucursales || []).map(s => ({ id: s.id }))
          }
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Import error:", error);
    return { success: false, error: error.message };
  }
}
