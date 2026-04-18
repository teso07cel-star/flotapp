import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import { BRANCH_COORDINATES } from '../src/lib/branchConfig.js';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("📍 ACTUALIZANDO DIRECCIONES DE SUCURSALES (49 SEDES)...");

  for (const [name, config] of Object.entries(BRANCH_COORDINATES)) {
    console.log(`- Procesando: ${name}`);
    
    // Normalizar nombre para búsqueda (ignorar case y acentos si es posible)
    // En este caso buscaremos coincidencia exacta por nombre.
    const sucursal = await prisma.sucursal.findFirst({
        where: { nombre: { contains: name, mode: 'insensitive' } }
    });

    if (sucursal) {
        await prisma.sucursal.update({
            where: { id: sucursal.id },
            data: { direccion: config.direccion }
        });
        console.log(`   ✅ Dirección actualizada: ${config.direccion}`);
    } else {
        // Si no existe, la creamos (Set maestro)
        await prisma.sucursal.create({
            data: { nombre: name, direccion: config.direccion }
        });
        console.log(`   🆕 Sucursal creada: ${name}`);
    }
  }

  console.log("\n🏁 ACTUALIZACIÓN DE SUCURSALES COMPLETADA.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
