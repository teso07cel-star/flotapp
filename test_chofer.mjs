import 'dotenv/config';
import prisma from './src/lib/prisma.js';
async function run() {
  const result = await prisma.$queryRaw`SELECT * FROM "Chofer" LIMIT 2`;
  console.log(result);
}
run().catch(console.error).finally(() => process.exit(0));
