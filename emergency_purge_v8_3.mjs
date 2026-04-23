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
    console.log("💣 INICIANDO PURGA TÁCTICA DE EMERGENCIA v8.3.1");

    // IDs detectados en el último check (creados por el sync corrupto)
    await mergeById(2126, 4, "Diego Retamar");    // Diego r -> Diego Retamar
    await mergeById(2129, 1756, "Gally Nelson");  // Gali Nelson -> Gally Nelson
    await mergeById(2130, 3, "Gerardo Visconti"); // Gerardo v -> Gerardo Visconti
    await mergeById(2131, 1904, "Ivan Santillan"); // Iván Santillán -> Ivan Santillan
    await mergeById(2132, 1960, "Jonathan Vondrack"); // Jonathan v -> Jonathan Vondrack (con V)
    await mergeById(2135, 30, "Mariano Dejasman"); // MARIANO -> Mariano Dejasman
    await mergeById(2137, 142, "Miguel Cejas");   // Miguel c -> Miguel Cejas
    await mergeById(2138, 1902, "Tomas Casco");     // Tomás Casco -> Tomas Casco
    await mergeById(2128, 52, "Gonzalo Martinez"); // GONZALO -> Gonzalo Martinez

    // Otros/Basura
    const others = [2139, 2140]; // Vega Jorge Daniel (verificar si borrar), VideoTest
    for (const id of others) {
        try { await prisma.chofer.delete({ where: { id } }); } catch (e) {}
    }

    console.log("✅ PURGA DE EMERGENCIA COMPLETADA.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
