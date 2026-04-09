const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAll() {
  const choferes = await prisma.chofer.findMany({ orderBy: { nombre: 'asc' } });
  const auths = await prisma.autorizacionDispositivo.findMany();
  
  console.log("--- Choferes ---");
  choferes.forEach(c => console.log(`${c.id}: ${c.nombre} (Passkey: ${c.passkeyId})`));
  
  console.log("\n--- Autorizaciones ---");
  auths.forEach(a => console.log(`${a.id}: ${a.nombreSolicitante} - ${a.deviceId} (${a.estado})`));
}

listAll()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
