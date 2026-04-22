import { getPrisma } from '../src/lib/prisma.js';

async function check() {
  try {
    console.log('--- ATTEMPTING DB CONNECTION ---');
    const prisma = getPrisma();
    
    const counts = await Promise.all([
      prisma.registroDiario.count(),
      prisma.vehiculo.count(),
      prisma.sucursal.count(),
      prisma.chofer.count()
    ]);
    console.log('--- DB STATS ---');
    console.log('Registros:', counts[0]);
    console.log('Vehiculos:', counts[1]);
    console.log('Sucursales:', counts[2]);
    console.log('Choferes:', counts[3]);
    
    if (counts[0] > 0) {
      const latest = await prisma.registroDiario.findMany({
        take: 5,
        orderBy: { fecha: 'desc' },
        include: { vehiculo: true }
      });
      console.log('--- LATEST REGISTROS ---');
      latest.forEach(r => console.log(`${r.fecha.toISOString()} - ${r.nombreConductor} - ${r.vehiculo?.patente} - ${r.tipoReporte}`));
    }
  } catch (e) {
    console.error('❌ Error connecting to DB:', e.message);
    if (e.message.includes('initialization')) {
      console.log('💡 Tip: Check if DATABASE_URL is set in your environment.');
    }
  }
}

check();
