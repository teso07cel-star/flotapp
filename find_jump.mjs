import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function main() {
  console.log('--- BUSCANDO SALTO DE KILOMETRAJE EN AF668JR ---');
  try {
    const vId = 13;
    const logs = await prisma.registroDiario.findMany({
      where: { vehiculoId: vId },
      orderBy: { fecha: 'asc' }
    });
    
    let found = false;
    for (let i = 1; i < logs.length; i++) {
      const diff = logs[i].kmActual - logs[i-1].kmActual;
      if (diff > 1000) { // Cualquier salto mayor a 1000km en un periodo corto es sospechoso
         console.log(`\n⚠️ DISCREPANCIA DETECTADA:`);
         console.log(`- Registro A (ID ${logs[i-1].id}): ${logs[i-1].kmActual} km [${logs[i-1].fecha}]`);
         console.log(`- Registro B (ID ${logs[i].id}): ${logs[i].kmActual} km [${logs[i].fecha}]`);
         console.log(`- Salto: ${diff} km`);
         found = true;
      }
    }
    
    if (!found) {
       console.log('No se encontraron saltos mayores a 1000km entre registros consecutivos.');
       // Quizás el error es un número absoluto gigante
       const maxKm = Math.max(...logs.map(l => l.kmActual || 0));
       if (maxKm > 400000) {
          const outlier = logs.find(l => l.kmActual === maxKm);
          console.log(`\n🚨 VALOR ABSOLUTO ANÓMALO: ID ${outlier.id} tiene ${outlier.kmActual} km`);
       }
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}
main();
