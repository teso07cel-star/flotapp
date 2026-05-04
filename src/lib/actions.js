"use server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export const getAllVehiculos = async () => {
  try {
    const data = await prisma.vehiculo.findMany({ 
      include: { registros: { orderBy: { fecha: 'desc' }, take: 1 } }, 
      orderBy: { patente: 'asc' } 
    });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (e) { return { success: false, error: e.message }; }
};

export const getUltimosRegistros = async (take = 10) => {
  try {
    const data = await prisma.registroDiario.findMany({ take, orderBy: { fecha: 'desc' }, include: { vehiculo: true } });
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
        nombreConductor: data.choferId ? `Chofer ID: ${data.choferId}` : "Anónimo", 
        vehiculoId: vehiculo.id, 
        choferId: data.choferId || null,
        novedadResuelta: false
      } 
    });
    revalidatePath("/admin");
    return { success: true, data: JSON.parse(JSON.stringify(registro)) };
  } catch (e) { return { success: false, error: e.message }; }
};

export const getMonthlySummary = async (month, year) => {
  try {
    const start = new Date();
    start.setDate(start.getDate() - 60); 
    const vehiculos = await prisma.vehiculo.findMany({ 
      include: { registros: { where: { fecha: { gte: start } } }, gastos: { where: { fecha: { gte: start } } } } 
    });
    const report = vehiculos.map(v => {
      const kms = v.registros.length > 1 ? (v.registros[0].kmActual - v.registros[v.registros.length-1].kmActual) : 0;
      return { id: v.id, patente: v.patente, kmRecorridos: Math.abs(kms || 0), totalGastos: 0 };
    });
    return { success: true, data: JSON.parse(JSON.stringify(report)) };
  } catch (e) { return { success: false, error: e.message }; }
};

// Exportamos explícitamente para que no haya dudas
export const getAllSucursales = async () => {
  try {
    const data = await prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (e) { return { success: false, error: e.message }; }
};
