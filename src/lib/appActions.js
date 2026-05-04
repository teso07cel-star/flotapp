"use server";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";

export const getAllVehiculos = async () => {
  try {
    const data = await prisma.vehiculo.findMany({ 
      include: { registros: { orderBy: { fecha: 'desc' }, take: 1 } }, 
      orderBy: { patente: 'asc' } 
    });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (e) { return { success: false, error: e.message }; }
};

export const getAllChoferes = async () => {
  try {
    const data = await prisma.vehiculo.findMany({ 
      where: { activo: true },
      select: { id: true, patente: true, codigoAutorizacion: true } 
    });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (e) { return { success: false, error: e.message }; }
};

export const saveRegistroDiario = async (data) => {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({ where: { patente: data.patente } });
    if (!vehiculo) throw new Error("Vehículo no encontrado");
    const registro = await prisma.registroDiario.create({ 
      data: { 
        kmActual: data.kmActual ? parseInt(data.kmActual) : null, 
        novedades: data.novedades || "", 
        nombreConductor: data.nombreConductor || "Anónimo", 
        vehiculoId: vehiculo.id,
        novedadResuelta: false
      } 
    });
    revalidatePath("/admin");
    return { success: true, id: registro.id };
  } catch (e) { return { success: false, error: e.message }; }
};

export const getMonthlySummary = async (month, year) => {
  try {
    const start = new Date(2026, 3, 1); 
    const end = new Date(2026, 4, 31); 
    const vehiculos = await prisma.vehiculo.findMany({ 
      include: { 
        registros: { where: { fecha: { gte: start, lte: end } } }, 
        gastos: { where: { fecha: { gte: start, lte: end } } } 
      } 
    });
    const report = vehiculos.map(v => {
      const kms = v.registros.length > 1 ? (v.registros[0].kmActual - v.registros[v.registros.length-1].kmActual) : 0;
      return { id: v.id, patente: v.patente, kmRecorridos: Math.abs(kms || 0), totalGastos: 0, cantidadRegistros: v.registros.length };
    });
    return { success: true, data: report };
  } catch (e) { return { success: false, error: e.message }; }
};

export const getAllSucursales = async () => {
  try {
    const data = await prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (e) { return { success: false, error: e.message }; }
};

export const resolverNovedad = async (id) => {
  try {
    await prisma.registroDiario.update({ where: { id: parseInt(id) }, data: { novedadResuelta: true } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export const getArDate = async () => { return new Date(); };
