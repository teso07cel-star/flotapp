import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function merge(fromId, toId, toName) {
    console.log(`Merging ID ${fromId} into ID ${toId} (${toName})`);
    await prisma.registroDiario.updateMany({
        where: { choferId: fromId },
        data: { choferId: toId, nombreConductor: toName }
    });
    await prisma.inspeccionMensual.updateMany({
        where: { choferId: fromId },
        data: { choferId: toId, nombreConductor: toName }
    });
    await prisma.chofer.delete({ where: { id: fromId } });
}

async function main() {
    // Casos detectados en el último check
    // 1. Ivan Santillan (1904) vs Iván Santillán (11)
    await merge(11, 1904, "Ivan Santillan");

    // 2. Tomas Casco (1902) vs Tomás Casco (111)
    await merge(111, 1902, "Tomas Casco");

    // 3. gonzalo M (7) vs Gonzalo Martinez (52)
    await merge(7, 52, "Gonzalo Martinez");

    // 4. Jonathan v (6) -> Jonathan Villalba (Delete per user audio)
    console.log("Deleting Jonathan Villalba (Jonathan v)");
    await prisma.chofer.delete({ where: { id: 6 } });

    console.log("✅ REMATE DE LIMPIEZA COMPLETADO.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
