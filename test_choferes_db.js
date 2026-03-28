require('dotenv').config();
import('./src/lib/prisma.js').then(async ({ default: prisma }) => {
  try {
    const choferes = await prisma.chofer.findMany();
    console.log(choferes);
  } catch (err) {
    console.error(err);
  }
});
