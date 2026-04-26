"use server";
import { getPrisma } from "./prisma.js";
import { revalidatePath } from "next/cache";
import { calculateSequentialRoute } from "./geoUtils.js";
import { getArDate, purify } from "./utils.js";
import { MASTER_CHOFERES, MASTER_VEHICULOS, MASTER_SUCURSALES } from "./constants.js";

export async function getVehiculoByPatente(patente) {
  // Eliminado guardia de construcción manual para forzar visibilidad real
  try {
    if (!patente) return { success: false, error: "Patente requerida" };
    const cleanPatente = patente.toString().replace(/\s+/g, "").toUpperCase().trim();
    const vehiculo = await getPrisma().vehiculo.findUnique({
      where: { patente: cleanPatente },
      include: {
        registros: { orderBy: { fecha: 'desc' }, take: 1 },
      }
    });

    if (!vehiculo) {
      // INTELIGENCIA TACTICA v8.9: Si no está en DB, buscar en MASTER
      const masterV = MASTER_VEHICULOS.find(v => v.patente === cleanPatente);
      if (masterV) {
        return purify({ success: true, data: { ...masterV, id: 0, registros: [] } });
      }
    }

    return purify({ success: true, data: vehiculo });
  } catch (error) {
    // FALLBACK FINAL
    const masterV = MASTER_VEHICULOS.find(v => v.patente === patente);
    return purify({ success: true, data: masterV || { patente: patente, categoria: "AUTO", id: 0, registros: [] } });
  }
}

export async function getDriverOperationalStatus(driverName) {
  try {
    if (!driverName) return { success: false, error: "Nombre de conductor requerido" };
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const lastRecord = await getPrisma().registroDiario.findFirst({
       where: { nombreConductor: driverName, fecha: { gte: todayStart } },
       orderBy: { fecha: 'desc' },
       include: { vehiculo: true }
    });
    if (!lastRecord || lastRecord.tipoReporte === "CIERRE") {
       const cleanName = driverName.toString().trim();
       const choferDB = await getPrisma().chofer.findUnique({ where: { nombre: cleanName } });
       return purify({ success: true, data: { active: false, assignedPatente: choferDB?.patenteAsignada || null, lastKm: 0, proposedKm: 0 } });
    }
    const lastKm = lastRecord.kmActual || 0;
    const addedDistance = lastRecord.kmTeoricos || 0;
    return purify({ success: true, data: { active: true, vehiculo: lastRecord.vehiculo, lastKm: lastKm, proposedKm: lastKm + addedDistance, lastLogType: lastRecord.tipoReporte } });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAllVehiculos() {
  try {
    const vehiculos = await getPrisma().vehiculo.findMany({
      orderBy: { id: 'asc' },
      include: {
        registros: { orderBy: { fecha: 'desc' }, take: 1 },
        Mantenimiento: { orderBy: { fecha: 'desc' } }
      }
    });
    // SI LA DB ESTA VACIA O RESTRINGIDA, USAR MASTER
    if (!vehiculos || vehiculos.length === 0) {
      console.warn("⚠️ USANDO FALLBACK DE VEHICULOS");
      return purify({ success: true, data: MASTER_VEHICULOS.map((v, i) => ({ ...v, id: 900+i, registros: [] })) });
    }
    return purify({ success: true, data: vehiculos });
  } catch (error) {
    console.warn("⚠️ ERROR DB VEHICULOS, USANDO FALLBACK");
    return purify({ success: true, data: MASTER_VEHICULOS.map((v, i) => ({ ...v, id: 900+i, registros: [] })) });
  }
}

export async function createVehiculo(data) {
  try {
    const v = await getPrisma().vehiculo.create({
      data: {
        patente: data.patente.toString().replace(/\s+/g, "").toUpperCase().trim(),
        vtvVencimiento: data.vtvVencimiento ? new Date(data.vtvVencimiento) : null,
        seguroVencimiento: data.seguroVencimiento ? new Date(data.seguroVencimiento) : null,
        proximoServiceKm: data.proximoServiceKm ? parseInt(data.proximoServiceKm) : null,
      }
    });
    revalidatePath("/admin");
    return purify({ success: true, data: v });
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

    const vehiculo = await getPrisma().vehiculo.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    revalidatePath("/admin/vehicles/[id]", "page");
    revalidatePath("/admin");
    return purify({ success: true, data: vehiculo });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAllSucursales() {
  try {
    const sucursales = await getPrisma().sucursal.findMany({ orderBy: { nombre: 'asc' } });
    if (!sucursales || sucursales.length === 0) {
       console.warn("⚠️ USANDO FALLBACK DE SUCURSALES");
       return purify({ success: true, data: MASTER_SUCURSALES });
    }
    return purify({ success: true, data: sucursales });
  } catch (error) {
    console.warn("⚠️ ERROR DB SUCURSALES, USANDO FALLBACK");
    return purify({ success: true, data: MASTER_SUCURSALES });
  }
}

export async function addSucursal(nombre, direccion) {
  try {
    const s = await getPrisma().sucursal.create({
      data: { nombre, direccion }
    });
    revalidatePath("/admin/branches");
    return purify({ success: true, data: s });
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
      const lastRecord = await getPrisma().registroDiario.findFirst({
        where: { vehiculoId, kmActual: { not: null } },
        orderBy: { fecha: 'desc' }
      });

      if (kmActual !== null) {
        if (lastRecord) {
          if (kmActual < lastRecord.kmActual) {
            const vehiculo = await getPrisma().vehiculo.findUnique({
              where: { id: vehiculoId }
            });

            if (!data.authCode || data.authCode !== vehiculo.codigoAutorizacion) {
              return { success: false, error: "MILEAGE_AUTH_REQUIRED" };
            }

            await getPrisma().vehiculo.update({
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

    // Para vehículos no registrados (ID 0), preservamos la patente en novedades para auditoría
    let finalNovedades = data.novedades || "";
    if (!vehiculoId && data.patenteManual) {
      finalNovedades = `[UNIDAD: ${data.patenteManual}] ${finalNovedades}`.trim();
    }

    // CALCULO DE KM TEÓRICOS (TACTICA B8.2)
    let kmTeoricos = 0;
    if (data.sucursalIds && data.sucursalIds.length > 0) {
       const stops = await getPrisma().sucursal.findMany({
          where: { id: { in: data.sucursalIds.map(id => parseInt(id)) } },
          select: { nombre: true }
       });
       const stopNames = stops.map(s => s.nombre);
       kmTeoricos = Math.round(calculateSequentialRoute(stopNames, data.nombreConductor));
    }

    const registroData = {
      kmActual,
      kmModificado,
      kmTeoricos,
      nivelCombustible: data.nivelCombustible || null,
      motivoUso: data.motivoUso || null,
      novedades: finalNovedades || null,
      nombreConductor: data.nombreConductor || null,
      tipoReporte: data.tipoReporte || null,
      lugarGuarda: data.lugarGuarda || null,
      sucursales: {
        connect: (data.sucursalIds && Array.isArray(data.sucursalIds)) ? data.sucursalIds.map(id => ({ id: parseInt(id) })) : []
      }
    };

    if (vehiculoId) {
      registroData.vehiculoId = vehiculoId;
    }

    const registro = await getPrisma().registroDiario.create({
      data: registroData
    });

    // PROTOCOLO DE DOBLE CLICK / DUPLICADOS
    // Si es un reporte estándar, prevenimos duplicados exactos en los siguientes 5 minutos
    // (Lógica implementada en el cliente con localStorage + validación de km aquí si fuera necesario)

    revalidatePath("/admin");
    return purify({ success: true, data: registro });
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

    const gasto = await getPrisma().gasto.create({
      data: { vehiculoId, monto, descripcion, tipo, fecha }
    });
    
    revalidatePath("/admin/vehicles/[id]/expenses", "page");
    revalidatePath("/admin/summary");
    return purify({ success: true, data: gasto });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteGasto(id) {
  try {
    const gasto = await getPrisma().gasto.findUnique({ where: { id: parseInt(id) } });
    await getPrisma().gasto.delete({ where: { id: parseInt(id) } });
    if (gasto) revalidatePath(`/admin/vehicles/${gasto.vehiculoId}/expenses`);
    revalidatePath("/admin/summary");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getGastosByVehiculo(vehiculoId) {
  try {
    const gastos = await getPrisma().gasto.findMany({
      where: { vehiculoId: parseInt(vehiculoId) },
      orderBy: { fecha: 'desc' }
    });
    return purify({ success: true, data: gastos });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getRouteMileage(driverName, sucursalIds) {
  try {
    if (!sucursalIds || sucursalIds.length === 0) return { success: true, data: 0 };
    
    const stops = await getPrisma().sucursal.findMany({
      where: { id: { in: sucursalIds.map(id => parseInt(id)) } },
      select: { nombre: true }
    });
    
    const stopNames = stops.map(s => s.nombre);
    const distance = Math.round(calculateSequentialRoute(stopNames, driverName));
    
    return purify({ success: true, data: distance });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteVehiculo(id) {
  try {
    await getPrisma().vehiculo.delete({ where: { id: parseInt(id) } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteSucursal(id) {
  try {
    const prisma = getPrisma();
    const sid = parseInt(id);
    if (isNaN(sid)) return { success: false, error: "ID inválido" };

    console.log(`PROCESANDO BORRADO TÁCTICO DE SUCURSAL ID: ${sid}`);

    // LIMPIEZA SQL PURA Y DURA (BYPASS DE RESTRICCIONES)
    await prisma.$transaction([
      prisma.$executeRawUnsafe(`DELETE FROM "_RegistroDiarioToSucursal" WHERE "B" = ${sid}`),
      prisma.$executeRawUnsafe(`DELETE FROM "RegistroSucursal" WHERE "sucursalId" = ${sid}`),
      prisma.$executeRawUnsafe(`UPDATE "RegistroDiario" SET "lugarGuarda" = NULL WHERE "lugarGuarda" = '${sid}'`),
      prisma.$executeRawUnsafe(`DELETE FROM "Sucursal" WHERE "id" = ${sid}`)
    ]);

    revalidatePath("/admin/branches");
    return { success: true };
  } catch (error) {
    console.error("FALLO CRÍTICO EN BORRADO SQL:", error);
    // ÚLTIMO RECURSO: Borrado directo por ID (si el Cascade no funcionó)
    try {
        await getPrisma().$executeRawUnsafe(`DELETE FROM "Sucursal" WHERE "id" = ${parseInt(id)}`);
        revalidatePath("/admin/branches");
        return { success: true };
    } catch (e) {
        return { success: false, error: "Error sistémico: La sucursal está protegida por registros históricos." };
    }
  }
}

export async function updateSucursal(id, data) {
  try {
    const s = await getPrisma().sucursal.update({
      where: { id: parseInt(id) },
      data: {
        nombre: data.nombre,
        direccion: data.direccion
      }
    });
    revalidatePath("/admin/branches");
    return purify({ success: true, data: s });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function generarCodigoAutorizacion(vehiculoId) {
  try {
    const nuevoCodigo = Math.floor(1000 + Math.random() * 9000).toString();
    await getPrisma().vehiculo.update({
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
    const result = await getPrisma().$transaction(async (tx) => {
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
  if (process.env.NEXT_PHASE === 'phase-production-build' && !process.env.DATABASE_URL) {
    return { success: true, data: { summary: [], totalFleetVisits: 0, mapBranches: [], driverStats: [] } };
  }

  try {
    let monthNum = parseInt(month);
    let yearNum = parseInt(year);
    if (isNaN(monthNum) || monthNum < 0 || monthNum > 11) monthNum = new Date().getMonth();
    if (isNaN(yearNum) || yearNum < 2000) yearNum = new Date().getFullYear();
    
    const dStart = new Date(yearNum, monthNum, 1, 0, 0, 0, 0);
    const dEnd = new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999);
    
    const isoStart = dStart.toISOString();
    const isoEnd = dEnd.toISOString();

    const [vehiculos, allRegistros, allGastos] = await Promise.all([
      getPrisma().vehiculo.findMany(),
      getPrisma().registroDiario.findMany({
        where: { fecha: { gte: isoStart, lte: isoEnd } },
        include: { sucursales: true }
      }),
      getPrisma().gasto.findMany({
        where: { fecha: { gte: isoStart, lte: isoEnd } }
      })
    ]);

    const summary = [];
    if (Array.isArray(vehiculos)) {
      for (const v of vehiculos) {
        const records = allRegistros
          .filter(r => r.vehiculoId === v.id)
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        const expenses = allGastos.filter(g => g.vehiculoId === v.id);

        let kmRecorridos = 0;
        if (records.length > 1) {
          const initialKm = records[0].kmActual || 0;
          const finalKm = records[records.length - 1].kmActual || initialKm;
          kmRecorridos = Math.max(0, finalKm - initialKm);
        }

        summary.push({
          id: v.id,
          patente: v.patente,
          kmRecorridos,
          totalGastos: expenses.reduce((sum, g) => sum + (g.monto || 0), 0),
          cantidadRegistros: records.length,
           visitasSucursales: records.reduce((sum, r) => sum + (Array.isArray(r.sucursales) ? r.sucursales.length : 0), 0),
          novedades: records.filter(r => r.novedades).map(r => r.novedades),
          ultimoConductor: records[records.length - 1]?.nombreConductor || "S/D"
        });
      }
    }

    const totalFleetVisits = allRegistros.reduce((sum, r) => sum + (Array.isArray(r.sucursales) ? r.sucursales.length : 0), 0);

    const driverBreakdownMap = new Map();
    const mapBranchesMap = new Map();

    const nameConsolidator = (n) => {
        if (!n) return "S/D";
        const clean = n.toString().trim().toUpperCase();
        if (clean.includes("DIEGO RETAMAR") || clean === "DIEGO R") return "DIEGO RETAMAR";
        if (clean.includes("GERARDO VISCONTI") || clean === "GERARDO V") return "GERARDO VISCONTI";
        if (clean.includes("GONZALO") || clean === "GONZALO M" || clean === "GONZALO MARTINEZ") return "GONZALO MARTINEZ";
        if (clean === "VIDEOTES") return "VIDEOTES"; // Mantener por ahora si es prueba de Brian
        return n.toString().trim();
    };

    allRegistros.forEach(r => {
      const driverName = nameConsolidator(r.nombreConductor);
      if (driverName === "VIDEOTES" || driverName === "SISTEMA") return; 

      if (!driverBreakdownMap.has(driverName)) {
        driverBreakdownMap.set(driverName, { 
          nombre: driverName, 
          totalVisitas: 0, 
          totalKm: 0,
          vehicles: new Set(),
          branchesVisited: new Map(), // Cambio a Map para guardar nombre -> visitas
          branchDetails: new Map() 
        });
      }
      const dStats = driverBreakdownMap.get(driverName);
      dStats.vehicles.add(r.vehiculo?.patente || "S/D");
      
      if (Array.isArray(r.sucursales)) {
        r.sucursales.forEach(s => {
          let sName = s.nombre?.trim();
          let sLat = s.lat;
          let sLng = s.lng;

          if (!sName || sName === "" || sName === "Otros") {
             sName = "Otros";
             // Referencia táctica en el Obelisco para "Otros" (Pedido de Brian)
             sLat = -34.6037;
             sLng = -58.3816;
          }
          
          dStats.totalVisitas++;
          
          const currentVisits = dStats.branchesVisited.get(sName) || 0;
          dStats.branchesVisited.set(sName, currentVisits + 1);
          
          // Consideramos válido si tiene coordenadas o si es el fallback del Obelisco
          const hasValidGps = sLat != null && sLng != null && Math.abs(sLat) > 1;

          if (!dStats.branchDetails.has(s.id || sName)) {
              dStats.branchDetails.set(s.id || sName, { 
                id: s.id || sName, 
                nombre: sName, 
                lat: hasValidGps ? Number(sLat) : null, 
                lng: hasValidGps ? Number(sLng) : null, 
                visitas: 1 
              });
          } else {
              dStats.branchDetails.get(s.id || sName).visitas++;
          }

          if (!mapBranchesMap.has(s.id || sName)) {
              mapBranchesMap.set(s.id || sName, { 
                id: s.id || sName, 
                nombre: sName, 
                lat: hasValidGps ? Number(sLat) : null, 
                lng: hasValidGps ? Number(sLng) : null, 
                visitas: 1 
              });
          } else {
              mapBranchesMap.get(s.id || sName).visitas++;
          }
        });
      }
    });

    // Calcular KM por chofer (Aproximación por registros)
    driverBreakdownMap.forEach((stats, name) => {
       const driverLogs = allRegistros.filter(r => (r.nombreConductor || "S/D") === name).sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
       if (driverLogs.length > 1) {
          stats.totalKm = Math.max(0, (driverLogs[driverLogs.length - 1].kmActual || 0) - (driverLogs[0].kmActual || 0));
       }
    });

    const finalData = {
      summary: summary.map(v => ({
        id: String(v.id),
        patente: String(v.patente),
        kmRecorridos: Number(v.kmRecorridos) || 0,
        totalGastos: Number(v.totalGastos) || 0,
        cantidadRegistros: Number(v.cantidadRegistros) || 0,
        visitasSucursales: Number(v.visitasSucursales) || 0,
        ultimoConductor: String(v.ultimoConductor)
      })),
      totalFleetVisits,
      mapBranches: Array.from(mapBranchesMap.values()),
      driverStats: Array.from(driverBreakdownMap.values()).map(d => ({
        nombre: d.nombre,
        totalTrips: d.totalVisitas,
        totalKm: d.totalKm,
        vehicles: Array.from(d.vehicles),
        branchesVisited: Array.from(d.branchesVisited.entries()).map(([nombre, visitas]) => ({ nombre, visitas })),
        branchDetails: Array.from(d.branchDetails.values())
      }))
    };

    return { success: true, data: JSON.parse(JSON.stringify(finalData)) };
  } catch (error) {
    console.error("Error in getMonthlySummary:", error);
    return { 
      success: false, 
      error: error.message, 
      data: { summary: [], totalFleetVisits: 0, mapBranches: [] } 
    };
  }
}

export async function getUltimosRegistros(limit = 10) {
  try {
    const registros = await getPrisma().registroDiario.findMany({
      take: limit,
      orderBy: { fecha: 'desc' },
      include: {
        vehiculo: true,
        sucursales: true
      }
    });
    return purify({ success: true, data: registros });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getVehiculoById(id) {
  try {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      // Si la ID no es un nmero, es probable que estemos en modo fallback (Ej: "SD")
      const patente = String(id);
      const masterV = MASTER_VEHICULOS.find(v => v.patente === patente);
      if (masterV) return purify({ success: true, data: { ...masterV, id: 0, registros: [] } });
      return { success: false, error: "ID de vehculo invlida" };
    }
    const vehiculo = await getPrisma().vehiculo.findUnique({
      where: { id: numericId },
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
    return purify({ success: true, data: vehiculo });
  } catch (error) {
    return { success: false, error: error.message };
  }
}


export async function handleDriverEntry(formData) {
  const patenteRaw = formData.get("patente")?.toString();
  const patente = patenteRaw?.replace(/\s+/g, "").toUpperCase().trim();
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

  const { redirect } = await import("next/navigation");
  redirect(`/driver/form?patente=${encodeURIComponent(patente)}`);
}

export async function getDailyReport(dateString) {
  try {
    // Procesar la fecha localmente para evitar desfases UTC
    const dateParts = dateString?.split('-').map(Number) || [];
    let year, month, day;

    if (dateParts.length === 3 && !dateParts.some(isNaN)) {
      [year, month, day] = dateParts;
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
      day = now.getDate();
    }

    const dStart = new Date(year, month - 1, day, 0, 0, 0, 0);
    const dEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

    if (isNaN(dStart.getTime())) {
      throw new Error("Fecha de reporte diaria inválida");
    }

    const isoStart = dStart.toISOString();
    const isoEnd = dEnd.toISOString();

    const registros = (await getPrisma().registroDiario.findMany({
      where: {
        fecha: {
          gte: isoStart,
          lte: isoEnd
        }
      },
      include: {
        vehiculo: true,
        sucursales: true
      },
      orderBy: { fecha: 'asc' }
    })) || [];

    const allPrev = await getPrisma().registroDiario.findMany({
      where: { fecha: { lt: isoStart } },
      orderBy: { fecha: 'desc' },
      select: { vehiculoId: true, kmActual: true }
    });

    const previousKms = {};
    allPrev.forEach(r => {
      if (r.vehiculoId && previousKms[r.vehiculoId] === undefined) {
        previousKms[r.vehiculoId] = r.kmActual;
      }
    });

    const vehicleData = {};
    const branchBreakdown = {};
    
    registros.forEach(r => {
      const km = r.kmActual || 0;
      const vehicleKey = r.vehiculoId || "SD";

      if (!vehicleData[vehicleKey]) {
        const startKm = (r.vehiculoId && previousKms[r.vehiculoId] !== undefined) ? previousKms[r.vehiculoId] : km;
        vehicleData[vehicleKey] = { 
          start: startKm, 
          max: km, 
          visits: 0,
          patente: r.vehiculo?.patente || "S/D" 
        };
      }
      
      vehicleData[vehicleKey].max = Math.max(vehicleData[vehicleKey].max, km);
      vehicleData[vehicleKey].visits += (r.sucursales?.length || 0);

      // Sucursales (Procesar siempre)
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

    // SERIALIZACIÓN ATÓMICA v2.0 (Protección absoluta contra Error 500)
    const finalRegistros = registrosMapeados.map(r => ({
      id: String(r.id),
      fecha: r.fecha instanceof Date ? r.fecha.toISOString() : String(r.fecha),
      kmActual: Number(r.kmActual) || 0,
      kmTeoricos: Number(r.kmTeoricos) || 0,
      nombreConductor: String(r.nombreConductor || "Sin Asignar"),
      tipoReporte: String(r.tipoReporte || "REGISTRO"),
      novedades: String(r.novedades || ""),
      vehiculo: r.vehiculo ? { patente: String(r.vehiculo.patente) } : null,
      sucursales: Array.isArray(r.sucursales) ? r.sucursales.map(s => ({ id: String(s.id), nombre: String(s.nombre) })) : []
    }));

    const finalData = {
      registros: finalRegistros,
      stats: {
        totalKm: Number(totalKm) || 0,
        uniqueVehicles: Number(uniqueVehicles) || 0,
        totalVisits: Number(totalVisits) || 0,
        branchBreakdown: branchBreakdown || {}
      }
    };

    return purify({ 
      success: true, 
      data: finalData
    });
  } catch (error) {
    console.error("Error in getDailyReport:", error);
    return { success: false, error: error.message };
  }
}

 /**
  * PROTOCOLO DE PUREZA v6.0.0
  * Eliminado de appActions (Server Side) para compatibilidad con Next.js.
  * Ahora reside en utils.js.
  */
export async function getAllChoferes() {
  try {
    const prisma = getPrisma();
    const choferes = await prisma.chofer.findMany({ 
      where: { activo: true },
      orderBy: { nombre: 'asc' } 
    });
    if (!choferes || choferes.length === 0) {
      return purify({ success: true, data: MASTER_CHOFERES.map((n, i) => ({ id: 900+i, nombre: n })) });
    }
    return purify({ success: true, data: choferes });
  } catch (error) {
    console.warn("⚠️ ERROR DB CHOFERES, USANDO FALLBACK");
    return purify({ success: true, data: MASTER_CHOFERES.map((n, i) => ({ id: 900+i, nombre: n })) });
  }
}

export async function addChofer(nombre) {
  try {
    const cleanName = nombre?.toString().trim();
    if (!cleanName) return { success: false, error: "Nombre requerido" };
    
    // Check if already exists to avoid 500 on unique constraint
    const existing = await getPrisma().chofer.findUnique({ where: { nombre: cleanName } });
    if (existing) return { success: true, data: existing };

    const c = await getPrisma().chofer.create({
      data: { nombre: cleanName }
    });
    revalidatePath("/admin/choferes");
    return purify({ success: true, data: c });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteChofer(id) {
  try {
    await getPrisma().chofer.delete({
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
    const c = await getPrisma().chofer.update({
      where: { id: parseInt(id) },
      data: { patenteAsignada: patenteAsignada?.toString().replace(/\s+/g, "").toUpperCase().trim() || null }
    });
    revalidatePath("/admin/choferes");
    return purify({ success: true, data: c });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getDriverTodayInfo(id) {
  try {
    const chofer = await getPrisma().chofer.findUnique({
      where: { id: parseInt(id) }
    });
    if (!chofer) return { success: false, error: "Chofer no encontrado" };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const registros = await getPrisma().registroDiario.findMany({
      where: {
        nombreConductor: chofer.nombre,
        fecha: { gte: todayStart, lte: todayEnd }
      },
      include: { sucursales: true },
      orderBy: { fecha: 'asc' }
    });

    const mapBranchesMap = new Map();
    registros.forEach(r => {
      r.sucursales?.forEach(s => {
        if (!mapBranchesMap.has(s.id)) {
          mapBranchesMap.set(s.id, { id: s.id, nombre: s.nombre, lat: s.lat, lng: s.lng, visitas: 1 });
        } else {
          const b = mapBranchesMap.get(s.id);
          b.visitas++;
        }
      });
    });

    return purify({ 
      success: true, 
      data: { 
        chofer, 
        mapBranches: Array.from(mapBranchesMap.values()),
        totalRegistrosHoy: registros.length
      } 
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function bindDriverToDevice(driverName, deviceId) {
  try {
    if (!driverName) return { success: false, error: "Nombre requerido" };
    // MODO ULTRA RESILIENTE: Si la DB falla, permitimos el login igual para no bloquear al chofer
    try {
      const prisma = getPrisma();
      const existing = await prisma.autorizacionDispositivo.findUnique({ where: { deviceId } });
      if (existing) {
        await prisma.autorizacionDispositivo.update({
          where: { deviceId },
          data: { nombreSolicitante: driverName, estado: "APROBADO" }
        });
      } else {
        await prisma.autorizacionDispositivo.create({
          data: { deviceId, nombreSolicitante: driverName, estado: "APROBADO" }
        });
      }
    } catch (e) {
      console.warn("⚠️ FALLA VINCULACIÓN DB (SILENCIOSA)");
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function resetDriverDevice(id) {
  try {
    await getPrisma().chofer.update({
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
    const m = await getPrisma().mantenimiento.create({
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

    // 1. Service regular (cada 10k)
    if (tipoServicio.toLowerCase().includes("service") || tipoServicio.toLowerCase().includes("mantenimiento regular")) {
      if (kilometraje) {
         await getPrisma().vehiculo.update({
           where: { id: parseInt(vehiculoId) },
           data: { proximoServiceKm: parseInt(kilometraje) + 10000 }
         });
      }
    }

    // 2. Cambio de Cubiertas (TÁCTICA v8.3)
    if (tipoServicio.toLowerCase().includes("cubierta") || tipoServicio.toLowerCase().includes("neumático") || tipoServicio.toLowerCase().includes("goma")) {
      if (kilometraje) {
         await getPrisma().vehiculo.update({
           where: { id: parseInt(vehiculoId) },
           data: { ultimoCambioCubiertasKm: parseInt(kilometraje) }
         });
         console.log(`🛞 KM de cubiertas actualizado para vehículo ${vehiculoId} a ${kilometraje}`);
      }
    }

    revalidatePath(`/admin/vehicles/${vehiculoId}`);
    return purify({ success: true, data: m });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------
// SISTEMA DE AUTORIZACIÓN DINÁMICA (TÁCTICA)
// ---------------------------------------------------------

export async function resetSystem() {
  if (getPrisma().$reset) {
    getPrisma().$reset();
    revalidatePath("/admin/choferes");
    return { success: true };
  }
  return { success: false, error: "Reset not available" };
}

export async function solicitarAutorizacion(nombre, deviceId) {
  console.log("Solicitud de autorización recibida para:", nombre, "Device:", deviceId);
  
  const attemptWithRawSQL = async () => {
    try {
      const rows = await getPrisma().$queryRawUnsafe(
        'SELECT id, estado FROM "AutorizacionDispositivo" WHERE "deviceId" = $1',
        deviceId
      );
      
      if (rows && rows.length > 0) {
        const existing = rows[0];
        if (existing.estado === "APROBADO") return { success: true, status: "APROBADO" };
        
        await getPrisma().$executeRawUnsafe(
          'UPDATE "AutorizacionDispositivo" SET "nombreSolicitante" = $1, "estado" = \'PENDIENTE\', "fechaSolicitud" = NOW() WHERE "id" = $2',
          nombre, existing.id
        );
      } else {
        await getPrisma().$executeRawUnsafe(
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
    if (getPrisma().autorizacionDispositivo) {
      const existing = await getPrisma().autorizacionDispositivo.findUnique({ where: { deviceId } });
      if (existing) {
        if (existing.estado === "APROBADO") return { success: true, status: "APROBADO" };
        await getPrisma().autorizacionDispositivo.update({
          where: { id: existing.id },
          data: { nombreSolicitante: nombre, estado: "PENDIENTE", fechaSolicitud: new Date() }
        });
      } else {
        await getPrisma().autorizacionDispositivo.create({ data: { nombreSolicitante: nombre, deviceId } });
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
    if (getPrisma().autorizacionDispositivo) {
      const solicitudes = await getPrisma().autorizacionDispositivo.findMany({
        where: { estado: "PENDIENTE" },
        orderBy: { fechaSolicitud: 'desc' }
      });
      return purify({ success: true, data: solicitudes });
    } else {
      const rows = await getPrisma().$queryRawUnsafe(
        'SELECT * FROM "AutorizacionDispositivo" WHERE "estado" = \'PENDIENTE\' ORDER BY "fechaSolicitud" DESC'
      );
      return purify({ success: true, data: rows });
    }
  } catch (error) {
    console.error("Error en getAutorizacionesPendientes:", error.message);
    try {
      const rows = await getPrisma().$queryRawUnsafe(
        'SELECT * FROM "AutorizacionDispositivo" WHERE "estado" = \'PENDIENTE\' ORDER BY "fechaSolicitud" DESC'
      );
      return purify({ success: true, data: rows });
    } catch (sqlError) {
      return { success: false, error: sqlError.message };
    }
  }
}

export async function aprobarAutorizacion(id) {
  try {
    if (getPrisma().autorizacionDispositivo) {
      await getPrisma().autorizacionDispositivo.update({
        where: { id: parseInt(id) },
        data: { estado: "APROBADO" }
      });
    } else {
      await getPrisma().$executeRawUnsafe(
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
    if (getPrisma().autorizacionDispositivo) {
      await getPrisma().autorizacionDispositivo.update({
        where: { id: parseInt(id) },
        data: { estado: "RECHAZADO" }
      });
    } else {
      await getPrisma().$executeRawUnsafe(
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
    if (getPrisma().autorizacionDispositivo) {
      const solicitud = await getPrisma().autorizacionDispositivo.findUnique({
        where: { deviceId }
      });
      return { success: true, estado: solicitud?.estado || "NO_EXISTE" };
    } else {
      const rows = await getPrisma().$queryRawUnsafe(
        'SELECT "estado" FROM "AutorizacionDispositivo" WHERE "deviceId" = $1',
        deviceId
      );
      return { success: true, estado: rows && rows[0] ? rows[0].estado : "NO_EXISTE" };
    }
  } catch (error) {
    console.error("Error en checkEstadoAutorizacion:", error.message);
    try {
      const rows = await getPrisma().$queryRawUnsafe(
        'SELECT "estado" FROM "AutorizacionDispositivo" WHERE "deviceId" = $1',
        deviceId
      );
      return { success: true, estado: rows && rows[0] ? rows[0].estado : "NO_EXISTE" };
    } catch (sqlError) {
      return { success: false, error: sqlError.message };
    }
  }
}

// ---------------------------------------------------------
// FUNCIONES DE UTILIDAD - ZONA HORARIA ARGENTINA
// ---------------------------------------------------------

// ---------------------------------------------------------
// TRAZABILIDAD DE CONDUCTORES (C4 Journey Traceability)
// ---------------------------------------------------------

/**
 * Devuelve todos los registros de un conductor para una fecha dada.
 * @param {string} driverName
 * @param {string} [dateString] - "YYYY-MM-DD", por defecto hoy en Argentina
 */
export async function getDriverTraces(driverName, dateString) {
  try {
    if (!driverName) return { success: false, error: "Nombre de conductor requerido" };
    if (!process.env.DATABASE_URL) return { success: true, data: [] };

    const ds = dateString || getArDate();
    const [year, month, day] = ds.split("-").map(Number);
    const isoStart = new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
    const isoEnd   = new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();

    const registros = await getPrisma().registroDiario.findMany({
      where: {
        nombreConductor: driverName,
        fecha: { gte: isoStart, lte: isoEnd },
      },
      include: { vehiculo: true, sucursales: true },
      orderBy: { fecha: "asc" },
    });

    return purify({ success: true, data: registros });
  } catch (error) {
    console.error("Error in getDriverTraces:", error);
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------
// CRON - CIERRE AUTOMÁTICO DE TURNOS INTERNOS
// ---------------------------------------------------------

/**
 * Detecta todos los conductores que tienen turnos abiertos del día anterior
 * y no registraron un CIERRE. Crea un CIERRE automático para cada uno.
 */
export async function autoCloseInternalShifts() {
  try {
    if (!process.env.DATABASE_URL) return { success: true, closed: 0 };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Registros abiertos (APERTURA o PARADA) de días anteriores
    const openShifts = await getPrisma().registroDiario.findMany({
      where: {
        tipoReporte: { in: ["APERTURA", "PARADA"] },
        fecha: { lt: todayStart },
      },
      orderBy: { fecha: "desc" },
    });

    // Agrupar por conductor, quedarse con el último registro abierto
    const latestByDriver = {};
    for (const shift of openShifts) {
      const key = shift.nombreConductor || `vehiculo_${shift.vehiculoId}`;
      if (!latestByDriver[key]) latestByDriver[key] = shift;
    }

    let closedCount = 0;
    for (const shift of Object.values(latestByDriver)) {
      // Verificar si ya existe un CIERRE posterior
      const hasClose = await getPrisma().registroDiario.findFirst({
        where: {
          nombreConductor: shift.nombreConductor,
          tipoReporte: "CIERRE",
          fecha: { gt: shift.fecha },
        },
      });
      if (!hasClose) {
        await getPrisma().registroDiario.create({
          data: {
            vehiculoId: shift.vehiculoId || null,
            nombreConductor: shift.nombreConductor,
            tipoReporte: "CIERRE",
            kmActual: shift.kmActual,
            novedades: "[AUTO-CIERRE] Turno cerrado automáticamente por el sistema.",
            sucursales: { connect: [] },
          },
        });
        closedCount++;
      }
    }

    revalidatePath("/admin");
    return { success: true, closed: closedCount };
  } catch (error) {
    console.error("Error in autoCloseInternalShifts:", error);
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------
// NOVEDADES DE MANTENIMIENTO
// ---------------------------------------------------------

/**
 * Devuelve los últimos registros con novedades no resueltas (campo novedades no nulo).
 */
export async function getNovedadesPendientes() {
  try {
    if (!process.env.DATABASE_URL) return { success: true, data: [] };

    const registros = await getPrisma().registroDiario.findMany({
      where: { novedades: { not: null } },
      orderBy: { fecha: "desc" },
      take: 60,
      include: { vehiculo: true },
    });

    const novedades = registros
      .filter(r => r.novedades && r.novedades.trim() !== "" && !r.novedades.startsWith("[AUTO-CIERRE]"))
      .map(r => ({
        id: r.id,
        fecha: r.fecha,
        novedades: r.novedades,
        patente: r.vehiculo?.patente || "S/D",
        conductor: r.nombreConductor || "S/D",
        vehiculoId: r.vehiculoId,
      }));

    return purify({ success: true, data: novedades });
  } catch (error) {
    console.error("Error in getNovedadesPendientes:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Marca una novedad como resuelta vaciando el campo novedades del registro.
 */
export async function resolveNovedad(id) {
  try {
    await getPrisma().registroDiario.update({
      where: { id: parseInt(id) },
      data: { novedades: null },
    });
    revalidatePath("/admin");
    revalidatePath("/admin/mantenimiento");
    return { success: true };
  } catch (error) {
    console.error("Error in resolveNovedad:", error);
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------
// REPORTE POR RANGO DE FECHAS
// ---------------------------------------------------------

/**
 * Devuelve registros y estadísticas de flota para un rango de fechas.
 * @param {string} startDateStr - "YYYY-MM-DD"
 * @param {string} endDateStr   - "YYYY-MM-DD"
 */
export async function getRangeReport(startDateStr, endDateStr) {
  try {
    if (!process.env.DATABASE_URL) return { success: true, data: { registros: [], stats: {} } };

    const [sy, sm, sd] = startDateStr.split("-").map(Number);
    const [ey, em, ed] = endDateStr.split("-").map(Number);
    const isoStart = new Date(sy, sm - 1, sd, 0, 0, 0, 0).toISOString();
    const isoEnd   = new Date(ey, em - 1, ed, 23, 59, 59, 999).toISOString();

    const registros = (await getPrisma().registroDiario.findMany({
      where: { fecha: { gte: isoStart, lte: isoEnd } },
      include: { vehiculo: true, sucursales: true },
      orderBy: { fecha: "asc" },
    })) || [];

    const branchBreakdown = {};
    const vehicleDataMap = {};

    registros.forEach(r => {
      const vKey = r.vehiculoId || "SD";
      if (!vehicleDataMap[vKey]) {
        vehicleDataMap[vKey] = {
          patente: r.vehiculo?.patente || "S/D",
          visits: 0,
          registros: 0,
          conductores: new Set(),
        };
      }
      vehicleDataMap[vKey].registros++;
      vehicleDataMap[vKey].visits += r.sucursales?.length || 0;
      if (r.nombreConductor) vehicleDataMap[vKey].conductores.add(r.nombreConductor);

      r.sucursales?.forEach(s => {
        branchBreakdown[s.nombre] = (branchBreakdown[s.nombre] || 0) + 1;
      });
    });

    const totalKm = registros.reduce((sum, r) => sum + (r.kmTeoricos || 0), 0);
    const uniqueVehicles = Object.keys(vehicleDataMap).length;
    const totalVisits = Object.values(vehicleDataMap).reduce((sum, v) => sum + v.visits, 0);

    const vehicleData = Object.values(vehicleDataMap).map(v => ({
      ...v,
      conductores: Array.from(v.conductores),
    }));

    return purify({
      success: true,
      data: {
        registros,
        stats: { totalKm, uniqueVehicles, totalVisits, branchBreakdown },
        vehicleData,
      },
    });
  } catch (error) {
    console.error("Error in getRangeReport:", error);
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------
// GPS TRACKING (PULSO SILENCIOSO)
// ---------------------------------------------------------

/**
 * Registra la posición GPS actual de un conductor en su último registro abierto.
 * @param {{ driverName: string, vehiculoId?: number, lat: number, lng: number }} payload
 */
export async function trackGpsPulse({ driverName, vehiculoId, lat, lng }) {
  try {
    if (!process.env.DATABASE_URL) return { success: true };
    if (!driverName || lat == null || lng == null) {
      return { success: false, error: "Datos GPS incompletos" };
    }

    const latestRegistro = await getPrisma().registroDiario.findFirst({
      where: {
        nombreConductor: driverName,
        tipoReporte: { not: "CIERRE" },
      },
      orderBy: { fecha: "desc" },
    });

    if (latestRegistro) {
      await getPrisma().registroDiario.update({
        where: { id: latestRegistro.id },
        data: {
          lugarGuarda: `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error in trackGpsPulse:", error);
    return { success: false, error: error.message };
  }
}
export async function getConfigLogistica() {
  try {
    const prisma = getPrisma();
    const config = await prisma.configLogistica.findMany();
    const map = {};
    config.forEach(c => { map[c.key] = c.value; });
    
    // WHATSAPP DEFINITIVO (Grabado en el núcleo para Modo Resiliente)
    const norteFinal = "5491180591342";
    const stFinal = "5491128620002";
    
    if (!map["PHONE_NORTE"] || map["PHONE_NORTE"].includes("111111111")) map["PHONE_NORTE"] = norteFinal;
    if (!map["PHONE_SANTELMO"] || map["PHONE_SANTELMO"].includes("222222222")) map["PHONE_SANTELMO"] = stFinal;
    
    return purify({ success: true, data: map });
  } catch (error) {
    console.warn("⚠️ FALLO CARGA CONFIG, USANDO DEFAULT");
    return purify({ success: true, data: { "PHONE_NORTE": "5491180591342", "PHONE_SANTELMO": "5491128620002" } });
  }
}

export async function updateConfigLogistica(data) {
  try {
    console.log("Intentando guardar ajustes de logística:", data);
    const prisma = getPrisma();
    
    // Ejecutar uno por uno para mayor estabilidad si falla el transaction
    for (const [key, value] of Object.entries(data)) {
      await prisma.configLogistica.upsert({
        where: { key },
        update: { value: value.toString() },
        create: { key, value: value.toString() }
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error crítico guardando ajustes:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getMonthlyReport(month, year) {
  try {
    const prisma = getPrisma();
    const yearNum = parseInt(year);
    const monthNum = parseInt(month) - 1; // JS month 0-indexed
    
    const isoStart = new Date(yearNum, monthNum, 1, 0, 0, 0, 0).toISOString();
    const isoEnd = new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999).toISOString();

    const vehiculos = await prisma.vehiculo.findMany();
    const allRegistros = await prisma.registroDiario.findMany({
      where: { fecha: { gte: isoStart, lte: isoEnd } },
      include: { vehiculo: true, sucursales: true }
    });

    const summary = vehiculos.map(v => {
      const records = allRegistros.filter(r => r.vehiculoId === v.id);
      let initialKm = 0; let finalKm = 0;
      if (records.length > 0) {
        const sorted = [...records].sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
        initialKm = sorted[0].kmActual || 0;
        finalKm = sorted[sorted.length - 1].kmActual || 0;
      }
      return {
        patente: v.patente,
        modelo: v.modelo,
        categoria: v.categoria,
        totalKm: (finalKm - initialKm) > 0 ? (finalKm - initialKm) : 0,
        totalTrips: records.reduce((sum, r) => sum + (r.sucursales?.length || 0), 0)
      };
    });

    const totalKm = summary.reduce((sum, v) => sum + v.totalKm, 0);
    const totalTrips = summary.reduce((sum, v) => sum + v.totalTrips, 0);

    return purify({ success: true, data: { vehicles: summary, totalKm, totalTrips } });
  } catch (error) {
    console.error("Error en getMonthlyReport:", error);
    // FALLBACK SEGURO PARA EL LIBRO
    return purify({ 
      success: true, 
      data: { vehicles: MASTER_VEHICULOS.map(v => ({ ...v, totalKm: 0, totalTrips: 0 })), totalKm: 0, totalTrips: 0 }
    });
  }
}

export async function finalizeDriverLog(id) {
  try {
    const rid = parseInt(id);
    if (!rid || isNaN(rid)) return { success: false, error: "ID inválido" };
    
    await getPrisma().registroDiario.update({
      where: { id: rid },
      data: { tipoReporte: "CIERRE" }
    });
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

