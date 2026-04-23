import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("💣 PURGA TACTICA MARIANO v8.3.1.4");

    // 1. Buscar registros de Mariano Dejasman
    const mDejasman = await prisma.chofer.findFirst({ where: { nombre: { contains: "Dejasman" } } });
    const mClean = await prisma.chofer.findFirst({ where: { nombre: "Mariano" } });

    if (mDejasman) {
        console.log(`🔍 Encontrado: ${mDejasman.nombre} (ID: ${mDejasman.id})`);
        
        let targetId = mClean?.id;
        if (!targetId) {
            // Si no existe el "Mariano" limpio, simplemente renombramos el viejo
            console.log("📝 Renombrando Mariano Dejasman a Mariano...");
            await prisma.chofer.update({ where: { id: mDejasman.id }, data: { nombre: "Mariano" } });
        } else {
            console.log(`🔄 Fusionando ID ${mDejasman.id} -> ID ${targetId} (Mariano)`);
            await prisma.registroDiario.updateMany({ where: { choferId: mDejasman.id }, data: { choferId: targetId, nombreConductor: "Mariano" } });
            await prisma.inspeccionMensual.updateMany({ where: { choferId: mDejasman.id }, data: { choferId: targetId, nombreConductor: "Mariano" } });
            await prisma.chofer.delete({ where: { id: mDejasman.id } });
        }
    } else {
        console.log("✅ No se encontró a Dejasman (ya purgado o inexistente).");
    }

    console.log("✅ SISTEMA ALINEADO.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
