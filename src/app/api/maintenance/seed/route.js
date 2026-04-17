import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ESTA RUTA ES TEMPORAL PARA SINCRONIZAR LA DATA EN PRODUCCIÓN
export async function GET() {
  try {
    console.log('🌱 Iniciando Carga Remota de Semillas...');
    
    // Importación dinámica para evitar problemas de inicialización en build
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

    // 1. Choferes Críticos
    const defaultDrivers = [
      'Tomás Casco', 'Iván Santillán', 'Gali Nelson', 'Juan Cruz Hidalgo', 
      'Matías Chaile', 'Vega Jorge Daniel', 'Christian González', 'VideoTest'
    ];
    
    for (const name of defaultDrivers) {
      await prisma.chofer.upsert({
        where: { nombre: name },
        update: { activo: true },
        create: { nombre: name, activo: true },
      });
    }

    // 2. Vehículos Críticos (Los que fallaban)
    const criticalVehicles = [
      { patente: 'AF668JR', lastKm: 29147 },
      { patente: 'AF601QS', lastKm: 28453 }
    ];

    for (const v of criticalVehicles) {
      const veh = await prisma.vehiculo.upsert({
        where: { patente: v.patente },
        update: { activo: true },
        create: { patente: v.patente, activo: true },
      });

      // Crear registro inicial corregido si no existe ninguno
      const count = await prisma.registroDiario.count({ where: { vehiculoId: veh.id } });
      if (count === 0) {
        await prisma.registroDiario.create({
          data: {
            vehiculoId: veh.id,
            kmActual: v.lastKm,
            nombreConductor: 'SISTEMA',
            tipoReporte: 'CIERRE',
            fecha: new Date(),
            novedades: 'Sincronización inicial de base'
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Seeding en producción completado",
      driversLoaded: defaultDrivers.length,
      vehiclesVerified: criticalVehicles.map(v => v.patente)
    });

  } catch (error) {
    console.error("❌ ERROR SEEDING PROD:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
