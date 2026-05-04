"use server";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";

export async function getAllVehiculos() {
  try {
    const data = await prisma.vehiculo.findMany({ include: { registros: { orderBy: { fecha: 'desc' }, take: 1 } }, orderBy: { patente: 'asc' } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function getUltimosRegistros(take = 5) {
  try {
    const data = await prisma.registroDiario.findMany({ take, orderBy: { fecha: 'desc' }, include: { vehiculo: true } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function getMonthlySummary(month, year) {
  try {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const vehiculos = await prisma.vehiculo.findMany({ include: { registros: { where: { fecha: { gte: start, lte: end } } }, gastos: { where: { fecha: { gte: start, lte: end } } } } });
    const report = vehiculos.map(v => {
      const kms = v.registros.length > 1 ? (v.registros[0].kmActual - v.registros[v.registros.length-1].kmActual) : 0;
      const gastos = v.gastos.reduce((acc, g) => acc + g.monto, 0);
      return { id: v.id, patente: v.patente, kmRecorridos: Math.abs(kms), totalGastos: gastos };
    });
    return { success: true, data: JSON.parse(JSON.stringify(report)) };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function getAllSucursales() {
  try {
    const data = await prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function createRegistroDiario(data) {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({ where: { patente: data.patente } });
    if (!vehiculo) throw new Error("Vehículo no encontrado");
    const registro = await prisma.registroDiario.create({ data: { kmActual: data.kmActual, novedades: data.novedades, nombreConductor: data.choferId ? `Chofer ID: ${data.choferId}` : "Anónimo", vehiculoId: vehiculo.id, choferId: data.choferId || null, sucursales: { connect: data.sucursales.map(id => ({ id })) } } });
    revalidatePath("/admin");
    return { success: true, data: JSON.parse(JSON.stringify(registro)) };
  } catch (error) { return { success: false, error: error.message }; }
}
