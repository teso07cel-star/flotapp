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
    console.log("💣 INICIANDO PURGA TÁCTICA POR ID v8.3");

    // Mapeos basados en el último check
    await mergeById(2036, 4, "Diego Retamar");    // Diego r -> Diego Retamar
    await mergeById(2039, 1756, "Gally Nelson");  // Gali Nelson -> Gally Nelson
    await mergeById(2040, 3, "Gerardo Visconti"); // Gerardo v -> Gerardo Visconti
    await mergeById(2041, 1904, "Ivan Santillan"); // Iván Santillán -> Ivan Santillan
    await mergeById(2042, 1960, "Jonathan Vondrack"); // Jonathan v -> Jonathan Vondrack
    await mergeById(2045, 30, "Mariano Dejasman"); // MARIANO -> Mariano Dejasman
    await mergeById(2047, 142, "Miguel Cejas");   // Miguel c -> Miguel Cejas
    await mergeById(1976, 1902, "Tomas Casco");     // Tomás Casco -> Tomas Casco
    await mergeById(1966, 52, "Gonzalo Martinez"); // GONZALO -> Gonzalo Martinez

    // Otros registros que no están en la lista oficial de 16 nombres
    const othersToDelete = [15, 26]; // Vega Jorge Daniel, VideoTest
    for (const id of othersToDelete) {
        console.log(`🔥 Borrando registro no oficial ID ${id}`);
        try {
            await prisma.chofer.delete({ where: { id } });
        } catch (e) {
            console.log(`  ⚠️ No se pudo borrar ID ${id}: ${e.message}`);
        }
    }

    console.log("✅ PURGA POR ID COMPLETADA.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
