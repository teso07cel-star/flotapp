import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function audit() {
  console.log('--- AUDITORÍA DE DATOS ---');
  
  try {
    // 1. Buscar vehículo con patente que termina en JR
    const vehiculosJR = await prisma.vehiculo.findMany({
      where: { patente: { endsWith: 'JR' } }
    });
    
    console.log('\nVehículos encontrados con "JR":');
    for (const v of vehiculosJR) {
      const outlier = await prisma.registroDiario.findFirst({
        where: { vehiculoId: v.id, kmActual: { gt: 150000 } }, // Filtro para encontrar el error
        orderBy: { kmActual: 'desc' }
      });
      console.log(`- Patente: ${v.patente} (ID: ${v.id})`);
      if (outlier) {
        console.log(`  ⚠️ Registro anómalo encontrado: ID ${outlier.id}, KM: ${outlier.kmActual}, Fecha: ${outlier.fecha}`);
        
        // Buscar el registro anterior para referencia
        const previous = await prisma.registroDiario.findFirst({
          where: { vehiculoId: v.id, id: { lt: outlier.id } },
          orderBy: { id: 'desc' }
        });
        if (previous) {
          console.log(`  ℹ️ Registro anterior: KM ${previous.kmActual}`);
        }
      }
    }

    // 2. Audit Sucursales sin dirección
    const sucursales = await prisma.sucursal.findMany({
      where: { OR: [{ direccion: null }, { direccion: '' }] }
    });
    console.log('\nSucursales sin dirección:');
    sucursales.forEach(s => console.log(`- ${s.nombre} (ID: ${s.id})`));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}
audit();
