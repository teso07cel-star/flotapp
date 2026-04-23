import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error'] });

async function main() {
  console.log("🚀 Iniciando Sincronización Completa de FlotApp...");

  // 1. Cargar Sucursales desde data.json si el DB está vacío o para actualizar
  const dataPath = path.join(process.cwd(), 'data.json');
  if (fs.existsSync(dataPath)) {
    const localData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    console.log(`📍 Sincronizando ${localData.sucursales.length} sucursales...`);
    for (const s of localData.sucursales) {
      await prisma.sucursal.upsert({
        where: { id: s.id },
        update: { nombre: s.nombre, direccion: s.direccion },
        create: { id: s.id, nombre: s.nombre, direccion: s.direccion }
      });
    }

    console.log(`🚗 Sincronizando ${localData.vehiculos.length} vehículos...`);
    for (const v of localData.vehiculos) {
      await prisma.vehiculo.upsert({
        where: { patente: v.patente },
        update: { 
          vtvVencimiento: v.vtvVencimiento ? new Date(v.vtvVencimiento) : null,
          seguroVencimiento: v.seguroVencimiento ? new Date(v.seguroVencimiento) : null,
          proximoServiceKm: v.proximoServiceKm,
          activo: v.activo
        },
        create: { 
          patente: v.patente,
          vtvVencimiento: v.vtvVencimiento ? new Date(v.vtvVencimiento) : null,
          seguroVencimiento: v.seguroVencimiento ? new Date(v.seguroVencimiento) : null,
          proximoServiceKm: v.proximoServiceKm,
          activo: v.activo
        }
      });
    }
  }

  // 2. Cargar Choferes Críticos (desde scripts previos o conocidos)
  const criticalDrivers = [
    'Tomás Casco', 'Iván Santillán', 'Gali Nelson', 'Juan Cruz Hidalgo', 
    'Matías Chaile', 'Vega Jorge Daniel', 'Christian González', 'VideoTest'
  ];

  console.log(`👨‍✈️ Verificando ${criticalDrivers.length} conductores críticos...`);
  for (const name of criticalDrivers) {
    await prisma.chofer.upsert({
      where: { nombre: name },
      update: { activo: true },
      create: { nombre: name, activo: true }
    });
  }

  // 3. Resumen de estado actual
  const counts = {
    sucursales: await prisma.sucursal.count(),
    vehiculos: await prisma.vehiculo.count(),
    choferes: await prisma.chofer.count(),
    registros: await prisma.registroDiario.count()
  };

  console.log("\n✅ Sincronización Exitosa:");
  console.table(counts);

  if (counts.registros === 0) {
    console.warn("⚠️ Advertencia: No hay registros históricos (Bitácora) en el DB actual.");
  } else {
    console.log(`📈 Se detectaron ${counts.registros} registros históricos disponibles.`);
  }
}

main()
  .catch(e => {
    console.error("❌ Error durante la sincronización:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
