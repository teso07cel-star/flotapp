"use server";
import prisma from "./prisma.js";
import { revalidatePath } from "next/cache";

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

export async function getDailyReport(date) {
  try {
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(date); end.setHours(23,59,59,999);
    const logs = await prisma.registroDiario.findMany({
      where: { fecha: { gte: start, lte: end } },
      include: { vehiculo: true, sucursales: true },
      orderBy: { fecha: 'desc' }
    });
    return { success: true, data: logs };
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

export async function getAllVehiculos() { return { success: true, data: await prisma.vehiculo.findMany({ include: { registros: true }, orderBy: { patente: 'asc' } }) }; }
export async function getAllChoferes() { return { success: true, data: await prisma.chofer.findMany({ orderBy: { nombre: 'asc' } }) }; }
export async function getAllSucursales() { return { success: true, data: await prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } }) }; }

export async function getVehiculoByPatente(p) { 
  return { success: true, data: await prisma.vehiculo.findUnique({ where: { patente: p.toUpperCase().trim() }, include: { registros: { orderBy: { fecha: 'desc' }, take: 1 } } }) };
}
export async function getDriverTodayInfo(id) {
  const c = await prisma.chofer.findUnique({ where: { id: parseInt(id) } });
  if(!c) return { success: false };
  const logs = await prisma.registroDiario.findMany({ where: { nombreConductor: c.nombre }, include: { vehiculo: true, sucursales: true }, orderBy: { fecha: 'desc' }, take: 5 });
  return { success: true, data: { nombre: c.nombre, logs } };
}

export async function solicitarAutorizacion(nombre, patente) {
  return { success: true, data: await prisma.autorizacion.create({ data: { nombre, patente, estado: 'PENDIENTE' } }) };
}
export async function checkEstadoAutorizacion(id) {
  return { success: true, data: await prisma.autorizacion.findUnique({ where: { id: parseInt(id) } }) };
}
export async function registrarChofer(nombre) {
  return { success: true, data: await prisma.chofer.create({ data: { nombre: nombre.toUpperCase().trim() } }) };
}
