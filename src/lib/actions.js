"use server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Motor de conexión blindado para Netlify
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export async function getAllVehiculos() {
  try {
    const data = await prisma.vehiculo.findMany({ 
      include: { registros: { orderBy: { fecha: 'desc' }, take: 1 } }, 
      orderBy: { patente: 'asc' } 
    });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) { 
    console.error("Error Prisma:", error.message);
    return { success: false, error: error.message }; 
  }
}

export async function getAllSucursales() {
  try {
    const data = await prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function saveRegistroDiario(data) {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({ where: { patente: data.patente } });
    if (!vehiculo) throw new Error("Vehículo no encontrado");
    const registro = await prisma.registroDiario.create({ 
      data: { 
        kmActual: data.kmActual ? parseInt(data.kmActual) : null, 
        novedades: data.novedades || "", 
        nombreConductor: data.choferId ? `Chofer ID: ${data.choferId}` : "Anónimo", 
        vehiculoId: vehiculo.id, 
        choferId: data.choferId || null,
        novedadResuelta: false
      } 
    });
    revalidatePath("/admin");
    return { success: true, data: JSON.parse(JSON.stringify(registro)) };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function getMonthlySummary(month, year) {
  try {
    const start = new Date();
    start.setDate(start.getDate() - 60); // Abril y Mayo

    const vehiculos = await prisma.vehiculo.findMany({ 
      include: { 
        registros: { where: { fecha: { gte: start } } }, 
        gastos: { where: { fecha: { gte: start } } } 
      } 
    });
    
    const report = vehiculos.map(v => {
      const kms = v.registros.length > 1 ? (v.registros[0].kmActual - v.registros[v.registros.length-1].kmActual) : 0;
      const gastos = v.gastos.reduce((acc, g) => acc + g.monto, 0);
      return { id: v.id, patente: v.patente, kmRecorridos: Math.abs(kms || 0), totalGastos: gastos };
    });
    return { success: true, data: JSON.parse(JSON.stringify(report)) };
  } catch (error) { return { success: false, error: error.message }; }
}
