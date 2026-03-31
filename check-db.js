const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const choferes = await prisma.chofer.findMany();
  const vehiculos = await prisma.vehiculo.findMany();
  console.log('CHOFERES:', JSON.stringify(choferes, null, 2));
  console.log('VEHICULOS:', JSON.stringify(vehiculos, null, 2));
}

main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());
