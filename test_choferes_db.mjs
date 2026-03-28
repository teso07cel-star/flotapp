import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function run() {
  const choferes = await prisma.chofer.findMany();
  console.log(choferes);
}

run().catch(console.error).finally(() => process.exit(0));
