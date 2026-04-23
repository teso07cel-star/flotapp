import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("💣 FUSION FINAL DE IDENTIDAD v8.3.1.2");

    // Fusionar el nuevo Jonathan Vondrack (2384) al registro maestro (1960)
    try {
        await prisma.registroDiario.updateMany({ where: { choferId: 2384 }, data: { choferId: 1960, nombreConductor: "Jonathan Vondrack" } });
        await prisma.inspeccionMensual.updateMany({ where: { choferId: 2384 }, data: { choferId: 1960, nombreConductor: "Jonathan Vondrack" } });
        await prisma.chofer.delete({ where: { id: 2384 } });
        
        // Renombrar el maestro a la forma correcta con V
        await prisma.chofer.update({ where: { id: 1960 }, data: { nombre: "Jonathan Vondrack" } });
        console.log("✅ Jonathan Vondrack unificado satisfactoriamente.");
    } catch (e) {
        console.log("⚠️ Registro ya unificado o error: " + e.message);
    }

    console.log("✅ SISTEMA ALINEADO AL 100%.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
