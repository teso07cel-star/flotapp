import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const maxDuration = 30; // Seconds

export async function GET(request) {
  try {
    // Solo permitir solicitudes validadas (opcional en un entorno real con Vercel Cron Secret)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Buscar todos los registros de HOY
    const registrosHoy = await prisma.registroDiario.findMany({
      where: { fecha: { gte: todayStart } },
      orderBy: { fecha: 'desc' }
    });

    // Agrupar por conductor para encontrar el último estado de cada uno
    const lastRecordsByDriver = new Map();
    for (const r of registrosHoy) {
      if (!lastRecordsByDriver.has(r.nombreConductor)) {
        lastRecordsByDriver.set(r.nombreConductor, r);
      }
    }

    let closedCount = 0;

    for (const [driver, lastDoc] of lastRecordsByDriver.entries()) {
      if (lastDoc.tipoReporte !== "CIERRE") {
        // Encontramos un turno abierto. Proceder a cerrarlo "Sin Datos"
        
        const createData = {
            nombreConductor: driver,
            kmActual: lastDoc.kmActual,
            // kmModificado: false,
            kmTeoricos: 0,
            nivelCombustible: "SIN DATOS_AUTO",
            novedades: "CIERRE AUTOMATIZADO 20:00HS",
            tipoReporte: "CIERRE",
            lugarGuarda: "CIERRE AUTOMÁTICO DEL SISTEMA"
        };
        // Solo agregar vehiculoId si existe y es válido
        if (lastDoc.vehiculoId) {
            createData.vehiculo = { connect: { id: lastDoc.vehiculoId } };
        }
        await prisma.registroDiario.create({ data: createData });
        closedCount++;
      }
    }

    return NextResponse.json({ success: true, closedCount, message: `Se cerraron automáticamente ${closedCount} turnos activos.` });
  } catch (error) {
    console.error("Error en CRON cierre turnos:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
