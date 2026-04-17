import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ESTA RUTA ES TEMPORAL PARA SINCRONIZAR LA DATA EN PRODUCCIÓN
export async function GET() {
  try {
    console.log('🌱 Iniciando Carga Remota de Semillas...');
    
    // Importación dinámica para evitar problemas de inicialización en build
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

    // 1. Choferes Completos (Local Sync)
    const defaultDrivers = [
      "Brian Lopez", "Christian González", "David f", "Diego r", "Esteban diaz", "GONZALO", 
      "Gali Nelson", "Gally Nelson", "Gerardo v", "Iván Santillán", "Jonathan v", 
      "Juan Cruz Hidalgo", "Lucio Bello", "MARIANO", "Matías Chaile", "Miguel c", 
      "Tomas C", "Tomás Casco", "Vega Jorge Daniel", "VideoTest"
    ];
    
    for (const name of defaultDrivers) {
      await prisma.chofer.upsert({
        where: { nombre: name },
        update: { activo: true },
        create: { nombre: name, activo: true },
      });
    }

    // 2. Vehículos Completos (Local Sync)
    const criticalVehicles = [
      { patente: 'A122WQX', lastKm: 0 }, { patente: 'AD848KQ', lastKm: 528224 },
      { patente: 'PGX770', lastKm: 555451 }, { patente: 'A122WRA', lastKm: 7370 },
      { patente: 'AD380TS', lastKm: 714444 }, { patente: 'A239WDL', lastKm: 10952 },
      { patente: 'ONR078', lastKm: 417491 }, { patente: 'AF601QS', lastKm: 28453 },
      { patente: 'PGX769', lastKm: 515893 }, { patente: 'AD724VP', lastKm: 449756 },
      { patente: 'AF668JV', lastKm: 417795 }, { patente: 'AF668JR', lastKm: 29147 },
      { patente: 'A239WDM', lastKm: 7441 }, { patente: 'AD848LH', lastKm: 0 },
      { patente: 'AD724VQ', lastKm: 0 }, { patente: 'AD848KR', lastKm: 529084 },
      { patente: 'AH279KZ', lastKm: 70114 }, { patente: 'AH336BA', lastKm: 84411 },
      { patente: 'AE982AS', lastKm: 348145 }, { patente: 'AE982AR', lastKm: 453085 },
      { patente: 'A122WQZ', lastKm: 0 }, { patente: 'A124TJW', lastKm: 0 }
    ];

    for (const v of criticalVehicles) {
      const veh = await prisma.vehiculo.upsert({
        where: { patente: v.patente },
        update: { activo: true },
        create: { patente: v.patente, activo: true },
      });

      // Crear registro inicial corregido si no existe ninguno o KM es 0
      const count = await prisma.registroDiario.count({ where: { vehiculoId: veh.id } });
      if (count === 0 && v.lastKm > 0) {
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
      message: "Seeding en producción completado (Sync Local)",
      driversLoaded: defaultDrivers.length,
      vehiclesVerified: criticalVehicles.length
    });

  } catch (error) {
    console.error("❌ ERROR SEEDING PROD:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
