"use server";
import prisma from "./prisma.js";
import { revalidatePath } from "next/cache";

const getArDate = () => new Date(new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));


export async function getVehiculoByPatente(patente) {
  try {
    if (!patente) return { success: false, error: "Patente requerida" };
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { patente: patente.toUpperCase().trim() },
      include: {
        registros: { orderBy: { fecha: 'desc' }, take: 1 },
      }
    });
    return { success: true, data: vehiculo };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAllVehiculos() {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      orderBy: { id: 'asc' },
      include: {
        registros: { orderBy: { fecha: 'desc' }, take: 1 }
      }
    });
    return { success: true, data: vehiculos };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createVehiculo(data) {
  try {
    const v = await prisma.vehiculo.create({
      data: {
        patente: data.patente.toUpperCase().trim(),
        vtvVencimiento: data.vtvVencimiento ? new Date(data.vtvVencimiento) : null,
        seguroVencimiento: data.seguroVencimiento ? new Date(data.seguroVencimiento) : null,
        proximoServiceKm: data.proximoServiceKm ? parseInt(data.proximoServiceKm) : null,
        proximoCambioCubiertasKm: data.proximoCambioCubiertasKm ? parseInt(data.proximoCambioCubiertasKm) : null,
      }
    });
    revalidatePath("/admin");
    return { success: true, data: v };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

export async function updateVehiculo(id, data) {
  try {
    const updateData = { ...data };
    if (updateData.vtvVencimiento) updateData.vtvVencimiento = new Date(updateData.vtvVencimiento);
    if (updateData.seguroVencimiento) updateData.seguroVencimiento = new Date(updateData.seguroVencimiento);
    if (updateData.proximoServiceKm !== undefined) updateData.proximoServiceKm = parseInt(updateData.proximoServiceKm) || null;
    if (updateData.proximoCambioCubiertasKm !== undefined) updateData.proximoCambioCubiertasKm = parseInt(updateData.proximoCambioCubiertasKm) || null;

    const vehiculo = await prisma.vehiculo.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    revalidatePath("/admin/vehicles/[id]", "page");
    revalidatePath("/admin");
    return { success: true, data: vehiculo };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAllSucursales() {
  try {
    const sucursales = await prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
    return { success: true, data: sucursales };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function addSucursal(nombre, direccion) {
  try {
    const s = await prisma.sucursal.create({
      data: { nombre, direccion }
    });
    revalidatePath("/admin/branches");
    return { success: true, data: s };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAllChoferes() {
  try {
    const choferes = await prisma.chofer.findMany({ 
      where: { activo: true },
      orderBy: { nombre: 'asc' } 
    });
    return { success: true, data: choferes };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function addChofer(data) {
  try {
    const c = await prisma.chofer.create({
      data: {
        nombre: data.nombre,
        dni: data.dni,
        patenteAsignada: data.patenteAsignada?.toUpperCase().trim() || null,
        deviceId: data.deviceId || null
      }
    });
    revalidatePath("/admin/choferes");
    return { success: true, data: c };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteChofer(id) {
  try {
    await prisma.chofer.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    });
    revalidatePath("/admin/choferes");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateChoferPatente(choferId, patente) {
  try {
    const c = await prisma.chofer.update({
      where: { id: parseInt(choferId) },
      data: { patenteAsignada: patente?.toUpperCase().trim() || null }
    });
    revalidatePath("/admin/choferes");
    return { success: true, data: c };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function resetDriverDevice(choferId) {
  try {
    await prisma.chofer.update({
      where: { id: parseInt(choferId) },
      data: { deviceId: null }
    });
    revalidatePath("/admin/choferes");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


export async function createRegistroDiario(data) {
  try {
    const vehiculoId = parseInt(data.vehiculoId);
    const kmActual = parseInt(data.kmActual);

    // Buscar el último registro para este vehículo
    const lastRecord = await prisma.registroDiario.findFirst({
      where: { vehiculoId },
      orderBy: { fecha: 'desc' }
    });

    if (lastRecord && kmActual <= lastRecord.kmActual) {
      // Si el kilometraje no aumentó, verificamos el código de autorización
      const vehiculo = await prisma.vehiculo.findUnique({
        where: { id: vehiculoId }
      });

      if (!data.authCode || data.authCode !== vehiculo.codigoAutorizacion) {
        return { success: false, error: "MILEAGE_AUTH_REQUIRED" };
      }

      // Si el código es correcto, lo limpiamos (se usa una sola vez)
      await prisma.vehiculo.update({
        where: { id: vehiculoId },
        data: { codigoAutorizacion: null }
      });
    }

    const registro = await prisma.registroDiario.create({
      data: {
        vehiculoId,
        kmActual,
        novedades: data.novedades || null,
        novedadResuelta: false,
        nombreConductor: data.nombreConductor || null,
                fecha: getArDate(),
        sucursales: {
          connect: data.sucursalIds ? data.sucursalIds.map(id => ({ id: parseInt(id) })) : []
        }
      }
    });
    revalidatePath("/admin");
    return { success: true, data: registro };
  } catch (error) {
    console.error("Error creating registro:", error);
    return { success: false, error: error.message };
  }
}

export async function addMantenimiento(data) {
  try {
    const m = await prisma.mantenimiento.create({
      data: {
        vehiculoId: parseInt(data.vehiculoId),
        tipo: data.tipo,
        detalle: data.detalle,
        proximoKm: data.proximoKm ? parseInt(data.proximoKm) : null,
        proximaFecha: data.proximaFecha ? new Date(data.proximaFecha) : null,
        fecha: getArDate()
      }
    });
    
    // Actualizar el vehículo con el nuevo recordatorio
    const updateData = {};
    if (data.tipo === "VTV") updateData.vtvVencimiento = data.proximaFecha ? new Date(data.proximaFecha) : null;
    if (data.tipo === "SEGURO") updateData.seguroVencimiento = data.proximaFecha ? new Date(data.proximaFecha) : null;
    if (data.tipo === "SERVICE") updateData.proximoServiceKm = data.proximoKm ? parseInt(data.proximoKm) : null;
    if (data.tipo === "CUBIERTAS") updateData.proximoCambioCubiertasKm = data.proximoKm ? parseInt(data.proximoKm) : null;
    
    await prisma.vehiculo.update({
      where: { id: parseInt(data.vehiculoId) },
      data: updateData
    });

    revalidatePath("/admin/vehicles/[id]", "page");
    return { success: true, data: m };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


export async function addGasto(formData) {
  try {
    const vehiculoId = parseInt(formData.get("vehiculoId"));
    const monto = parseFloat(formData.get("monto"));
    const descripcion = formData.get("descripcion");
    const tipo = formData.get("tipo");
    const fecha = formData.get("fecha") ? new Date(formData.get("fecha")) : undefined;

    const gasto = await prisma.gasto.create({
      data: { vehiculoId, monto, descripcion, tipo, fecha }
    });
    
    revalidatePath("/admin/vehicles/[id]/expenses", "page");
    revalidatePath("/admin/summary");
    return { success: true, data: gasto };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteGasto(id) {
  try {
    const gasto = await prisma.gasto.findUnique({ where: { id: parseInt(id) } });
    await prisma.gasto.delete({ where: { id: parseInt(id) } });
    if (gasto) revalidatePath(`/admin/vehicles/${gasto.vehiculoId}/expenses`);
    revalidatePath("/admin/summary");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getGastosByVehiculo(vehiculoId) {
  try {
    const gastos = await prisma.gasto.findMany({
      where: { vehiculoId: parseInt(vehiculoId) },
      orderBy: { fecha: 'desc' }
    });
    return { success: true, data: gastos };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteVehiculo(id) {
  try {
    await prisma.vehiculo.delete({ where: { id: parseInt(id) } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteSucursal(id) {
  try {
    await prisma.sucursal.delete({ where: { id: parseInt(id) } });
    revalidatePath("/admin/branches");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateSucursal(id, data) {
  try {
    const s = await prisma.sucursal.update({
      where: { id: parseInt(id) },
      data: {
        nombre: data.nombre,
        direccion: data.direccion
      }
    });
    revalidatePath("/admin/branches");
    return { success: true, data: s };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function generarCodigoAutorizacion(vehiculoId) {
  try {
    const nuevoCodigo = Math.floor(1000 + Math.random() * 9000).toString();
    await prisma.vehiculo.update({
      where: { id: parseInt(vehiculoId) },
      data: { codigoAutorizacion: nuevoCodigo }
    });
    revalidatePath("/admin/vehicles/[id]", "page");
    return { success: true, code: nuevoCodigo };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function resolverNovedad(registroId, resolucion) {
  try {
    await prisma.registroDiario.update({
      where: { id: parseInt(registroId) },
      data: {
        novedadResuelta: true,
        resolucion: resolucion
      }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAutorizacionesPendientes() {
  return { success: true, data: [] };
}

export async function aprobarAutorizacion(id) {
  try {
    const auth = await prisma.autorizacion.findUnique({ where: { id: parseInt(id) } });
    if (!auth) return { success: false, error: "Autorización no encontrada" };

    if (auth.tipo === "DEVICE_BIND") {
      const { deviceId } = JSON.parse(auth.datos);
      await prisma.chofer.update({
        where: { id: auth.choferId },
        data: { deviceId }
      });
    }

    await prisma.autorizacion.update({
      where: { id: parseInt(id) },
      data: { estado: "APROBADA" }
    });

    revalidatePath("/admin/choferes");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function rechazarAutorizacion(id) {
  try {
    await prisma.autorizacion.update({
      where: { id: parseInt(id) },
      data: { estado: "RECHAZADA" }
    });
    revalidatePath("/admin/choferes");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function solicitarAutorizacion(data) {
  return { success: true, estado: "APROBADO", data: { id: 1 } };
}

export async function checkEstadoAutorizacion(id) {
  return { success: true, estado: "APROBADO", data: { id: 1 } };
}

export async function bindDriverToDevice(choferId, deviceId) {
  return { success: true, valid: true };
}

export async function resetSystem() {
  try {
    // Acción peligrosa: Limpiar datos operativos (Bitácoras y Gastos) para nueva temporada
    await prisma.registroDiario.deleteMany({});
    await prisma.gasto.deleteMany({});
    await prisma.autorizacion.deleteMany({});
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


export async function deleteRegistroDiario(id) {
  try {
    await prisma.registroDiario.delete({ where: { id: parseInt(id) } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getMonthlySummary(month, year) {
  try {
    const vehiculos = (await prisma.vehiculo.findMany()) || [];
    const allRegistros = (await prisma.registroDiario.findMany({
      include: { vehiculo: true, sucursales: true }
    })) || [];
    const allGastos = (await prisma.gasto.findMany()) || [];

    const summary = vehiculos.map(v => {
      const records = allRegistros.filter(r => {
        if (!r.fecha) return false;
        const d = new Date(r.fecha);
        return r.vehiculoId === v.id && d.getMonth() === month && d.getFullYear() === year;
      });

      const expenses = allGastos.filter(g => {
        if (!g.fecha) return false;
        const d = new Date(g.fecha);
        return g.vehiculoId === v.id && d.getMonth() === month && d.getFullYear() === year;
      });

      let initialKm = 0;
      let finalKm = 0;
      if (records.length > 0) {
        const sorted = [...records].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        initialKm = sorted[0].kmActual || 0;
        finalKm = sorted[sorted.length - 1].kmActual || 0;
      }

      return {
        id: v.id,
        patente: v.patente,
        kmRecorridos: (finalKm - initialKm) > 0 ? (finalKm - initialKm) : 0,
        totalGastos: expenses.reduce((sum, g) => sum + (g.monto || 0), 0),
        cantidadRegistros: records.length,
        visitasSucursales: records.reduce((sum, r) => sum + (r.sucursales?.length || 0), 0),
        novedades: records.filter(r => r.novedades).map(r => r.novedades)
      };
    });

    const currentMonthRecords = allRegistros.filter(r => {
      if (!r.fecha) return false;
      const d = new Date(r.fecha);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    
    const totalFleetVisits = currentMonthRecords.reduce((sum, r) => sum + (r.sucursales?.length || 0), 0);
    const totalFleetKm = summary.reduce((sum, s) => sum + s.kmRecorridos, 0);
    const unitsUsed = summary.filter(s => s.cantidadRegistros > 0).length;

    // Pricing info updated
    const pricingNote = "Aprox. 70 USD/mes (sujeto a variaciones de proveedores de IA y capacidad)";

    
    const driverStatsMap = {};
    allRegistros.forEach(r => {
      const d = new Date(r.fecha);
      if (d.getMonth() === month && d.getFullYear() === year && r.nombreConductor) {
        if (!driverStatsMap[r.nombreConductor]) {
          driverStatsMap[r.nombreConductor] = {
            nombre: r.nombreConductor,
            vehicles: new Set(),
            totalTrips: 0,
            kmArray: [],
            branchMap: {}
          };
        }
        driverStatsMap[r.nombreConductor].vehicles.add(r.vehiculo?.patente || 'Desconocido');
        if (r.kmActual) driverStatsMap[r.nombreConductor].kmArray.push(r.kmActual);
        
        r.sucursales?.forEach(s => {
            driverStatsMap[r.nombreConductor].totalTrips += 1;
            if (!driverStatsMap[r.nombreConductor].branchMap[s.nombre]) {
                driverStatsMap[r.nombreConductor].branchMap[s.nombre] = { nombre: s.nombre, visitas: 0, lat: -34.6037, lng: -58.3816 };
            }
            driverStatsMap[r.nombreConductor].branchMap[s.nombre].visitas += 1;
        });
      }
    });

    const driverStats = Object.values(driverStatsMap).map(d => {
      let totalKm = 0;
      if (d.kmArray.length > 0) {
         d.kmArray.sort((a, b) => a - b);
         totalKm = d.kmArray[d.kmArray.length - 1] - d.kmArray[0];
      }
      return {
        nombre: d.nombre,
        totalKm: totalKm > 0 ? totalKm : 0,
        vehicles: Array.from(d.vehicles),
        totalTrips: d.totalTrips,
        branchDetails: Object.values(d.branchMap)
      };
    });
    
    return { success: true, data: { summary, driverStats, totalFleetVisits, totalFleetKm, unitsUsed, pricingNote } };
  } catch (error) {
    console.error("Error in getMonthlySummary:", error);
    return { success: false, error: error.message, data: [] };
  }
}


export async function getUltimosRegistros(limit = 10) {
  try {
    const registros = await prisma.registroDiario.findMany({
      take: limit,
      orderBy: { fecha: 'desc' },
      include: {
        vehiculo: true,
        sucursales: true
      }
    });
    return { success: true, data: registros };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getVehiculoById(id) {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: parseInt(id) },
      include: {
        registros: { 
          orderBy: { fecha: 'desc' }, 
          include: { sucursales: true }
        },
      }
    });
    return { success: true, data: vehiculo };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
export async function loginAdmin(formData) {
  const password = typeof formData === "string" ? formData : formData.get("password")?.toString();
  
  if (password === "admin123") {
    const { cookies } = await import("next/headers");
    (await cookies()).set("flotapp_admin_auth", "true", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    // Redirect if it's a form submission (Zero-JS fallback)
    if (typeof formData !== "string") {
      const { redirect } = await import("next/navigation");
      redirect("/admin");
    }
    
    return { success: true };
  }
  return { success: false, error: "Contraseña incorrecta" };
}

export async function logoutAdmin() {
  const { cookies } = await import("next/headers");
  (await cookies()).delete("flotapp_admin_auth", { path: "/" });
  const { redirect } = await import("next/navigation");
  redirect("/");
}

export async function handleDriverEntry(formData) {
  const patente = formData.get("patente")?.toString().toUpperCase().trim();
  if (!patente) {
    return { success: false, error: "La patente es requerida" };
  }

  const res = await getVehiculoByPatente(patente);
  if (res.success && res.data) {
    const { redirect } = await import("next/navigation");
    redirect(`/driver/form?patente=${encodeURIComponent(patente)}`);
  } else {
    return { success: false, error: res.error || "Vehículo no encontrado" };
  }
}

export async function getDailyReport(dateString) {
  try {
    if (!dateString) {
        dateString = new Date().toLocaleString("en-CA", {timeZone: "America/Argentina/Buenos_Aires"}).split(',')[0];
    }
    
    //console.log("Fetching daily report for:", dateString);
    const targetDate = new Date(dateString);
    
    // Check for invalid date
    if (isNaN(targetDate.getTime())) {
        return { success: false, error: "Fecha inválida: " + dateString };
    }

    // Usar una copia para evitar mutaciones que afecten cálculos inesperados
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const registros = await prisma.registroDiario.findMany({
      where: {
        fecha: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        vehiculo: true,
        sucursales: true
      },
      orderBy: { fecha: 'asc' }
    });

    // Calcular estadísticas del día con lógica robusta
    const vehicleData = {};
    const branchBreakdown = {};
    
    registros.forEach(r => {
      if (!r.vehiculoId || !r.vehiculo) return;

      const km = r.kmActual || 0;

      // Vehiculos
      if (!vehicleData[r.vehiculoId]) {
        vehicleData[r.vehiculoId] = { min: km, max: km, visits: 0 };
      }
      vehicleData[r.vehiculoId].min = Math.min(vehicleData[r.vehiculoId].min, km);
      vehicleData[r.vehiculoId].max = Math.max(vehicleData[r.vehiculoId].max, km);
      vehicleData[r.vehiculoId].visits += (r.sucursales?.length || 0);

      // Sucursales
      r.sucursales?.forEach(s => {
        if (s.nombre) {
            branchBreakdown[s.nombre] = (branchBreakdown[s.nombre] || 0) + 1;
        }
      });
    });

    const totalKm = Object.values(vehicleData).reduce((sum, v) => sum + (v.max - v.min), 0);
    const uniqueVehicles = Object.keys(vehicleData).length;
    const totalVisits = Object.values(vehicleData).reduce((sum, v) => sum + v.visits, 0);

    return { 
      success: true, 
      data: {
        registros,
        stats: {
          totalKm,
          uniqueVehicles,
          totalVisits,
          branchBreakdown
        }
      } 
    };
  } catch (error) {
    console.error("Error in getDailyReport:", error);
    return { success: false, error: error.message };
  }
}


// --- STUBS PARA FUNCIONES FALTANTES QUE VERCEL EXIGE ---
export async function getRangeReport(start, end) { return { success: true, data: [] }; }
export async function getConfigLogistica() { return { success: true, data: {} }; }
export async function updateConfigLogistica(data) { return { success: true }; }
export async function finalizeDriverLog(id) { return { success: true }; }
