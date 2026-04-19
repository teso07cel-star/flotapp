import { NextResponse } from 'next/server';
import { getPrisma } from "@/lib/prisma";


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🚀 Iniciando Sincronización Táctica de Datos...');
    
    // 1. Choferes Maestros (v8.3 BLINDAJE FINAL)
    const defaultDrivers = [
      "Brian Lopez", "Christian González", "David Francisconi", "Diego Retamar", 
      "Esteban diaz", "Gonzalo Martinez", "Gally Nelson", "Gerardo Visconti", 
      "Ivan Santillan", "Jonathan Vondrack", "Juan Cruz Hidalgo", "Lucio Bello", 
      "Mariano", "Matías Chaile", "Miguel Cejas", "Tomas Casco"
    ];
    
    for (const name of defaultDrivers) {
      await getPrisma().chofer.upsert({
        where: { nombre: name },
        update: { activo: true },
        create: { nombre: name, activo: true },
      });
    }

    // 2. Vehículos Estratégicos
    const criticalVehicles = [
      { patente: "AD848KQ", lastKm: 528224 }, { patente: "PGX770", lastKm: 555451 },
      { patente: "A124TJW", lastKm: 81200 }, { patente: "A122WRA", lastKm: 5400 },
      { patente: "AD380TS", lastKm: 714444 }, { patente: "A239WDL", lastKm: 11200 },
      { patente: "ONR078", lastKm: 417491 }, { patente: "AF601QS", lastKm: 28453 },
      { patente: "PGX769", lastKm: 515893 }, { patente: "AD724VP", lastKm: 449756 },
      { patente: "AF668JV", lastKm: 417795 }, { patente: "AF668JR", lastKm: 29147 },
      { patente: "A239WDM", lastKm: 7100 }, { patente: "AD848LH", lastKm: 462100 },
      { patente: "AD724VQ", lastKm: 532100 }, { patente: "AD848KR", lastKm: 529084 },
      { patente: "AH279KZ", lastKm: 70114 }, { patente: "AH336BA", lastKm: 84411 }
    ];

    for (const v of criticalVehicles) {
      await getPrisma().vehiculo.upsert({
        where: { patente: v.patente },
        update: { activo: true },
        create: { patente: v.patente, activo: true },
      });
    }

    // 3. Sucursales de Red (v8.3 Sincronización)
    const branches = [
      { id: 1, nombre: "Boedo", direccion: "Avenida Corrientes 809" },
      { id: 4, nombre: "San Martin" }, { id: 5, nombre: "Moron" }, { id: 6, nombre: "San Justo" },
      { id: 7, nombre: "Ramos" }, { id: 8, nombre: "San Miguel" }, { id: 9, nombre: "Zarate" },
      { id: 10, nombre: "Campana" }, { id: 11, nombre: "Pacheco" }, { id: 12, nombre: "Pacheco NOVO" },
      { id: 13, nombre: "San Fernando" }, { id: 14, nombre: "San Isidro" }, { id: 15, nombre: "San Isidro ROLON" },
      { id: 16, nombre: "Martinez" }, { id: 17, nombre: "Olivos" }, { id: 18, nombre: "Vicente Lopez" },
      { id: 19, nombre: "TESO NORTE" }, { id: 20, nombre: "TESO SAN TELMO" }, { id: 21, nombre: "Belgrano" },
      { id: 22, nombre: "Cabildo" }, { id: 23, nombre: "Barrio Norte" }, { id: 24, nombre: "Plaza Italia" },
      { id: 25, nombre: "Parque Patricios" }, { id: 26, nombre: "Once" }, { id: 29, nombre: "Canning" },
      { id: 30, nombre: "Monte Grande" }, { id: 31, nombre: "Adrogue" }, { id: 32, nombre: "Lomas" },
      { id: 33, nombre: "Banfield" }, { id: 34, nombre: "Lanus" }, { id: 35, nombre: "Avellaneda" },
      { id: 36, nombre: "Wilde" }, { id: 37, nombre: "Bernal" }, { id: 38, nombre: "Berazategui" },
      { id: 39, nombre: "Varela" }, { id: 40, nombre: "Berisso" }, { id: 41, nombre: "La Plata 50" },
      { id: 42, nombre: "La Plata 56" }, { id: 43, nombre: "Chascomus" }, { id: 44, nombre: "Gualeguaychú" },
      { id: 45, nombre: "Concordia" }, { id: 46, nombre: "La Paz" }, { id: 47, nombre: "Olavarría" },
      { id: 48, nombre: "Tandil" }, { id: 49, nombre: "Tres Arroyo" }, { id: 50, nombre: "Coronel Suarez" },
      { id: 51, nombre: "Independencia (MDQ)" }, { id: 52, nombre: "Güemes (MDQ)" }
    ];

    for (const b of branches) {
       await getPrisma().sucursal.upsert({
          where: { id: b.id },
          update: { nombre: b.nombre, direccion: b.direccion || "" },
          create: { id: b.id, nombre: b.nombre, direccion: b.direccion || "" }
       });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Base de datos sincronizada con éxito (v8.3)",
      drivers: defaultDrivers.length,
      vehicles: criticalVehicles.length,
      branches: branches.length
    });

  } catch (error) {
    console.error("❌ ERROR SYNC:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
