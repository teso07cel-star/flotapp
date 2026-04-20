const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const choferesCount = await prisma.chofer.count();
    const vehiculosCount = await prisma.vehiculo.count();
    const registrosCount = await prisma.registroDiario.count();
    
    console.log(JSON.stringify({
      choferes: choferesCount,
      vehiculos: vehiculosCount,
      registros: registrosCount
    }, null, 2));
  } catch (error) {
    console.error("Error checking DB:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
