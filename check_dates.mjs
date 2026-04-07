import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.registroDiario.findMany({
    take: 5,
    orderBy: { fecha: 'desc' },
    select: { id: true, fecha: true, nombreConductor: true }
  });
  console.log(JSON.stringify(logs, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
