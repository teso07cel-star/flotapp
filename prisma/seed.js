const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de datos...');

  const dataPath = path.join(__dirname, '..', 'data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // Cargar Sucursales
  console.log(`Cargando ${data.sucursales.length} sucursales...`);
  for (const sucursal of data.sucursales) {
    await prisma.sucursal.upsert({
      where: { id: sucursal.id },
      update: {
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
      },
      create: {
        id: sucursal.id,
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
      },
    });
  }

  // Cargar Vehiculos
  console.log(`Cargando ${data.vehiculos.length} vehículos...`);
  for (const vehiculo of data.vehiculos) {
    await prisma.vehiculo.upsert({
      where: { id: vehiculo.id },
      update: {
        patente: vehiculo.patente,
        vtvVencimiento: vehiculo.vtvVencimiento ? new Date(vehiculo.vtvVencimiento) : null,
        seguroVencimiento: vehiculo.seguroVencimiento ? new Date(vehiculo.seguroVencimiento) : null,
        proximoServiceKm: vehiculo.proximoServiceKm,
        activo: vehiculo.activo,
      },
      create: {
        id: vehiculo.id,
        patente: vehiculo.patente,
        vtvVencimiento: vehiculo.vtvVencimiento ? new Date(vehiculo.vtvVencimiento) : null,
        seguroVencimiento: vehiculo.seguroVencimiento ? new Date(vehiculo.seguroVencimiento) : null,
        proximoServiceKm: vehiculo.proximoServiceKm,
        activo: vehiculo.activo,
      },
    });
  }

  console.log('Carga de datos completada exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante la carga de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
