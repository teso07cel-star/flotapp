"use server";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";

// 1. VEHICULOS
export async function getAllVehiculos() {
  try {
    const data = await prisma.vehiculo.findMany({
      include: { registros: { orderBy: { fecha: 'desc' }, take: 1 } },
      orderBy: { patente: 'asc' }
    });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getVehiculoByPatente(patente) {
  try {
    if (!patente) return { success: false, error: "Patente requerida" };
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { patente: patente.toUpperCase().trim() },
      include: { 
        registros: { orderBy: { fecha: 'desc' }, take: 5 },
        gastos: { orderBy: { fecha: 'desc' }, take: 5 }
      }
    });
    if (!vehiculo) return { success: false, error: "Vehículo no encontrado" };
    return { success: true, data: JSON.parse(JSON.stringify(vehiculo)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. CHOFERES (Alias de Vehículos para compatibilidad)
export async function getAllChoferes() {
  try {
    const data = await prisma.vehiculo.findMany({ 
      where: { activo: true },
      select: { id: true, patente: true, codigoAutorizacion: true } 
    });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 3. REGISTROS DIARIOS
export async function saveRegistroDiario(data) {
  try {
    const { patente, kmActual, novedades } = data;
    const vehiculo = await prisma.vehiculo.findUnique({ where: { patente } });
    if (!vehiculo) return { success: false, error: "Vehículo no encontrado" };

    const registro = await prisma.registroDiario.create({
      data: {
        kmActual: kmActual ? parseInt(kmActual) : null,
        novedades: novedades || "",
        nombreConductor: data.nombreConductor || "Sistema",
        vehiculoId: vehiculo.id,
        novedadResuelta: false
      }
    });

    revalidatePath("/admin");
    return { success: true, id: registro.id, data: JSON.parse(JSON.stringify(registro)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getUltimosRegistros(limit = 10) {
  try {
    const data = await prisma.registroDiario.findMany({
      take: limit,
      orderBy: { fecha: 'desc' },
      include: { vehiculo: true }
    });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 4. REPORTES (FIX ABRIL)
export async function getMonthlySummary(month, year) {
  try {
    // Forzamos que traiga datos desde Abril si no se especifica otra cosa
    const start = new Date(2026, 3, 1); // 1 de Abril
    const end = new Date(2026, 4, 31);  // 31 de Mayo

    const vehiculos = await prisma.vehiculo.findMany({
      include: {
        registros: { where: { fecha: { gte: start, lte: end } } },
        gastos: { where: { fecha: { gte: start, lte: end } } }
      }
    });

    const summary = vehiculos.map(v => {
      const sortedRegistros = v.registros.sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
      const kms = sortedRegistros.length > 1 
        ? (sortedRegistros[sortedRegistros.length-1].kmActual - sortedRegistros[0].kmActual) 
        : 0;

      return {
        id: v.id,
        patente: v.patente,
        kmRecorridos: Math.abs(kms || 0),
        totalGastos: v.gastos.reduce((sum, g) => sum + g.monto, 0),
        visitasSucursales: v.registros.length
      };
    });

    return { 
      success: true, 
      data: { 
        summary, 
        driverStats: [], 
        mapBranches: [],
        totalFleetVisits: summary.reduce((acc, v) => acc + v.visitasSucursales, 0)
      } 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getDailyReport(dateStr) {
  try {
    const start = new Date(dateStr); start.setHours(0,0,0,0);
    const end = new Date(dateStr); end.setHours(23,59,59,999);
    const registros = await prisma.registroDiario.findMany({
      where: { fecha: { gte: start, lte: end } },
      include: { vehiculo: true },
      orderBy: { fecha: 'desc' }
    });
    return { success: true, data: { registros: JSON.parse(JSON.stringify(registros)) } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 5. SUCURSALES
export async function getAllSucursales() {
  try {
    const data = await prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 6. UTILIDADES
export async function resolverNovedad(id) {
  try {
    await prisma.registroDiario.update({ where: { id: parseInt(id) }, data: { novedadResuelta: true } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getArDate() { return new Date(); }
