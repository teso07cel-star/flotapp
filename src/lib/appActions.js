"use server";
const getArMonthYear = (date) => {
    const d = new Date(date);
    const argDate = new Date(d.toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
    return { month: argDate.getMonth(), year: argDate.getFullYear() };
};
const normalizeName = (name) => {
  if (!name) return "DESCONOCIDO";
  const map = { "MIGUEL C": "MIGUEL CEJAS", "MIGUEL CEJA": "MIGUEL CEJAS", "MIGUEL": "MIGUEL CEJAS" };
  const up = name.toUpperCase().trim();
  return map[up] || up;
};
export async function deleteRegistro(id) {
  try {
    await prisma.registroDiario.delete({ where: { id: parseInt(id) } });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
}
export async function getMonthlySummary(month, year) {
  try {
    const allRegistros = await prisma.registroDiario.findMany({ include: { vehiculo: true, sucursales: true } });
    const branchStatsMap = {}; const driverStatsMap = {}; const vehicleLastInfo = {};
    const sorted = [...allRegistros].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    sorted.forEach(r => {
      const ar = getArMonthYear(r.fecha);
      const inMonth = (ar.month === month && ar.year === year);
      if (r.kmActual && r.vehiculoId) {
          const prev = vehicleLastInfo[r.vehiculoId];
          if (prev && inMonth && r.kmActual > prev.km) {
              const cond = normalizeName(r.nombreConductor);
              if (!driverStatsMap[cond]) driverStatsMap[cond] = { nombre: cond, vehicles: new Set(), totalTrips: 0, totalKm: 0, branchMap: {} };
              driverStatsMap[cond].totalKm += (r.kmActual - prev.km);
          }
          vehicleLastInfo[r.vehiculoId] = { km: r.kmActual };
      }
      if (inMonth) {
          const cond = normalizeName(r.nombreConductor);
          if (!driverStatsMap[cond]) driverStatsMap[cond] = { nombre: cond, vehicles: new Set(), totalTrips: 0, totalKm: 0, branchMap: {} };
          const d = driverStatsMap[cond]; d.vehicles.add(r.vehiculo?.patente || 'S/D');
          r.sucursales?.forEach(s => {
              const sn = s.nombre.trim().toUpperCase();
              branchStatsMap[sn] = (branchStatsMap[sn] || 0) + 1;
              d.totalTrips += 1;
              if (!d.branchMap[sn]) d.branchMap[sn] = { nombre: sn, visitas: 0 };
              d.branchMap[sn].visitas += 1;
          });
      }
    });
    return { success: true, data: { 
      totalVisits: Object.values(branchStatsMap).reduce((a,b)=>a+b, 0),
      branchRanking: Object.entries(branchStatsMap).sort((a,b)=>b[1]-a[1]),
      driverStats: Object.values(driverStatsMap).map(d=>({...d, vehicles: Array.from(d.vehicles)}))
    }};
  } catch (e) { return { success: false, error: e.message }; }
}
export async function getDriverTodayInfo(id) {
  try {
    const c = await prisma.chofer.findUnique({ where: { id: parseInt(id) } });
    if(!c) return { success: false };
    const logs = await prisma.registroDiario.findMany({ where: { nombreConductor: c.nombre }, include: { vehiculo: true, sucursales: true }, orderBy: { fecha: 'desc' }, take: 5 });
    return { success: true, data: { nombre: c.nombre, logs } };
  } catch (e) { return { success: false }; }
}

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
    // Usamos los vehículos como "choferes" para que la lista cargue sí o sí
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
