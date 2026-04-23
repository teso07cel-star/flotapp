import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function mergeById(fromId, toId, toName) {
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
    console.log("💣 INICIANDO PURGA TÁCTICA DE REDENCIÓN v8.3.1");

    // IDs detectados en el check 15:09
    await mergeById(2306, 4, "Diego Retamar");    // Diego r
    await mergeById(2308, 52, "Gonzalo Martinez"); // GONZALO
    await mergeById(2309, 1756, "Gally Nelson");  // Gali Nelson
    await mergeById(2310, 3, "Gerardo Visconti"); // Gerardo v
    await mergeById(2311, 1904, "Ivan Santillan"); // Iván Santillán
    await mergeById(2312, 1960, "Jonathan Vondrack"); // Jonathan v
    await mergeById(2315, 30, "Mariano Dejasman"); // MARIANO
    await mergeById(2317, 142, "Miguel Cejas");   // Miguel c
    await mergeById(2318, 1902, "Tomas Casco");     // Tomás Casco

    const others = [2319, 2320]; // Vega Jorge Daniel, VideoTest
    for (const id of others) {
        try { await prisma.chofer.delete({ where: { id } }); } catch (e) {}
    }

    console.log("✅ PURGA DE REDENCIÓN COMPLETADA.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
