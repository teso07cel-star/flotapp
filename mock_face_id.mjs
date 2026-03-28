import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function updateFaceIds() {
  const driverNamesWithNoFaceId = [
    'Miguel c ', 
    'Christian González', 
    'Tomás Casco', 
    'Gally Nelson'
  ];

  try {
    const choferes = await prisma.$queryRaw`SELECT id, nombre FROM "Chofer"`;
    
    for (const c of choferes) {
      if (driverNamesWithNoFaceId.includes(c.nombre)) {
        await prisma.$queryRaw`UPDATE "Chofer" SET "passkeyId" = null, "passkeyPubKey" = null WHERE id = ${c.id}`;
        console.log('- ' + c.nombre + ': MANTENIDO SIN FACE ID');
      } else {
        const dummyId = 'fake_passkey_id_' + c.id;
        const dummyKey = 'fake_pub_key_' + c.id;
        await prisma.$queryRaw`UPDATE "Chofer" SET "passkeyId" = ${dummyId}, "passkeyPubKey" = ${dummyKey} WHERE id = ${c.id}`;
        console.log('- ' + c.nombre + ': LOGUEADO CON FACE ID (Simulado)');
      }
    }
    console.log("¡Actualización completada!");
  } catch (err) {
    console.error(err);
  }
}

updateFaceIds().finally(() => process.exit(0));
