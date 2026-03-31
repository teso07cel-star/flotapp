import prisma from './src/lib/prisma.js';

async function reset() {
  const v = await prisma.vehiculo.findUnique({ where: { patente: 'TESO-001' } });
  if (v) {
    // Clear all daily records
    const resultDiario = await prisma.registroDiario.deleteMany({
      where: { vehiculoId: v.id }
    });
    // Clear all external records
    const resultExt = await prisma.registroExterno.deleteMany({
      where: { vehiculoId: v.id }
    });
    console.log(`Deleted ${resultDiario.count} diario records for TESO-001`);
    console.log(`Deleted ${resultExt.count} externo records for TESO-001`);
  }
}

async function resetChoferEx() {
  const c = await prisma.conductorExterno.findFirst({ where: { dni: '12345678' }});
  if (c) {
    const res = await prisma.registroExterno.deleteMany({
       where: { conductorId: c.id }
    });
    console.log(`Deleted ${res.count} records for external driver test`);
  }
}

Promise.all([reset(), resetChoferEx()]).catch(console.error).finally(() => process.exit(0));
