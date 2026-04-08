"use server";
import prisma from "./prisma.js";
import { revalidatePath } from "next/cache";
import { calculateSequentialRoute } from "./geoUtils.js";

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

export async function createRegistroDiario(data) {
  try {
    const vehiculoId = data.vehiculoId ? parseInt(data.vehiculoId) : null;
    let kmActual = data.kmActual ? parseInt(data.kmActual) : null;
    let kmModificado = false;

    // Solo buscar último registro si hay un vehiculoId válido
    if (vehiculoId) {
      const lastRecord = await prisma.registroDiario.findFirst({
        where: { vehiculoId, kmActual: { not: null } },
        orderBy: { fecha: 'desc' }
      });

      if (kmActual !== null) {
        if (lastRecord) {
          if (kmActual < lastRecord.kmActual) {
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
            kmModificado = true;
          } else if (kmActual !== lastRecord.kmActual) {
            kmModificado = true;
          }
        }
      }
    }

    const registroData = {
      kmActual,
      kmModificado,
      nivelCombustible: data.nivelCombustible || null,
      motivoUso: data.motivoUso || null,
      novedades: data.novedades || null,
      nombreConductor: data.nombreConductor || null,
      tipoReporte: data.tipoReporte || null,
      lugarGuarda: data.lugarGuarda || null,
      sucursales: {
        connect: data.sucursalIds ? data.sucursalIds.map(id => ({ id: parseInt(id) })) : []
      }
    };

    if (vehiculoId) {
      registroData.vehiculoId = vehiculoId;
    }

    const registro = await prisma.registroDiario.create({
      data: registroData
    });

    revalidatePath("/admin");
    return { success: true, data: registro };
  } catch (error) {
    console.error("Error creating registro:", error);
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

export async function deleteRegistroDiario(id) {
  try {
    console.log("⚠️ Iniciando borrado de registro ID:", id);
    if (!id) {
       console.error("❌ ID de registro no proporcionado");
       return { success: false, error: "ID de registro no proporcionado" };
    }

    const rid = typeof id === 'object' ? parseInt(id.id || id) : parseInt(id);
    
    if (!rid || isNaN(rid)) {
       console.error("❌ ID de registro inválido (NaN)");
       return { success: false, error: "ID de registro inválido" };
    }

    // Usamos una transacción para asegurar que todo o nada ocurra
    const result = await prisma.$transaction(async (tx) => {
       // 1. Desconectar la relación implícita con sucursales
       await tx.registroDiario.update({
         where: { id: rid },
         data: { sucursales: { set: [] } }
       });

       // 2. Borrar las entradas en la tabla de unión explícita (aunque tengan Cascade, lo hacemos manual para mayor seguridad)
       await tx.registroSucursal.deleteMany({
         where: { registroId: rid }
       });

       // 3. Borrar el registro principal
       return await tx.registroDiario.delete({
         where: { id: rid }
       });
    });

    console.log("✅ Registro borrado exitosamente:", rid);

    // Revalidar de manera absoluta (no solo página, sino todo el layout administrativo)
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/reports/daily");
    
    return { success: true };
  } catch (error) {
    console.error("🔥 Error FATAL en deleteRegistroDiario:", error);
    return { success: false, error: `Error detallado: ${error.message}` };
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
        novedades: records.filter(r => r.novedades).map(r => r.novedades),
        ultimoConductor: records[records.length - 1]?.nombreConductor || "S/D"
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
          include: { sucursales: true }
        },
        InspeccionMensual: {
          orderBy: { fecha: 'desc' }
        },
        Mantenimiento: {
          orderBy: { fecha: 'desc' }
        }
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
  const nombreConductor = formData.get("nombreConductor")?.toString();

  if (!patente) {
    return { success: false, error: "La patente es requerida" };
  }

  if (nombreConductor) {
    const { cookies } = await import("next/headers");
    (await cookies()).set("driver_name", nombreConductor, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
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
    // Procesar la fecha localmente para evitar desfases UTC
    const [year, month, day] = dateString.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

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

    // Calcular estadísticas del día con lógica basada en el estado anterior
    const vehicleData = {};
    const branchBreakdown = {};
    
    // Obtener IDs de vehículos únicos que tuvieron actividad hoy
    const vehicleIds = [...new Set(registros.map(r => r.vehiculoId))];
    
    // Para cada vehículo, buscar su lectura inmediatamente anterior a hoy
    const previousKms = {};
    await Promise.all(vehicleIds.map(async (vId) => {
      const lastPrev = await prisma.registroDiario.findFirst({
        where: {
          vehiculoId: vId,
          fecha: { lt: startOfDay }
        },
        orderBy: { fecha: 'desc' },
        select: { kmActual: true }
      });
      previousKms[vId] = lastPrev?.kmActual || null;
    }));

    registros.forEach(r => {
      if (!r.vehiculoId || !r.vehiculo) return;

      const km = r.kmActual || 0;

      // Vehículos
      if (!vehicleData[r.vehiculoId]) {
        // El punto de partida es la lectura anterior a hoy si existe, o la primera de hoy si no
        const startKm = previousKms[r.vehiculoId] !== null ? previousKms[r.vehiculoId] : km;
        vehicleData[r.vehiculoId] = { start: startKm, max: km, visits: 0 };
      }
      
      vehicleData[r.vehiculoId].max = Math.max(vehicleData[r.vehiculoId].max, km);
      vehicleData[r.vehiculoId].visits += (r.sucursales?.length || 0);

      // Sucursales
      r.sucursales?.forEach(s => {
        if (s.nombre) {
            branchBreakdown[s.nombre] = (branchBreakdown[s.nombre] || 0) + 1;
        }
      });
    });

    const registrosMapeados = registros.map(r => {
      const kmTeoricos = calculateSequentialRoute(r.sucursales || []);
      return { 
        ...r, 
        kmTeoricos: parseFloat(kmTeoricos.toFixed(1)) 
      };
    });

    const totalKm = Object.values(vehicleData).reduce((sum, v) => sum + Math.max(0, v.max - v.start), 0);
    const uniqueVehicles = Object.keys(vehicleData).length;
    const totalVisits = Object.values(vehicleData).reduce((sum, v) => sum + v.visits, 0);

    return { 
      success: true, 
      data: {
        registros: registrosMapeados,
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
export async function getAllChoferes() {
  try {
    const choferes = await prisma.chofer.findMany({ 
      where: { activo: true },
      orderBy: { nombre: 'asc' } 
    });
    return { success: true, data: choferes };
  } catch (error) {
    console.error("Error in getAllChoferes:", error);
    return { success: false, error: error.message };
  }
}

export async function addChofer(nombre) {
  try {
    const c = await prisma.chofer.create({
      data: { nombre }
    });
    revalidatePath("/admin/choferes");
    return { success: true, data: c };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteChofer(id) {
  try {
    await prisma.chofer.delete({
      where: { id: parseInt(id) }
    });
    revalidatePath("/admin/choferes");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateChoferPatente(id, patenteAsignada) {
  try {
    const c = await prisma.chofer.update({
      where: { id: parseInt(id) },
      data: { patenteAsignada: patenteAsignada?.trim()?.toUpperCase() || null }
    });
    revalidatePath("/admin/choferes");
    return { success: true, data: c };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function bindDriverToDevice(nombre, deviceId) {
  try {
    const chofer = await prisma.chofer.findUnique({
      where: { nombre }
    });
    if (!chofer) return { success: false, error: "Chofer no encontrado" };

    if (!chofer.passkeyId) {
      // First time logging in, bind the device!
      await prisma.chofer.update({
        where: { id: chofer.id },
        data: { passkeyId: deviceId }
      });
      return { success: true };
    } else if (chofer.passkeyId !== deviceId) {
      // Trying to log in from a DIFFERENT device
      return { success: false, error: "Tu perfil ya está vinculado a otro celular corporativo. Consulta con Administración para resetear tu credencial." };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function resetDriverDevice(id) {
  try {
    await prisma.chofer.update({
      where: { id: parseInt(id) },
      data: { passkeyId: null }
    });
    revalidatePath("/admin/choferes");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function addMantenimiento(data) {
  try {
    const { vehiculoId, tipoServicio, descripcion, taller, costo, kilometraje, fecha } = data;
    const m = await prisma.mantenimiento.create({
      data: {
        vehiculoId: parseInt(vehiculoId),
        tipoServicio,
        descripcion: descripcion || null,
        taller: taller || null,
        costo: costo ? parseFloat(costo) : null,
        kilometraje: kilometraje ? parseInt(kilometraje) : null,
        fecha: fecha ? new Date(fecha) : new Date()
      }
    });

    // Optionally update vehiculo's last service km
    if (tipoServicio.toLowerCase() === "service" || tipoServicio.toLowerCase() === "mantenimiento regular") {
      if (kilometraje) { // update Proximo Service + 10k
         await prisma.vehiculo.update({
           where: { id: parseInt(vehiculoId) },
           data: { proximoServiceKm: parseInt(kilometraje) + 10000 }
         });
      }
    }

    revalidatePath(`/admin/vehicles/${vehiculoId}`);
    return { success: true, data: m };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------
// SISTEMA DE AUTORIZACIÓN DINÁMICA (TÁCTICA)
// ---------------------------------------------------------

export async function resetSystem() {
  if (prisma.$reset) {
    prisma.$reset();
    revalidatePath("/admin/choferes");
    return { success: true };
  }
  return { success: false, error: "Reset not available" };
}

export async function solicitarAutorizacion(nombre, deviceId) {
  console.log("Solicitud de autorización recibida para:", nombre, "Device:", deviceId);
  
  const attemptWithRawSQL = async () => {
    try {
      const rows = await prisma.$queryRawUnsafe(
        'SELECT id, estado FROM "AutorizacionDispositivo" WHERE "deviceId" = $1',
        deviceId
      );
      
      if (rows && rows.length > 0) {
        const existing = rows[0];
        if (existing.estado === "APROBADO") return { success: true, status: "APROBADO" };
        
        await prisma.$executeRawUnsafe(
          'UPDATE "AutorizacionDispositivo" SET "nombreSolicitante" = $1, "estado" = \'PENDIENTE\', "fechaSolicitud" = NOW() WHERE "id" = $2',
          nombre, existing.id
        );
      } else {
        await prisma.$executeRawUnsafe(
          'INSERT INTO "AutorizacionDispositivo" ("nombreSolicitante", "deviceId", "estado", "fechaSolicitud") VALUES ($1, $2, \'PENDIENTE\', NOW())',
          nombre, deviceId
        );
      }
      revalidatePath("/admin/choferes");
      return { success: true, status: "PENDIENTE" };
    } catch (sqlError) {
      console.error("Falla crítica en SQL Directo:", sqlError.message);
      return { success: false, error: "Base de datos no sincronizada. Reinicie sistemas." };
    }
  };

  try {
    if (prisma.autorizacionDispositivo) {
      const existing = await prisma.autorizacionDispositivo.findUnique({ where: { deviceId } });
      if (existing) {
        if (existing.estado === "APROBADO") return { success: true, status: "APROBADO" };
        await prisma.autorizacionDispositivo.update({
          where: { id: existing.id },
          data: { nombreSolicitante: nombre, estado: "PENDIENTE", fechaSolicitud: new Date() }
        });
      } else {
        await prisma.autorizacionDispositivo.create({ data: { nombreSolicitante: nombre, deviceId } });
      }
      revalidatePath("/admin/choferes");
      return { success: true, status: "PENDIENTE" };
    } else {
      return await attemptWithRawSQL();
    }
  } catch (error) {
    console.error("Error en solicitarAutorizacion (Objeto):", error.message);
    return await attemptWithRawSQL();
  }
}

export async function getAutorizacionesPendientes() {
  try {
    if (prisma.autorizacionDispositivo) {
      const solicitudes = await prisma.autorizacionDispositivo.findMany({
        where: { estado: "PENDIENTE" },
        orderBy: { fechaSolicitud: 'desc' }
      });
      return { success: true, data: solicitudes };
    } else {
      const rows = await prisma.$queryRawUnsafe(
        'SELECT * FROM "AutorizacionDispositivo" WHERE "estado" = \'PENDIENTE\' ORDER BY "fechaSolicitud" DESC'
      );
      return { success: true, data: rows };
    }
  } catch (error) {
    console.error("Error en getAutorizacionesPendientes:", error.message);
    try {
      const rows = await prisma.$queryRawUnsafe(
        'SELECT * FROM "AutorizacionDispositivo" WHERE "estado" = \'PENDIENTE\' ORDER BY "fechaSolicitud" DESC'
      );
      return { success: true, data: rows };
    } catch (sqlError) {
      return { success: false, error: sqlError.message };
    }
  }
}

export async function aprobarAutorizacion(id) {
  try {
    if (prisma.autorizacionDispositivo) {
      await prisma.autorizacionDispositivo.update({
        where: { id: parseInt(id) },
        data: { estado: "APROBADO" }
      });
    } else {
      await prisma.$executeRawUnsafe(
        'UPDATE "AutorizacionDispositivo" SET "estado" = \'APROBADO\' WHERE "id" = $1',
        parseInt(id)
      );
    }
    revalidatePath("/admin/choferes");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function rechazarAutorizacion(id) {
  try {
    if (prisma.autorizacionDispositivo) {
      await prisma.autorizacionDispositivo.update({
        where: { id: parseInt(id) },
        data: { estado: "RECHAZADO" }
      });
    } else {
      await prisma.$executeRawUnsafe(
        'UPDATE "AutorizacionDispositivo" SET "estado" = \'RECHAZADO\' WHERE "id" = $1',
        parseInt(id)
      );
    }
    revalidatePath("/admin/choferes");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function checkEstadoAutorizacion(deviceId) {
  try {
    if (prisma.autorizacionDispositivo) {
      const solicitud = await prisma.autorizacionDispositivo.findUnique({
        where: { deviceId }
      });
      return { success: true, estado: solicitud?.estado || "NO_EXISTE" };
    } else {
      const rows = await prisma.$queryRawUnsafe(
        'SELECT "estado" FROM "AutorizacionDispositivo" WHERE "deviceId" = $1',
        deviceId
      );
      return { success: true, estado: rows && rows[0] ? rows[0].estado : "NO_EXISTE" };
    }
  } catch (error) {
    console.error("Error en checkEstadoAutorizacion:", error.message);
    try {
      const rows = await prisma.$queryRawUnsafe(
        'SELECT "estado" FROM "AutorizacionDispositivo" WHERE "deviceId" = $1',
        deviceId
      );
      return { success: true, estado: rows && rows[0] ? rows[0].estado : "NO_EXISTE" };
    } catch (sqlError) {
      return { success: false, error: sqlError.message };
    }
  }
}
