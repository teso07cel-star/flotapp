"use server";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";

export async function getAllVehiculos() {
  try {
    const data = await prisma.vehiculo.findMany({ include: { registros: { orderBy: { fecha: 'desc' }, take: 1 } }, orderBy: { patente: 'asc' } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function getUltimosRegistros(take = 10) {
  try {
    const data = await prisma.registroDiario.findMany({ take, orderBy: { fecha: 'desc' }, include: { vehiculo: true } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function getDailyReport(date) {
  try {
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(date); end.setHours(23,59,59,999);
    const registros = await prisma.registroDiario.findMany({ where: { fecha: { gte: start, lte: end } }, include: { vehiculo: true }, orderBy: { fecha: 'desc' } });
    return { success: true, data: { registros: JSON.parse(JSON.stringify(registros)) } };
  } catch (error) { return { success: false, error: error.message }; }
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

export async function resolverNovedad(registroId) {
  try {
    await prisma.registroDiario.update({ where: { id: registroId }, data: { novedadResuelta: true } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) { return { success: false, error: error.message }; }
}
