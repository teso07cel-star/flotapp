const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Carga Universal de Semillas (Sucursales, Vehículos, Choferes)...');

  const dataPath = path.join(__dirname, '..', 'data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Error: data.json no encontrado.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // 1. Sucursales
  console.log(`📍 Cargando ${data.sucursales.length} sucursales...`);
  for (const s of data.sucursales) {
    await prisma.sucursal.upsert({
      where: { id: s.id },
      update: { nombre: s.nombre, direccion: s.direccion },
      create: { id: s.id, nombre: s.nombre, direccion: s.direccion },
    });
  }

  // 2. Vehículos
  console.log(`🚗 Cargando ${data.vehiculos.length} vehículos...`);
  for (const v of data.vehiculos) {
    await prisma.vehiculo.upsert({
      where: { patente: v.patente },
      update: {
        patente: v.patente,
        vtvVencimiento: v.vtvVencimiento ? new Date(v.vtvVencimiento) : null,
        seguroVencimiento: v.seguroVencimiento ? new Date(v.seguroVencimiento) : null,
        proximoServiceKm: v.proximoServiceKm,
        activo: v.activo,
      },
      create: {
        patente: v.patente,
        vtvVencimiento: v.vtvVencimiento ? new Date(v.vtvVencimiento) : null,
        seguroVencimiento: v.seguroVencimiento ? new Date(v.seguroVencimiento) : null,
        proximoServiceKm: v.proximoServiceKm,
        activo: v.activo,
      },
    });
  }

  // 3. Choferes OFICIALES v8.3 (Audio Ultimátum)
  const defaultDrivers = [
    'Brian Lopez', 'Christian González', 'David Francisconi', 'Diego Retamar',
    'Esteban diaz', 'Gonzalo Martinez', 'Gally Nelson', 'Gerardo Visconti',
    'Ivan Santillan', 'Jonathan Vondrack', 'Juan Cruz Hidalgo', 'Lucio Bello',
    'Mariano Dejasman', 'Matías Chaile', 'Miguel Cejas', 'Tomas Casco'
  ];
  console.log(`👨‍✈️ Cargando ${defaultDrivers.length} conductores críticos...`);
  for (const name of defaultDrivers) {
    await prisma.chofer.upsert({
      where: { nombre: name },
      update: { activo: true },
      create: { nombre: name, activo: true },
    });
  }

  console.log('✅ Semilla completada exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
