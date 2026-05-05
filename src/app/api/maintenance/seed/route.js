import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.getPrisma ? prismaModule.getPrisma() : prismaModule.default;
    
    if (!prisma || !prisma.chofer) {
      return NextResponse.json({ success: false, error: 'CACHE BUST FAILED: Prisma client still lacks Chofer model. Keys: ' + Object.keys(prisma).join(',') });
    }

    const defaultDrivers = [
      "Brian Lopez", "Christian González", "David f", "Diego r", "Esteban diaz", "GONZALO", 
      "Gali Nelson", "Gally Nelson", "Gerardo v", "Iván Santillán", "Jonathan v", 
      "Juan Cruz Hidalgo", "Lucio Bello", "MARIANO", "Matías Chaile", "Miguel c", 
      "Tomas C", "Tomás Casco", "Vega Jorge Daniel", "VideoTest"
    ];
    
    let driversLoaded = 0;
    for (const name of defaultDrivers) {
      const existing = await prisma.chofer.findFirst({ where: { nombre: name } });
      if (!existing) {
        await prisma.chofer.create({ data: { nombre: name } });
      }
      driversLoaded++;
    }

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

    let vehiclesVerified = 0;
    for (const v of criticalVehicles) {
      let veh = await prisma.vehiculo.findFirst({ where: { patente: v.patente } });
      if (!veh) {
        veh = await prisma.vehiculo.create({ data: { patente: v.patente, tipo: 'AUTO', activo: true } });
      }
      vehiclesVerified++;
    }

    return NextResponse.json({ 
      success: true, 
      message: "Seeding cache-busted completado",
      driversLoaded,
      vehiclesVerified
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
