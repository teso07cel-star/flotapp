
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const drivers = await prisma.chofer.findMany({ where: { activo: true } });
    const vehicles = await prisma.vehiculo.findMany({ where: { activo: true } });
    
    // Get last KM for each vehicle
    const vehiclesWithKm = await Promise.all(vehicles.map(async (v) => {
      const lastReg = await prisma.registroDiario.findFirst({
        where: { vehiculoId: v.id },
        orderBy: { fecha: 'desc' }
      });
      return { patente: v.patente, lastKm: lastReg?.kmActual || 0 };
    }));

    console.log('---DATA_START---');
    console.log(JSON.stringify({ drivers: drivers.map(d => d.nombre), vehicles: vehiclesWithKm }));
    console.log('---DATA_END---');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
