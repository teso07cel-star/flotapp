import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function main() {
  const v = await prisma.vehiculo.findFirst({
    where: { patente: { endsWith: 'JR' } }
  });
  if (!v) {
    console.log('No se encontró vehículo terminado en JR');
    return;
  }
  
  const allLogs = await prisma.registroDiario.findMany({
    where: { vehiculoId: v.id },
    orderBy: { fecha: 'desc' },
    take: 5
  });
  
  console.log('VEHICULO:', v.patente, '(ID:', v.id, ')');
  console.log('ULTIMOS REGISTROS:');
  allLogs.forEach(l => {
    console.log(`- ID: ${l.id}, KM: ${l.kmActual}, Fecha: ${l.fecha}`);
  });
}
main();
