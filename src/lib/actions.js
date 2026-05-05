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

// --- VEHÍCULOS ---
export const getAllVehiculos = async () => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const data = await prisma.vehiculo.findMany({ include: { registros: { orderBy: { fecha: 'desc' }, take: 1 } }, orderBy: { patente: 'asc' } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const getVehiculoById = async (id) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const data = await prisma.vehiculo.findUnique({ where: { id: parseInt(id) }, include: { registros: true, gastos: true, mantenimientos: true } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const getVehiculoByPatente = async (p) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const v = await prisma.vehiculo.findUnique({ where: { patente: p.toUpperCase().trim() }, include: { registros: { orderBy: { fecha: 'desc' }, take: 1 } } });
    return { success: true, data: v };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const createVehiculo = async (data) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const v = await prisma.vehiculo.create({ data: { patente: data.patente.toUpperCase(), tipo: data.tipo, activo: true } });
    revalidatePath("/admin"); return { success: true, data: v };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const updateVehiculo = async (id, data) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    await prisma.vehiculo.update({ where: { id: parseInt(id) }, data });
    revalidatePath("/admin"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};

// --- CHOFERES ---
export const getAllChoferes = async () => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const data = await prisma.chofer.findMany({ orderBy: { nombre: 'asc' } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const addChofer = async (nombre) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    await prisma.chofer.create({ data: { nombre: nombre.toUpperCase().trim() } });
    revalidatePath("/admin/choferes"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const deleteChofer = async (id) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    await prisma.chofer.delete({ where: { id: parseInt(id) } });
    revalidatePath("/admin/choferes"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const registrarChofer = async (nombre) => { 
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const c = await prisma.chofer.create({ data: { nombre: nombre.toUpperCase().trim() } });
    return { success: true, data: c };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};

// --- SUCURSALES ---
export const getAllSucursales = async () => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const s = await prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
    return { success: true, data: s };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const addSucursal = async (nombre) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    await prisma.sucursal.create({ data: { nombre: nombre.trim() } });
    revalidatePath("/admin/branches"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const updateSucursal = async (id, nombre) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    await prisma.sucursal.update({ where: { id: parseInt(id) }, data: { nombre: nombre.trim() } });
    revalidatePath("/admin/branches"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const deleteSucursal = async (id) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    await prisma.sucursal.delete({ where: { id: parseInt(id) } });
    revalidatePath("/admin/branches"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};

// --- REGISTROS DIARIOS ---
export const createRegistroDiario = async (data) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const vehiculo = await prisma.vehiculo.findUnique({ where: { patente: data.patente } });
    const reg = await prisma.registroDiario.create({
      data: {
        kmActual: data.kmActual ? parseInt(data.kmActual) : null,
        novedades: data.novedades || "",
        nombreConductor: data.nombreConductor || "ANÓNIMO",
        vehiculoId: vehiculo?.id,
        tipoReporte: data.tipoReporte || "BITÁCORA",
        sucursales: { connect: data.sucursales?.map(id => ({ id })) || [] }
      }
    });
    revalidatePath("/admin"); return { success: true, id: reg.id };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const deleteRegistro = async (id) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    await prisma.registroDiario.delete({ where: { id: parseInt(id) } });
    revalidatePath("/", "layout"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const deleteRegistroDiario = deleteRegistro;

export const getDailyReport = async (date) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(date); end.setHours(23,59,59,999);
    const logs = await prisma.registroDiario.findMany({
      where: { fecha: { gte: start, lte: end } },
      include: { vehiculo: true, sucursales: true },
      orderBy: { fecha: 'desc' }
    });
    return { success: true, data: logs };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const getUltimosRegistros = async () => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const logs = await prisma.registroDiario.findMany({ include: { vehiculo: true, sucursales: true }, orderBy: { fecha: 'desc' }, take: 10 });
    return { success: true, data: logs };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};

// --- REPORTES Y ESTADÍSTICAS ---
export const getMonthlySummary = async (month, year) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
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
              if (!driverStatsMap[cond]) driverStatsMap[cond] = { nombre: cond, vehicles: new Set(), totalKm: 0, totalTrips: 0, branchMap: {} };
              driverStatsMap[cond].totalKm += (r.kmActual - prev.km);
          }
          vehicleLastInfo[r.vehiculoId] = { km: r.kmActual };
      }
      if (inMonth) {
          const cond = normalizeName(r.nombreConductor);
          if (!driverStatsMap[cond]) driverStatsMap[cond] = { nombre: cond, vehicles: new Set(), totalKm: 0, totalTrips: 0, branchMap: {} };
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
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};

// --- AUTORIZACIONES ---
export const solicitarAutorizacion = async (nombre, patente) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const a = await prisma.autorizacion.create({ data: { nombre, patente, estado: 'PENDIENTE' } });
    return { success: true, data: a };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const checkEstadoAutorizacion = async (id) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const a = await prisma.autorizacion.findUnique({ where: { id: parseInt(id) } });
    return { success: true, data: a };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const getAutorizacionesPendientes = async () => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const data = (!prisma.autorizacion) ? [] : await prisma.autorizacion.findMany({ where: { estado: 'PENDIENTE' }, orderBy: { fecha: 'desc' } });
    return { success: true, data };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const aprobarAutorizacion = async (id) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const a = await prisma.autorizacion.update({ where: { id: parseInt(id) }, data: { estado: 'APROBADO' } });
    await prisma.chofer.create({ data: { nombre: a.nombre.toUpperCase().trim() } });
    revalidatePath("/admin/choferes"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const rechazarAutorizacion = async (id) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    await prisma.autorizacion.update({ where: { id: parseInt(id) }, data: { estado: 'RECHAZADO' } });
    revalidatePath("/admin/choferes"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};

// --- GASTOS Y MANTENIMIENTO ---
export const addGasto = async (data) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    await prisma.gasto.create({ data: { monto: parseFloat(data.monto), descripcion: data.descripcion, tipo: data.tipo, vehiculoId: parseInt(data.vehiculoId) } });
    revalidatePath("/admin"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const deleteGasto = async (id) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    await prisma.gasto.delete({ where: { id: parseInt(id) } });
    revalidatePath("/admin"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const addMantenimiento = async (data) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    await prisma.mantenimiento.create({ data: { tipo: data.tipo, kmAviso: parseInt(data.kmAviso), kmProx: parseInt(data.kmProx), vehiculoId: parseInt(data.vehiculoId) } });
    revalidatePath("/admin"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};

// --- DRIVER LOGIC ---
export const getDriverTodayInfo = async (id) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const c = await prisma.chofer.findUnique({ where: { id: parseInt(id) } });
    if(!c) return { success: false, error: "Chofer no encontrado" };
    const logs = await prisma.registroDiario.findMany({ where: { nombreConductor: c.nombre }, include: { vehiculo: true, sucursales: true }, orderBy: { fecha: 'desc' }, take: 5 });
    return { success: true, data: { nombre: c.nombre, logs } };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const finalizeDriverLog = async (id) => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    revalidatePath("/"); return { success: true };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
export const bindDriverToDevice = async (id) => { return { success: true }; };
export const resetDriverDevice = async () => { return { success: true }; };
export const updateChoferPatente = async () => { return { success: true }; };
export const generarCodigoAutorizacion = async () => { return { success: true }; };

// --- DIAGNÓSTICO ---
export const testDatabase = async () => {
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const count = await prisma.chofer.count();
    return { success: true, count };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};

export const resetSystem = async () => { return { success: true }; };
export const getRangeReport = async (start, end) => { return { success: true, data: [] }; };
export const getConfigLogistica = async () => { return { success: true, data: { notifications: true } }; };
export const updateConfigLogistica = async (data) => { return { success: true }; };
export const getGastosByVehiculo = async (id) => { 
  if(!prisma) return { success: false, error: 'DB_CONNECTION_ERROR' }; try {
    const data = await prisma.gasto.findMany({ where: { vehiculoId: parseInt(id) }, orderBy: { fecha: 'desc' } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (e) { return { success: false, data: { branchRanking: [], driverStats: [], totalVisits: 0 }, error: e.message }; }
};
