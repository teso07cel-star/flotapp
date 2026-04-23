import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Iniciando Sincronización de Kilometraje en PRODUCCIÓN...');

  const dataToSync = [
    { vehiculoId: 9, patente: 'AF601QS', kmActual: 28453, novedades: 'Sincronización inicial corregida' },
    { vehiculoId: 13, patente: 'AF668JR', kmActual: 29147, novedades: 'Sincronización inicial corregida' }
  ];

  for (const log of dataToSync) {
    console.log(`📡 Sincronizando ${log.patente}...`);
    await prisma.registroDiario.create({
      data: {
        vehiculoId: log.vehiculoId,
        kmActual: log.kmActual,
        novedades: log.novedades,
        nombreConductor: 'SISTEMA',
        tipoReporte: 'CIERRE', // Marcamos como cierre para que sea el punto de partida
        fecha: new Date()
      }
    });
  }

  console.log('✅ Sincronización de kilometraje completada.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la sincronización:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
