import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL no definida en .env');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando Carga Universal de Semillas en PRODUCCIÓN...');

  const dataPath = path.join(__dirname, 'data.json');
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

  // 3. Choferes
  const defaultDrivers = [
    'Tomás Casco', 'Iván Santillán', 'Gali Nelson', 'Juan Cruz Hidalgo', 
    'Matías Chaile', 'Vega Jorge Daniel', 'Christian González', 'VideoTest'
  ];
  console.log(`👨‍✈️ Cargando ${defaultDrivers.length} conductores...`);
  for (const name of defaultDrivers) {
    await prisma.chofer.upsert({
      where: { nombre: name },
      update: { activo: true },
      create: { nombre: name, activo: true },
    });
  }

  console.log('✅ Semilla en producción completada exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
