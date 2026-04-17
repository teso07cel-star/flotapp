import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  console.log("🚀 PRISMA: Iniciando conexión unificada...");
  
  if (!dbUrl) {
    console.warn("⚠️ PRISMA: No hay DATABASE_URL configurada");
    return new PrismaClient();
  }

  try {
    const pool = new pg.Pool({ 
      connectionString: dbUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    const adapter = new PrismaPg(pool);
    const client = new PrismaClient({ 
      adapter,
      log: ['error', 'warn'] 
    });
    
    // GUARDIA DE AUTO-CONFIGURACIÓN (TACTICA b4.0)
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
       client.chofer.count().then(async (count) => {
          if (count === 0) {
             console.log("🌱 PRISMA: Sincronizando datos maestros en producción...");
             
             // 1. Choferes
             const defaultDrivers = [
               "Brian Lopez", "Christian González", "David f", "Diego r", "Esteban diaz", "GONZALO", 
               "Gali Nelson", "Gally Nelson", "Gerardo v", "Iván Santillán", "Jonathan v", 
               "Juan Cruz Hidalgo", "Lucio Bello", "MARIANO", "Matías Chaile", "Miguel c", 
               "Tomas C", "Tomás Casco", "Vega Jorge Daniel"
             ];
             
             for (const name of defaultDrivers) {
                await client.chofer.upsert({
                   where: { nombre: name },
                   update: { activo: true },
                   create: { nombre: name, activo: true }
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
                const veh = await client.vehiculo.upsert({
                   where: { patente: v.patente },
                   update: { activo: true },
                   create: { patente: v.patente, activo: true }
                });
                
                await client.registroDiario.create({
                   data: {
                      vehiculoId: veh.id,
                      kmActual: v.lastKm,
                      nombreConductor: 'SISTEMA',
                      tipoReporte: 'CIERRE',
                      fecha: new Date(),
                      novedades: 'Inicialización de Base Maestral'
                   }
                });
             }
             console.log("✅ PRISMA: Sincronización completa.");
          }
       }).catch(e => console.error("⚠️ PRISMA: Error en auto-config:", e.message));
    }

    return client;
  } catch (error) {
    console.error("❌ ERROR CRÍTICO PRISMA:", error.message);
    return new PrismaClient();
  }
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
