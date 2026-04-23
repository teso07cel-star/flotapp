import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function mergeById(fromId, toId, toName) {
    if (!fromId) return;
    console.log(`🔍 FUSIONANDO ID ${fromId} -> ID ${toId} (${toName})`);
    try {
        await prisma.registroDiario.updateMany({ where: { choferId: fromId }, data: { choferId: toId, nombreConductor: toName } });
        await prisma.inspeccionMensual.updateMany({ where: { choferId: fromId }, data: { choferId: toId, nombreConductor: toName } });
        await prisma.chofer.delete({ where: { id: fromId } });
        console.log(`  ✅ Éxito.`);
    } catch (e) {
        console.log(`  ⚠️ Fallo en ID ${fromId}: ${e.message}`);
    }
}

async function main() {
    console.log("💣 PURGA TÁCTICA FINAL v8.3.1.1 (ULTIMATUM)");

    const duplicates = [
        { from: 2360, to: 4, name: "Diego Retamar" },
        { from: 2362, to: 52, name: "Gonzalo Martinez" },
        { from: 2363, to: 1756, name: "Gally Nelson" },
        { from: 2364, to: 3, name: "Gerardo Visconti" },
        { from: 2365, to: 1904, name: "Ivan Santillan" },
        { from: 2366, to: 1960, name: "Jonathan Vondrack" },
        { from: 2369, to: 30, name: "Mariano Dejasman" },
        { from: 2371, to: 142, name: "Miguel Cejas" },
        { from: 2372, to: 1902, name: "Tomas Casco" }
    ];

    for (const d of duplicates) {
        await mergeById(d.from, d.to, d.name);
    }

    const trash = [2373, 2374, 2139, 2140]; 
    for (const id of trash) {
        try { await prisma.chofer.delete({ where: { id } }); } catch (e) {}
    }

    console.log("✅ SISTEMA PURGADO Y BLINDADO.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
