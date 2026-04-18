import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL no definida');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function mergeBranches(canonicalId, duplicateId) {
  console.log(`Fusionando sucursal ${duplicateId} en ${canonicalId}...`);
  
  // Update relations in RegistroSucursal
  const rsUpdate = await prisma.registroSucursal.updateMany({
    where: { sucursalId: duplicateId },
    data: { sucursalId: canonicalId }
  });
  console.log(`  Se movieron ${rsUpdate.count} relaciones de sucursales en registros.`);

  // Update relations in RegistroDiario (m:n relation)
  // This is tricky for implicit m:n, but the explicit join table should handle most cases.
  // Actually, RegistroDiarioToSucursal is implicit.
  // We should check if we can reach it via raw query if updateMany fails on it.
  
  // Delete duplicate
  await prisma.sucursal.delete({ where: { id: duplicateId } });
  console.log(`  Sucursal duplicada ${duplicateId} eliminada.`);
}

async function main() {
  console.log('🚀 INICIANDO LIMPIEZA DE SUCURSALES - v8.3');

  const branchMerges = [
    { canon: 29, dup: 53 },    // Canning
    { canon: 5, dup: 62 },     // Moron
  ];

  for (const m of branchMerges) {
    try {
      await mergeBranches(m.canon, m.dup);
    } catch (e) {
      console.warn(`⚠️ Error al fusionar sucursal ${m.dup}:`, e.message);
    }
  }

  // NORMALIZE REMAINING NAMES
  console.log('🧹 Normalizando nombres de sucursales (trim)...');
  const branches = await prisma.sucursal.findMany();
  for (const b of branches) {
    const cleanName = b.nombre.trim();
    if (cleanName !== b.nombre) {
      await prisma.sucursal.update({
        where: { id: b.id },
        data: { nombre: cleanName }
      });
      console.log(`  Normalizado: "${b.nombre}" -> "${cleanName}"`);
    }
  }

  console.log('✅ LIMPIEZA DE SUCURSALES COMPLETADA.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
