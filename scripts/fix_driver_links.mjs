import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando sincronización manual de identidades...");
  
  const auths = await prisma.autorizacionDispositivo.findMany({
    where: { estado: "APROBADO" }
  });

  for (const auth of auths) {
    const chofer = await prisma.chofer.findFirst({
      where: { nombre: { equals: auth.nombreSolicitante.trim(), mode: 'insensitive' } }
    });

    if (chofer && !chofer.passkeyId) {
      await prisma.chofer.update({
        where: { id: chofer.id },
        data: { passkeyId: auth.deviceId }
      });
      console.log(`✅ Vinculado: ${chofer.nombre} -> ${auth.deviceId}`);
    } else if (chofer) {
      console.log(`ℹ️ Ya vinculado: ${chofer.nombre}`);
    } else {
      console.log(`❌ No se encontró chofer para: ${auth.nombreSolicitante}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
