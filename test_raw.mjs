import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function run() {
  // Ignoramos la validación del schema estricto por ahora o hacemos un query sql crudo
  // porque falló el db push
  // Sin embargo el error 'ColumnNotFound' sugiere que se intentó usar findMany de Prisma con el schema actualizado pero BD vieja.
  // Usemos raw query para ver los Registros!!!
  const result = await prisma.$queryRaw`SELECT * FROM "RegistroDiario" ORDER BY fecha DESC LIMIT 15`;
  console.log(result);
}

run().catch(console.error).finally(() => process.exit(0));
