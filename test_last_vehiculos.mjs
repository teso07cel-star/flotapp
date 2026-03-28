import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function run() {
  const result = await prisma.$queryRaw`SELECT r."kmActual", r."fecha", r."nombreConductor", r."choferId", v."patente" FROM "RegistroDiario" r JOIN "Vehiculo" v ON r."vehiculoId" = v."id" WHERE r."nombreConductor" IS NOT NULL OR r."choferId" IS NOT NULL ORDER BY r."fecha" DESC LIMIT 10`;
  console.log(result);
}

run().catch(console.error).finally(() => process.exit(0));
