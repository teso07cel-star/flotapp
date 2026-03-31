import prisma from './src/lib/prisma.js';

async function main() {
  console.log('--- Checking Demo Data ---');
  let drivers = await prisma.chofer.findMany({ where: { activo: true } });
  let vehicles = await prisma.vehiculo.findMany();
  
  if (!drivers.some(d => d.nombre === 'JUAN PEREZ')) {
    console.log('Adding test driver: JUAN PEREZ');
    await prisma.chofer.create({ data: { nombre: 'JUAN PEREZ', activo: true, patenteAsignada: 'TESO-001' } });
  }
  
  if (!vehicles.some(v => v.patente === 'TESO-001')) {
    console.log('Adding test vehicle: TESO-001');
    await prisma.vehiculo.create({ data: { patente: 'TESO-001', codigoAutorizacion: '1234', tipo: 'INTERNO' } });
  }
  
  console.log('Demo data ready.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
