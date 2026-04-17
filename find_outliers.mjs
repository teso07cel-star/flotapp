import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function main() {
  console.log('--- BUSCANDO ANOMALÍAS DE KILOMETRAJE ---');
  try {
    // Buscar cualquier registro con un número exagerado (> 400.000 km)
    const bigKms = await prisma.registroDiario.findMany({
      where: { kmActual: { gt: 400000 } },
      include: { vehiculo: true }
    });
    
    console.log('\nRegistros con KM exagerado (> 400,000):');
    bigKms.forEach(l => {
      console.log(`- ID: ${l.id}, Patente: ${l.vehiculo?.patente || 'S/D'}, KM: ${l.kmActual}`);
    });

    // Buscar saltos masivos (> 10,000 km) entre registros del mismo vehículo
    console.log('\nAnalizando saltos masivos por vehículo...');
    const vehiculos = await prisma.vehiculo.findMany();
    for (const v of vehiculos) {
       const logs = await prisma.registroDiario.findMany({
         where: { vehiculoId: v.id, kmActual: { not: null } },
         orderBy: { fecha: 'asc' }
       });
       for (let i = 1; i < logs.length; i++) {
         const diff = logs[i].kmActual - logs[i-1].kmActual;
         if (diff > 50000) { // Salto de más de 50,000 km
            console.log(`🚨 SALTO MASIVO en ${v.patente}: de ${logs[i-1].kmActual} a ${logs[i].kmActual} (ID ${logs[i].id})`);
         }
       }
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}
main();
