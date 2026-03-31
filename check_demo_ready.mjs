import prisma from './src/lib/prisma.js';

async function check() {
  console.log("Checking database state for demo...");
  
  const vehiculos = await prisma.vehiculo.findMany();
  
  console.log("\nVEHICULOS:");
  for (const v of vehiculos) {
    const dailyCount = await prisma.registroDiario.count({
      where: {
        vehiculoId: v.id,
        fecha: {
          gte: new Date(new Date().setHours(0,0,0,0))
        }
      }
    });
    console.log(`- ${v.patente} (Auth: ${v.codigoAutorizacion || 'None'}) | Daily today: ${dailyCount}`);
  }
}

check().catch(console.error).finally(() => process.exit(0));
