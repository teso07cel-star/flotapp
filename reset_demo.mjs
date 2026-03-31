import prisma from './src/lib/prisma.js';

async function reset() {
  const driverName = 'JUAN PEREZ';
  const patente = 'AAA000';
  
  // Find vehicle
  const v = await prisma.vehiculo.findUnique({ where: { patente } });
  if (v) {
    // Delete all records today
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);
    
    const count = await prisma.registroDiario.deleteMany({
      where: {
        vehiculoId: v.id,
        nombreConductor: driverName,
        fecha: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
    console.log(`Deleted ${count.count} records for today`);
    
    // Also reset authorization just in case
    await prisma.vehiculo.update({
      where: { id: v.id },
      data: { codigoAutorizacion: null }
    });
  }
}
reset().catch(console.error).finally(() => prisma.$disconnect());
