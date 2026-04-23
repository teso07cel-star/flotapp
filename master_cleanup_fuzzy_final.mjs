import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ ERROR: DATABASE_URL no definida");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function safeMerge(fromName, toName) {
    if (fromName.toUpperCase() === toName.toUpperCase()) return;
    
    console.log(`🔍 Buscando fusión: "${fromName}" -> "${toName}"`);
    
    // 1. Buscar o crear destino
    let dest = await prisma.chofer.findFirst({ where: { nombre: { equals: toName, mode: 'insensitive' } } });
    if (!dest) {
        console.log(`  + Creando destino: ${toName}`);
        dest = await prisma.chofer.create({ data: { nombre: toName } });
    }

    // 2. Buscar origen
    const source = await prisma.chofer.findFirst({ where: { nombre: { equals: fromName, mode: 'insensitive' } } });
    
    if (source && source.id !== dest.id) {
        console.log(`  📦 Moviendo registros de ID ${source.id} a ID ${dest.id}`);
        await prisma.registroDiario.updateMany({
            where: { choferId: source.id },
            data: { choferId: dest.id, nombreConductor: toName }
        });
        await prisma.inspeccionMensual.updateMany({
            where: { choferId: source.id },
            data: { choferId: dest.id, nombreConductor: toName }
        });
        await prisma.chofer.delete({ where: { id: source.id } });
        console.log(`  ✅ Fusión completada.`);
    } else {
        console.log(`  ⚠️ No se encontró el origen "${fromName}" o es el mismo que el destino.`);
    }
}

async function safeRename(fromName, toName) {
    console.log(`🔍 Renombrando: "${fromName}" -> "${toName}"`);
    const chofer = await prisma.chofer.findFirst({ where: { nombre: { equals: fromName, mode: 'insensitive' } } });
    if (chofer) {
        await prisma.chofer.update({ 
            where: { id: chofer.id }, 
            data: { nombre: toName } 
        });
        await prisma.registroDiario.updateMany({
            where: { choferId: chofer.id },
            data: { nombreConductor: toName }
        });
        await prisma.inspeccionMensual.updateMany({
            where: { choferId: chofer.id },
            data: { nombreConductor: toName }
        });
        console.log(`  ✅ Nombre actualizado.`);
    } else {
        console.log(`  ⚠️ No se encontró "${fromName}".`);
    }
}

async function safeDelete(name) {
    console.log(`🔥 ELIMINANDO: "${name}"`);
    const chofer = await prisma.chofer.findFirst({ where: { nombre: { equals: name, mode: 'insensitive' } } });
    if (chofer) {
        // Borrar dependencias si existen (o dejar que Prisma falle si hay?)
        // En este caso el usuario pide borrar, asumo que no importan sus registros o los moví antes.
        try {
            await prisma.chofer.delete({ where: { id: chofer.id } });
            console.log(`  ✅ Eliminado.`);
        } catch (e) {
            console.error(`  ❌ No se pudo borrar "${name}" (posiblemente tiene registros vinculados que no se movieron).`);
        }
    }
}

async function main() {
    console.log("🚀 OPERACIÓN LIMPIEZA QUIRÚRGICA v8.3 (AUDIO)");

    // 1. Fusiones Críticas
    await safeMerge("David F", "David Francisconi");
    await safeMerge("Gali Nelson", "Gally Nelson");
    await safeMerge("Tomas C", "Tomas Casco");
    await safeMerge("Tomas Caco", "Tomas Casco");
    await safeMerge("Jonathan B", "Jonathan Bondrack");

    // 2. Renombres Críticos
    await safeRename("Diego R", "Diego Retamar");
    await safeRename("Mariano", "Mariano Dejasman");
    await safeRename("Miguel C", "Miguel Cejas");
    await safeRename("Gonzalo", "Gonzalo Martinez");

    // 3. Eliminaciones solicitadas
    await safeDelete("Diego Rodriguez");
    await safeDelete("Jonathan Villalba");

    // 4. Sucursales de Producción
    console.log("🏙️ Normalizando Sucursales...");
    const canning2 = await prisma.sucursal.findFirst({ where: { nombre: { contains: "Canning2" } } });
    if (canning2) {
        const canDest = await prisma.sucursal.findFirst({ where: { nombre: "Canning" } });
        if (canDest) {
            await prisma.registroSucursal.updateMany({ where: { sucursalId: canning2.id }, data: { sucursalId: canDest.id } });
            await prisma.sucursal.delete({ where: { id: canning2.id } });
        }
    }

    console.log("✅ LIMPIEZA COMPLETADA.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
