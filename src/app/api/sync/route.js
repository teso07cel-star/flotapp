import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🚀 Iniciando Sincronización Táctica de Datos...');
    
    // 1. Choferes
    const defaultDrivers = [
      "Brian Lopez", "Christian González", "David f", "Diego r", "Esteban diaz", "GONZALO", 
      "Gali Nelson", "Gally Nelson", "Gerardo v", "Iván Santillán", "Jonathan v", 
      "Juan Cruz Hidalgo", "Lucio Bello", "MARIANO", "Matías Chaile", "Miguel c", 
      "Tomas C", "Tomás Casco", "Vega Jorge Daniel"
    ];
    
    for (const name of defaultDrivers) {
      await prisma.chofer.upsert({
        where: { nombre: name },
        update: { activo: true },
        create: { nombre: name, activo: true },
      });
    }

    // 2. Vehículos
    const criticalVehicles = [
      { patente: 'AD848KQ', lastKm: 528224 }, { patente: 'PGX770', lastKm: 555451 },
      { patente: 'AD380TS', lastKm: 714444 }, { patente: 'ONR078', lastKm: 417491 },
      { patente: 'AF601QS', lastKm: 28453 }, { patente: 'PGX769', lastKm: 515893 },
      { patente: 'AD724VP', lastKm: 449756 }, { patente: 'AF668JV', lastKm: 417795 },
      { patente: 'AF668JR', lastKm: 29147 }, { patente: 'AD848KR', lastKm: 529084 },
      { patente: 'AH279KZ', lastKm: 70114 }, { patente: 'AH336BA', lastKm: 84411 },
      { patente: 'AE982AS', lastKm: 348145 }, { patente: 'AE982AR', lastKm: 453085 }
    ];

    for (const v of criticalVehicles) {
      const veh = await prisma.vehiculo.upsert({
        where: { patente: v.patente },
        update: { activo: true },
        create: { patente: v.patente, activo: true },
      });

      // Asegurar km inicial
      const count = await prisma.registroDiario.count({ where: { vehiculoId: veh.id } });
      if (count === 0) {
        await prisma.registroDiario.create({
          data: {
            vehiculoId: veh.id,
            kmActual: v.lastKm,
            nombreConductor: 'SISTEMA',
            tipoReporte: 'CIERRE',
            fecha: new Date(),
            novedades: 'Sync Inicial'
          }
        });
      }
    }

    // 3. Sucursales (Opcional, pero para estar seguros)
    const branches = [
      { id: 1, nombre: "Hub Central" }, { id: 2, nombre: "Depósito Norte" }
    ];
    for (const b of branches) {
       await prisma.sucursal.upsert({
          where: { id: b.id },
          update: { nombre: b.nombre },
          create: { id: b.id, nombre: b.nombre }
       });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Base de datos sincronizada con éxito (Tactica b4.0)",
      drivers: defaultDrivers.length,
      vehicles: criticalVehicles.length
    });

  } catch (error) {
    console.error("❌ ERROR SYNC:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
