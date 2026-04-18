"use server";
import { getPrisma } from "./prisma.js";

import { revalidatePath } from "next/cache";

export async function processExternalEntry(formData) {
  const patente = formData.get("patente")?.toString().toUpperCase().trim();
  const nombreConductor = formData.get("nombreConductor")?.toString().trim();

  if (!patente || !nombreConductor) {
    return { success: false, error: "Patente y Nombre son requeridos" };
  }

    let redirectTo = "";
    try {
      // 1. Find or Create Vehiculo
      let vehiculo = await getPrisma().vehiculo.findUnique({
        where: { patente }
      });
  
      if (!vehiculo) {
        vehiculo = await getPrisma().vehiculo.create({
          data: {
            patente,
            activo: true,
            categoria: (patente.length > 6) ? "PICKUP" : "AUTO", 
            tipo: "EXTERNO"
          }
        });
      }
  
      redirectTo = `/external/form?patente=${encodeURIComponent(patente)}&driver=${encodeURIComponent(nombreConductor)}`;
      
    } catch (error) {
      console.error("Error in processExternalEntry:", error);
      return { success: false, error: error.message || "Error al procesar ingreso" };
    }
  
    if (redirectTo) {
      const { redirect } = await import("next/navigation");
      redirect(redirectTo);
    }
  }

export async function getExternalVehicleStatus(patente) {
  // GUARDIA DE CONSTRUCCIÓN (BUILD-TIME GUARD)
  // Si no hay patente o estamos en un entorno sin DB durante el build, evitamos el crash.
  if (!patente || patente === "N/A" || !process.env.DATABASE_URL) {
    return { success: false, error: "Modo de construcción o patente inválida" };
  }

  try {
    const vehiculo = await getPrisma().vehiculo.findUnique({
      where: { patente: patente.toUpperCase() },
      include: {
        InspeccionMensual: {
          orderBy: { fecha: 'desc' },
          take: 1
        },
        registros: {
          orderBy: { fecha: 'desc' },
          take: 5 // Tomamos más para analizar el flujo del día
        }
      }
    });

    if (!vehiculo) return { success: false, error: "Vehículo no encontrado" };

    const hoy = new Date();
    const hoyInicio = new Date(hoy.setHours(0,0,0,0));
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    const day = hoy.getDay();
    const diff = hoy.getDate() - day + (day === 0 ? -6 : 1);
    const currentWeekStart = new Date(hoy.setDate(diff));
    currentWeekStart.setHours(0,0,0,0);

    let requiredFrequency = "diario";

    // 1. Check if needs Monthly (Si no hay inspección este mes)
    const lastMonthly = vehiculo.InspeccionMensual[0];
    const isNewMonth = !lastMonthly || lastMonthly.mes !== mesActual || lastMonthly.anio !== anioActual;
    
    if (isNewMonth) {
      requiredFrequency = "mensual";
    } else {
      // 2. Need Weekly? (Si no hay un registro con KM esta semana)
      const lastKmLog = await getPrisma().registroDiario.findFirst({
        where: { 
          vehiculoId: vehiculo.id,
          kmActual: { not: null },
          fecha: { gte: currentWeekStart }
        },
        orderBy: { fecha: 'desc' }
      });

      if (!lastKmLog) {
        requiredFrequency = "semanal";
      } else {
        // 3. Diario: ¿Inicio o Cierre?
        const lastLogToday = await getPrisma().registroDiario.findFirst({
          where: {
            vehiculoId: vehiculo.id,
            fecha: { gte: hoyInicio }
          },
          orderBy: { fecha: 'desc' }
        });

        if (!lastLogToday || lastLogToday.frecuenciaRegistro === "mensual" || lastLogToday.frecuenciaRegistro === "semanal") {
          // Si es el primer toque del día (después de mensual/semanal), es INICIO DIARIO
          requiredFrequency = "diario_inicio";
        } else {
          // Si ya hubo un inicio diario, toca CIERRE DIARIO
          requiredFrequency = "diario_cierre";
        }
      }
    }

    return { 
      success: true, 
      data: {
        vehiculo,
        requiredFrequency,
        lastMonthly,
        needsFullMonthly: isNewMonth
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function submitExternalLog(data) {
  try {
    const { vehiculoId, driver, requiredFrequency, confirmPreviousPhotos, gpsLocation, ...formPayload } = data;
    
    // Extract base fields
    const kmActual = formPayload.kmActual ? parseInt(formPayload.kmActual) : null;
    const montoCombustible = formPayload.montoCombustible ? parseFloat(formPayload.montoCombustible) : null;

    // Primer paso: update fechas del Vehiculo si vienen
    if (formPayload.vtvVencimiento || formPayload.seguroVencimiento) {
       await getPrisma().vehiculo.update({
         where: { id: parseInt(vehiculoId) },
         data: {
           vtvVencimiento: formPayload.vtvVencimiento ? new Date(formPayload.vtvVencimiento) : undefined,
           seguroVencimiento: formPayload.seguroVencimiento ? new Date(formPayload.seguroVencimiento) : undefined
         }
       });
    }

    // First: If Monthly, create InspeccionMensual
    if (requiredFrequency === "mensual") {
        const hoy = new Date();
        let fotoFrente = formPayload.frente;
        let fotoTrasera = formPayload.trasera;
        let fotoLateralIzq = formPayload.latIzq;
        let fotoLateralDer = formPayload.latDer;
        let fotoVTV = formPayload.vtv;
        let fotoSeguro = formPayload.seguro;

        // Si el chofer confirmó que las fotos son las mismas, buscamos la inspección anterior
        if (confirmPreviousPhotos) {
          const lastInsp = await getPrisma().inspeccionMensual.findFirst({
            where: { vehiculoId: parseInt(vehiculoId) },
            orderBy: { fecha: 'desc' }
          });
          if (lastInsp) {
            fotoFrente = fotoFrente || lastInsp.fotoFrente;
            fotoTrasera = fotoTrasera || lastInsp.fotoTrasera;
            fotoLateralIzq = fotoLateralIzq || lastInsp.fotoLateralIzq;
            fotoLateralDer = fotoLateralDer || lastInsp.fotoLateralDer;
            fotoVTV = fotoVTV || lastInsp.fotoVTV;
            fotoSeguro = fotoSeguro || lastInsp.fotoSeguro;
          }
        }

        await getPrisma().inspeccionMensual.create({
            data: {
               vehiculoId: parseInt(vehiculoId),
               nombreConductor: driver,
               mes: hoy.getMonth() + 1,
               anio: hoy.getFullYear(),
               fotoFrente,
               fotoTrasera,
               fotoLateralIzq,
               fotoLateralDer,
               fotoVTV,
               fotoSeguro,
               lugarGuardaFijo: formPayload.lugarGuarda === "fija" ? "SI" : "NO",
               lugarGuardaResguardo: gpsLocation || formPayload.lugarGuardaDetalle || null,
            }
        });
    }

    // Always create a RegistroDiario to keep track of the log
    const registro = await getPrisma().registroDiario.create({
      data: {
        vehiculoId: parseInt(vehiculoId),
        esExterno: true,
        nombreConductor: driver,
        frecuenciaRegistro: requiredFrequency,
        kmActual: kmActual,
        nivelCombustible: formPayload.nivelCombustible || null, 
        montoCombustible: montoCombustible,
        fotoTicketCombustible: formPayload.ticket || null,
        fotoFrente: formPayload.frente || null,
        fotoTrasera: formPayload.trasera || null,
        fotoLateralIzq: formPayload.latIzq || null,
        fotoLateralDer: formPayload.latDer || null,
        fotoVTV: formPayload.vtv || null,
        fotoSeguro: formPayload.seguro || null,
        motivoUso: formPayload.motivoUso === "otro" ? formPayload.motivoUsoOtro : formPayload.motivoUso,
        novedades: formPayload.novedades || null,
        lugarGuarda: gpsLocation || formPayload.lugarGuardaDetalle || "No especificado",
        tipoReporte: requiredFrequency === "diario_inicio" ? "INICIO" : (requiredFrequency === "diario_cierre" ? "CIERRE" : "AUDITORIA")
      }
    });

    revalidatePath("/");
    return { success: true, data: registro };
  } catch (error) {
    console.error("Error submitting external log:", error);
    return { success: false, error: error.message };
  }
}
