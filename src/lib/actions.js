"use server";
import prisma from "./prisma.js";
import { revalidatePath } from "next/cache";

export async function getChoferes() {
  try {
    const choferes = await prisma.chofer.findMany({ orderBy: { id: 'asc' } });
    return { success: true, data: choferes };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getChoferesActivos() {
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

export async function addChofer(nombre) {
  try {
    const c = await prisma.chofer.create({
      data: { nombre: nombre.trim().toUpperCase() }
    });
    revalidatePath("/admin/drivers");
    return { success: true, data: c };
  } catch (error) {
    if (error.code === 'P2002') return { success: false, error: "El chofer ya existe" };
    return { success: false, error: error.message };
  }
}

export async function toggleChoferActivo(id, activo) {
  try {
    const c = await prisma.chofer.update({
      where: { id: parseInt(id) },
      data: { activo }
    });
    revalidatePath("/admin/drivers");
    return { success: true, data: c };
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
        registros: { orderBy: { fecha: 'desc' }, take: 1 },
      }
    });

    const prepareSafePayload = (obj) => {
      if (!obj) return obj;
      if (obj instanceof Date) {
        try {
          if (isNaN(obj.getTime())) return null;
          return obj.toISOString(); 
        } catch {
          return null; // Fallback for out-of-range years
        }
      }
      if (Array.isArray(obj)) return obj.map(prepareSafePayload);
      if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) newObj[key] = prepareSafePayload(obj[key]);
        return newObj;
      }
      return obj;
    };

    return { success: true, data: prepareSafePayload(vehiculo) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAllVehiculos() {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      orderBy: { id: 'asc' },
      include: {
        registros: { orderBy: { fecha: 'desc' }, take: 1 },
        inspecciones: { orderBy: { fecha: 'desc' }, take: 1 }
      }
    });

    // Make sure Data serialization works perfectly
    const prepareSafePayload = (obj) => {
      if (!obj) return obj;
      if (obj instanceof Date) {
        try { return isNaN(obj.getTime()) ? null : obj.toISOString(); } catch { return null; }
      }
      if (Array.isArray(obj)) return obj.map(prepareSafePayload);
      if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) newObj[key] = prepareSafePayload(obj[key]);
        return newObj;
      }
      return obj;
    };

    return { success: true, data: prepareSafePayload(vehiculos) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createVehiculo(data) {
  try {
    const v = await prisma.vehiculo.create({
      data: {
        patente: data.patente.toUpperCase().trim(),
        categoria: data.categoria || "PICKUP",
        vtvVencimiento: data.vtvVencimiento ? new Date(data.vtvVencimiento) : null,
        seguroVencimiento: data.seguroVencimiento ? new Date(data.seguroVencimiento) : null,
        proximoServiceKm: data.proximoServiceKm ? parseInt(data.proximoServiceKm) : null,
      }
    });
    revalidatePath("/admin");
    return { success: true, data: v };
  } catch(error) {
    if (error.code === 'P2002') return { success: false, error: "La patente ya existe" };
    return { success: false, error: error.message };
  }
}

export async function updateVehiculo(id, data) {
  try {
    const updateData = { ...data };
    if (updateData.patente) updateData.patente = updateData.patente.toUpperCase().trim();
    if (updateData.vtvVencimiento) updateData.vtvVencimiento = new Date(updateData.vtvVencimiento);
    if (updateData.seguroVencimiento) updateData.seguroVencimiento = new Date(updateData.seguroVencimiento);
    if (updateData.proximoServiceKm !== undefined) updateData.proximoServiceKm = parseInt(updateData.proximoServiceKm) || null;
    // categoria is string, so it passes natively

    const vehiculo = await prisma.vehiculo.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    revalidatePath("/admin/vehicles/[id]", "page");
    revalidatePath("/admin");
    return { success: true, data: vehiculo };
  } catch (error) {
    if (error.code === 'P2002') return { success: false, error: "La patente ya existe" };
    return { success: false, error: error.message };
  }
}

export async function createVehiculoExterno(patente, categoria) {
  try {
    const v = await prisma.vehiculo.create({
      data: {
        patente: patente.toUpperCase().trim(),
        tipo: "EXTERNO",
        categoria: categoria || "PICKUP"
      }
    });
    revalidatePath("/admin");
    return { success: true, data: v };
  } catch(error) {
    if (error.code === 'P2002') return { success: false, error: "La patente ya existe" };
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
      // Ignorar si solo es actualización de sucursales durante el turno (que usa el mismo km)
      if (!data.isBranchUpdateOnly) {
        const vehiculo = await prisma.vehiculo.findUnique({
          where: { id: vehiculoId }
        });

        if (!data.authCode || data.authCode !== vehiculo.codigoAutorizacion) {
          return { success: false, error: "MILEAGE_AUTH_REQUIRED" };
        }

        await prisma.vehiculo.update({
          where: { id: vehiculoId },
          data: { codigoAutorizacion: null }
        });
      }
    }

    const sucursalIds = data.sucursalCounts ? Object.keys(data.sucursalCounts).map(id => parseInt(id)) : [];
    
    const registro = await prisma.registroDiario.create({
      data: {
        vehiculoId,
        kmActual,
        novedades: data.novedades || null,
        nombreConductor: data.nombreConductor || null,
        choferId: data.choferId ? parseInt(data.choferId) : null,
        // Legacy array para retrocompatibilidad
        sucursales: {
          connect: sucursalIds.map(id => ({ id }))
        },
        // Nuevo historial con cantidades
        visitasSucursales: {
          create: Object.entries(data.sucursalCounts || {}).map(([id, count]) => ({
            sucursalId: parseInt(id),
            cantidadVisitas: count
          }))
        },
        // Externos (opcional)
        esExterno: data.esExterno || false,
        nivelCombustible: data.nivelCombustible || null,
        lugarGuarda: data.lugarGuarda || null,
        montoCombustible: data.montoCombustible ? parseFloat(data.montoCombustible) : null,
        fotoTicketCombustible: data.fotoTicketCombustible || null
      }
    });
    revalidatePath("/admin");
    return { success: true, data: registro };
  } catch (error) {
    console.error("Error creating registro:", error);
    return { success: false, error: error.message };
  }
}

export async function createInspeccionMensual(data) {
  try {
    const vehiculoId = parseInt(data.vehiculoId);
    if (isNaN(vehiculoId)) throw new Error("ID de vehículo inválido.");
    
    const now = new Date();
    const mes = now.getMonth() + 1;
    const anio = now.getFullYear();

    let choferName = null;
    if (data.choferId) {
      const dbChofer = await prisma.chofer.findUnique({ where: { id: parseInt(data.choferId) }});
      if (dbChofer) choferName = dbChofer.nombre;
    } else {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      choferName = cookieStore.get("flotapp_externo_session")?.value || "Chofer Externo";
    }

    const inspeccion = await prisma.inspeccionMensual.create({
      data: {
        vehiculoId,
        choferId: data.choferId ? parseInt(data.choferId) : null,
        nombreConductor: choferName,
        mes,
        anio,
        fotoFrente: data.frente || null,
        fotoTrasera: data.trasera || null,
        fotoLateralIzq: data.lateralIzq || null,
        fotoLateralDer: data.lateralDer || null,
        fotoVTV: data.vtv || null,
        fotoSeguro: data.seguro || null,
        lugarGuardaFijo: data.lugarGuardaFijo || null,
        lugarGuardaResguardo: data.lugarGuardaResguardo || null
      }
    });

    revalidatePath("/admin");
    return { success: true, data: inspeccion };
  } catch(error) {
    console.error("Error creating inspeccion:", error);
    if (error.code === 'P2002') return { success: false, error: "Ya existe una inspección para este vehículo en este mes." };
    return { success: false, error: error.message };
  }
}

export async function createMantenimiento(data) {
  try {
    const vehiculoId = parseInt(data.vehiculoId);
    if (isNaN(vehiculoId)) throw new Error("ID de vehículo inválido.");
    
    // Primero, crear el registro de historial
    const mantenimiento = await prisma.mantenimiento.create({
      data: {
        vehiculoId,
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
        tipoServicio: data.tipoServicio,
        descripcion: data.descripcion || null,
        taller: data.taller || null,
        costo: data.costo ? parseFloat(data.costo) : null,
        kilometraje: data.kilometraje ? parseInt(data.kilometraje) : null,
      }
    });

    // Lógica Inteligente: Actualizar semáforos del vehículo según el servicio
    if (data.tipoServicio.toLowerCase().includes("cubiertas") && data.kilometraje) {
       await prisma.vehiculo.update({
          where: { id: vehiculoId },
          data: { ultimoCambioCubiertasKm: parseInt(data.kilometraje) }
       });
    }

    revalidatePath(`/admin/maintenance/${vehiculoId}`, "page");
    revalidatePath("/admin/maintenance");
    return { success: true, data: mantenimiento };
  } catch(error) {
    console.error("Error creating mantenimiento:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMantenimiento(mantenimientoId) {
  try {
    const deleted = await prisma.mantenimiento.delete({
      where: { id: parseInt(mantenimientoId) }
    });
    
    revalidatePath(`/admin/maintenance/${deleted.vehiculoId}`, "page");
    revalidatePath("/admin/maintenance");
    return { success: true };
  } catch(error) {
    console.error("deleteMantenimiento error:", error);
    return { success: false, error: "No se pudo eliminar el registro" };
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

    const currentMonthVisits = allRegistros.filter(r => {
      if (!r.fecha) return false;
      const d = new Date(r.fecha);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    
    const totalFleetVisits = currentMonthVisits.reduce((sum, r) => sum + (r.sucursales?.length || 0), 0);

    return { success: true, data: { summary, totalFleetVisits } };
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
          take: 100,
          include: { sucursales: true }
        },
      }
    });

    const prepareSafePayload = (obj) => {
      if (!obj) return obj;
      if (obj instanceof Date) {
        try {
          if (isNaN(obj.getTime())) return null;
          return obj.toISOString(); 
        } catch {
          return null;
        }
      }
      if (Array.isArray(obj)) return obj.map(prepareSafePayload);
      if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) newObj[key] = prepareSafePayload(obj[key]);
        return newObj;
      }
      return obj;
    };

    return { success: true, data: prepareSafePayload(vehiculo) };
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
    redirect(`/driver/form?v=${res.data.id}`);
  } else {
    return { success: false, error: res.error || "Vehículo no encontrado" };
  }
}

export async function getDailyReport(dateString) {
  try {
    if (!dateString) {
        dateString = new Date().toISOString().split('T')[0];
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

export async function setExternoSession(nombre) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.set("flotapp_externo_session", nombre, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  return { success: true };
}
