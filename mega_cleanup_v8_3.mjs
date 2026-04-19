import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function merge(fromName, toName) {
    console.log(`🔍 Intentando fusionar: "${fromName}" -> "${toName}"`);
    const s = await prisma.chofer.findFirst({ where: { nombre: { equals: fromName, mode: 'insensitive' } } });
    const d = await prisma.chofer.findFirst({ where: { nombre: { equals: toName, mode: 'insensitive' } } });
    
    if (s && d && s.id !== d.id) {
        await prisma.registroDiario.updateMany({ where: { choferId: s.id }, data: { choferId: d.id, nombreConductor: toName } });
        await prisma.inspeccionMensual.updateMany({ where: { choferId: s.id }, data: { choferId: d.id, nombreConductor: toName } });
        await prisma.chofer.delete({ where: { id: s.id } });
        console.log(`  ✅ Fusión ${fromName} -> ${toName} exitosa.`);
    } else if (s && !d) {
        await prisma.chofer.update({ where: { id: s.id }, data: { nombre: toName } });
        console.log(`  ✅ Renombrado simple: ${fromName} -> ${toName}`);
    } else {
        console.log(`  ⚠️ No se pudo procesar fusión de "${fromName}"`);
    }
}

async function safeDeleteChofer(name) {
    console.log(`🔥 Borrando chofer: "${name}"`);
    const c = await prisma.chofer.findFirst({ where: { nombre: { equals: name, mode: 'insensitive' } } });
    if (c) {
        try {
            await prisma.chofer.delete({ where: { id: c.id } });
            console.log(`  ✅ Borrado.`);
        } catch (e) {
            console.log(`  ❌ Fallo borrar (tiene registros): ${name}`);
        }
    }
}

async function safeDeleteSucursal(name) {
    console.log(`🔥 Borrando sucursal: "${name}"`);
    const s = await prisma.sucursal.findFirst({ where: { nombre: { equals: name, mode: 'insensitive' } } });
    if (s) {
        await prisma.registroSucursal.deleteMany({ where: { sucursalId: s.id } });
        await prisma.sucursal.delete({ where: { id: s.id } });
        console.log(`  ✅ Borrada.`);
    }
}

async function main() {
    console.log("🚀 MEGA-LIMPIEZA FINAL v8.3 (AUDIO 5 - 15 MIN DEADLINE)");

    // 1. LIMPIEZA CHOFERES
    const targetNames = [
        "Brian Lopez", "Christian González", "David Francisconi", "Diego Retamar",
        "Esteban diaz", "Gonzalo Martinez", "Gally Nelson", "Gerardo Visconti",
        "Ivan Santillan", "Jonathan Bondrack", "Juan Cruz Hidalgo", "Lucio Bello",
        "Mariano Dejasman", "Matías Chaile", "Miguel Cejas", "Tomas Casco"
    ];

    await merge("David F", "David Francisconi");
    await merge("Diego R", "Diego Retamar");
    await merge("Gali Nelson", "Gally Nelson");
    await merge("Mariano", "Mariano Dejasman");
    await merge("Miguel C", "Miguel Cejas");
    await merge("Tomas C", "Tomas Casco");
    await merge("Tomas Caco", "Tomas Casco");
    await merge("gonzalo M", "Gonzalo Martinez");
    await merge("Gerardo v", "Gerardo Visconti");
    await merge("Jonathan v", "Jonathan Bondrack");
    await merge("Iván Santillán", "Ivan Santillan");

    await safeDeleteChofer("Diego Rodriguez");
    await safeDeleteChofer("Jonathan Villalba");

    // 2. LIMPIEZA SUCURSALES
    await safeDeleteSucursal("Constitucion");
    await safeDeleteSucursal("Deposito Norte");
    await safeDeleteSucursal("Madero"); // Puerto Madero se queda

    // Renombres y Direcciones
    console.log("🏙️ Actualizando Direcciones y nombres de sucursales...");
    const boedo = await prisma.sucursal.findFirst({ where: { nombre: "Boedo" } });
    if (boedo) await prisma.sucursal.update({ where: { id: boedo.id }, data: { direccion: "Avenida Corrientes 809" } });

    const laplata = await prisma.sucursal.findFirst({ where: { nombre: "La Plata" } });
    if (laplata) await prisma.sucursal.update({ where: { id: laplata.id }, data: { nombre: "La Plata 50" } });

    console.log("✅ MEGA-LIMPIEZA COMPLETADA.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
