import prisma from './src/lib/prisma.js';

async function reset(patente) {
  const v = await prisma.vehiculo.findUnique({ where: { patente } });
  if (v) {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    
    // Clear all daily records for today
    const resultDiario = await prisma.registroDiario.deleteMany({
      where: {
        vehiculoId: v.id,
        fecha: { gte: startOfDay }
      }
    });

    // Reset authorization code
    await prisma.vehiculo.update({
      where: { id: v.id },
      data: { codigoAutorizacion: null }
    });

    console.log(`Deleted ${resultDiario.count} diario records for ${patente}`);
  } else {
    console.log(`Vehicle ${patente} not found`);
  }
}

async function main() {
  await reset('TESO-001');
  await reset('OXX-001');
  await reset('AAA000');
}

main().catch(console.error).finally(() => process.exit(0));
