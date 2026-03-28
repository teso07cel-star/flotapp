import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function run() {
  const registros = await prisma.registroDiario.findMany({
    take: 5,
    orderBy: { id: 'desc' }
  });
  console.log(registros);
}

run().catch(console.error).finally(() => process.exit(0));
