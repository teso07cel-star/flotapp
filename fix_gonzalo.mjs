import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function fixGonzalo() {
  try {
    const c = await prisma.$queryRaw`SELECT id, nombre FROM "Chofer" WHERE nombre = 'gonzalo M' LIMIT 1`;
    if (c.length > 0) {
      const g = c[0];
      const dummyId = 'fake_passkey_id_' + g.id;
      const dummyKey = 'fake_pub_key_' + g.id;
      await prisma.$queryRaw`UPDATE "Chofer" SET "passkeyId" = ${dummyId}, "passkeyPubKey" = ${dummyKey} WHERE id = ${g.id}`;
      console.log('Fixed Gonzalo M: LOGUEADO CON FACE ID (Simulado)');
    }
  } catch (err) {
    console.error(err);
  }
}

fixGonzalo().finally(() => process.exit(0));
