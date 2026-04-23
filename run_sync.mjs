import 'dotenv/config';
import { getPrisma } from "./src/lib/prisma.js";

async function runSync() {
    console.log('🚀 Iniciando Sincronización Táctica (Standalone)...');
    try {
        const criticalVehicles = [
          { patente: "AD848KQ", lastKm: 528224 }, { patente: "PGX770", lastKm: 555451 },
          { patente: "A124TJW", lastKm: 81200 }, { patente: "A122WRA", lastKm: 5400 },
          { patente: "AD380TS", lastKm: 714444 }, { patente: "A239WDL", lastKm: 11200 },
          { patente: "ONR078", lastKm: 417491 }, { patente: "AF601QS", lastKm: 28453 },
          { patente: "PGX769", lastKm: 515893 }, { patente: "AD724VP", lastKm: 449756 },
          { patente: "AF668JV", lastKm: 417795 }, { patente: "AF668JR", lastKm: 292147 },
          { patente: "A239WDM", lastKm: 7100 }, { patente: "AD848LH", lastKm: 462100 },
          { patente: "AD724VQ", lastKm: 532100 }, { patente: "AD848KR", lastKm: 529084 },
          { patente: "AH279KZ", lastKm: 70114 }, { patente: "AH336BA", lastKm: 84411 }
        ];

        for (const v of criticalVehicles) {
          const vehiculo = await getPrisma().vehiculo.upsert({
            where: { patente: v.patente },
            update: { activo: true },
            create: { patente: v.patente, activo: true },
          });

          const lastLog = await getPrisma().registroDiario.findFirst({
            where: { vehiculoId: vehiculo.id },
            orderBy: { fecha: 'desc' }
          });

          if (!lastLog) {
            console.log(`🆕 Inicializando ${v.patente} a ${v.lastKm} km`);
            await getPrisma().registroDiario.create({
              data: {
                vehiculoId: vehiculo.id,
                kmActual: v.lastKm,
                tipoReporte: "SINCRO",
                nombreConductor: "SISTEMA",
                novedades: "INICIALIZACION TACTICA DE KILOMETRAJE"
              }
            });
          } else {
             console.log(`✅ ${v.patente} ya tiene registros. (Haciendo nada)`);
          }
        }
        console.log('✅ Sincronización completada.');
    } catch (error) {
        console.error('❌ Error en sincronización:', error.message);
    } finally {
        process.exit(0);
    }
}

runSync();
