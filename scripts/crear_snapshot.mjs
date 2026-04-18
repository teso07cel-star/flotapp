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
  console.log("🚀 INICIANDO SNAPSHOT PREVENTIVO (Versión B8.1)...");

  try {
    const backup = {
      timestamp: new Date().toISOString(),
      vehiculos: await prisma.vehiculo.findMany(),
      choferes: await prisma.chofer.findMany(),
      sucursales: await prisma.sucursal.findMany(),
      registros: await prisma.registroDiario.findMany({
        include: {
            sucursales: true
        }
      }),
      gastos: await prisma.gasto.findMany()
    };

    const fileName = `respaldo_flotapp_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filePath = path.join(process.cwd(), 'backups', fileName);

    if (!fs.existsSync(path.join(process.cwd(), 'backups'))) {
      fs.mkdirSync(path.join(process.cwd(), 'backups'));
    }

    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

    console.log(`✅ Snapshot creado con éxito: ${fileName}`);
    console.log(`📊 Datos respaldados:`);
    console.table({
      Vehículos: backup.vehiculos.length,
      Choferes: backup.choferes.length,
      Sucursales: backup.sucursales.length,
      Registros: backup.registros.length,
      Gastos: backup.gastos.length
    });

  } catch (error) {
    console.error("❌ ERROR DURANTE EL SNAPSHOT:", error.message);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
