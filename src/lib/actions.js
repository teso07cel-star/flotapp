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
      include: { registros: { where: { fecha: { gte: start, lte: end } } }, gastos: { where: { fecha: { gte: start, lte: end } } } } 
    });
    const report = vehiculos.map(v => {
      const kms = v.registros.length > 1 ? (v.registros[0].kmActual - v.registros[v.registros.length-1].kmActual) : 0;
      return { id: v.id, patente: v.patente, kmRecorridos: Math.abs(kms || 0), totalGastos: 0 };
    });
    return { success: true, data: { summary: report, driverStats: [] } };
  } catch (e) { return { success: false, error: e.message }; }
};

export const getAllSucursales = async () => {
  try {
    const data = await prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (e) { return { success: false, error: e.message }; }
};

export const getDailyReport = async (date) => {
  try {
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(date); end.setHours(23,59,59,999);
    const registros = await prisma.registroDiario.findMany({ where: { fecha: { gte: start, lte: end } }, include: { vehiculo: true }, orderBy: { fecha: 'desc' } });
    return { success: true, data: { registros: JSON.parse(JSON.stringify(registros)) } };
  } catch (e) { return { success: false, error: e.message }; }
};
