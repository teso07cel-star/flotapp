const prisma = require('./src/lib/prisma').default;
async function run() {
  try {
    const count = await prisma.chofer.count();
    console.log('COUNT:', count);
    if (count > 0) {
      const drivers = await prisma.chofer.findMany({ where: { activo: true } });
      const vehicles = await prisma.vehiculo.findMany({ where: { activo: true } });
      console.log('---DATA---');
      console.log(JSON.stringify({ drivers: drivers.map(d => d.nombre), vehicles: vehicles.map(v => ({ patente: v.patente, lastKm: 0 })) }));
    }
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
