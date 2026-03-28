"use server";
import prisma from "./prisma";

export async function processExternalEntry(formData) {
  const patente = formData.get("patente")?.toString().toUpperCase().trim();
  const nombreConductor = formData.get("nombreConductor")?.toString().trim();

  if (!patente || !nombreConductor) {
    return { success: false, error: "Patente y Nombre son requeridos" };
  }

  try {
    // 1. Find or Create Vehiculo
    let vehiculo = await prisma.vehiculo.findUnique({
      where: { patente }
    });

    if (!vehiculo) {
      vehiculo = await prisma.vehiculo.create({
        data: {
          patente,
          externo: true,
          activo: true,
          categoria: "PICKUP", 
          tipo: "EXTERNO"
        }
      });
    } else if (!vehiculo.externo || vehiculo.tipo !== "EXTERNO") {
       // Si existía pero no estaba marcado como externo, lo marcamos (o podríamos no hacerlo, pero la idea es que queden registrados)
       await prisma.vehiculo.update({
         where: { id: vehiculo.id },
         data: { externo: true, tipo: "EXTERNO" }
       });
    }

    const { redirect } = await import("next/navigation");
    redirect(`/external/form?patente=${encodeURIComponent(patente)}&driver=${encodeURIComponent(nombreConductor)}`);
    
  } catch (error) {
    console.error("Error in processExternalEntry:", error);
    return { success: false, error: error.message || "Error al procesar ingreso" };
  }
}

export async function getExternalVehicleStatus(patente) {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { patente: patente.toUpperCase() },
      include: {
        InspeccionMensual: {
          orderBy: { fecha: 'desc' },
          take: 1
        },
        registros: {
          orderBy: { fecha: 'desc' },
          take: 1
        }
      }
    });

    if (!vehiculo) return { success: false, error: "Vehículo no encontrado" };

    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    const currentWeekStart = new Date(hoy);
    currentWeekStart.setDate(hoy.getDate() - hoy.getDay() + 1); // Monday
    currentWeekStart.setHours(0,0,0,0);

    let requiredFrequency = "diario";

    // 1. Check if needs Monthly
    const lastMonthly = vehiculo.InspeccionMensual[0];
    if (!lastMonthly || lastMonthly.mes !== mesActual || lastMonthly.anio !== anioActual) {
      requiredFrequency = "mensual";
    } else {
      // 2. Need Weekly? (Has it logged km this week?)
      // Check last log that HAS km
      const lastKmLog = await prisma.registroDiario.findFirst({
        where: { 
          vehiculoId: vehiculo.id,
          kmActual: { not: null }
        },
        orderBy: { fecha: 'desc' }
      });

      if (!lastKmLog || new Date(lastKmLog.fecha) < currentWeekStart) {
        requiredFrequency = "semanal"; // Not logged km this week
      } else {
        requiredFrequency = "diario";
      }
    }

    return { 
      success: true, 
      data: {
        vehiculo,
        requiredFrequency,
        lastMonthly
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function submitExternalLog(data) {
  try {
    const { vehiculoId, driver, requiredFrequency, ...formPayload } = data;
    
    // Extract base fields
    const kmActual = formPayload.kmActual ? parseInt(formPayload.kmActual) : null;
    const montoCombustible = formPayload.montoCombustible ? parseFloat(formPayload.montoCombustible) : null;

    // First: If Monthly, create InspeccionMensual
    if (requiredFrequency === "mensual") {
        const hoy = new Date();
        await prisma.inspeccionMensual.create({
            data: {
               vehiculoId: parseInt(vehiculoId),
               nombreConductor: driver,
               mes: hoy.getMonth() + 1,
               anio: hoy.getFullYear(),
               fotoVTV: formPayload.vtvStatus === "reconfirm" ? (formPayload.prevVtv || null) : "PENDING",
               fotoSeguro: formPayload.seguroStatus === "reconfirm" ? (formPayload.prevSeguro || null) : "PENDING",
               lugarGuardaFijo: formPayload.lugarGuarda === "fija" ? "SI" : "NO",
               lugarGuardaResguardo: formPayload.lugarGuarda === "opcional" ? formPayload.lugarGuardaDetalle : null,
               // we skip actual photo upload binary storage for now to keep JSON payload lean
            }
        });
    }

    // Always create a RegistroDiario to keep track of the log
    const registro = await prisma.registroDiario.create({
      data: {
        vehiculoId: parseInt(vehiculoId),
        esExterno: true,
        nombreConductor: driver,
        frecuenciaRegistro: requiredFrequency,
        kmActual: kmActual,
        nivelCombustible: formPayload.nivelCombustible || null,
        montoCombustible: montoCombustible,
        motivoUso: formPayload.motivoUso === "otro" ? formPayload.motivoUsoOtro : formPayload.motivoUso,
        novedades: formPayload.novedades || null, // Visiitas a sucursales u otros
        lugarGuarda: formPayload.lugarGuarda === "opcional" ? formPayload.lugarGuardaDetalle : "Fija"
      }
    });

    return { success: true, data: registro };
  } catch (error) {
    console.error("Error submitting external log:", error);
    return { success: false, error: error.message };
  }
}
