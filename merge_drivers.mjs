import 'dotenv/config';
import { getPrisma } from "./src/lib/prisma.js";

async function mergeDrivers() {
    console.log('🚀 INICIANDO FUSIÓN NUCLEAR DE CONDUCTORES...');
    const prisma = getPrisma();

    // Mapeo: ID Malo -> ID Bueno
    const merges = [
        { from: 75, to: 30, name: "MARIANO" },           // Mariano
        { from: 113, to: 1428, name: "Gally Nelson" },   // Gali -> Gally
        { from: 71, to: 11, name: "Iván Santillán" },   // Ivan -> Iván
        { from: 78, to: 111, name: "Tomás Casco" },     // Tomas -> Tomás
        { from: 1437, to: 111, name: "Tomás Casco" },    // Tomas C -> Tomás
        { from: 1423, to: 9, name: "David Francisconi" }, // David f -> David
        { from: 66, to: 4, name: "Diego Retamar" },      // Diego Retamar (ID 66) -> Diego r (ID 4)
        { from: 72, to: 6, name: "Jonathan Vondrack" },  // Jonathan Vondrack (ID 72) -> Jonathan v (ID 6)
        { from: 77, to: 8, name: "Miguel Cejas" },       // Miguel Cejas (ID 77) -> Miguel c (ID 8)
        { from: 70, to: 3, name: "Gerardo Visconti" }    // Gerardo Visconti (ID 70) -> Gerardo v (ID 3)
    ];

    for (const m of merges) {
        console.log(`\n🔄 Procesando fusión: ${m.from} -> ${m.to} (${m.name})`);
        
        try {
            // 1. Mover RegistrosDiarios
            const regCount = await prisma.registroDiario.updateMany({
                where: { choferId: m.from },
                data: { choferId: m.to, nombreConductor: m.name }
            });
            console.log(`   - Registros Diarios movidos: ${regCount.count}`);

            // 2. Mover Inspecciones
            const inspCount = await prisma.inspeccionMensual.updateMany({
                where: { choferId: m.from },
                data: { choferId: m.to, nombreConductor: m.name }
            });
            console.log(`   - Inspecciones movidas: ${inspCount.count}`);

            // 3. Borrar el chofer duplicado
            await prisma.chofer.delete({ where: { id: m.from } });
            console.log(`   - Chofer duplicado ID ${m.from} eliminado.`);

        } catch (e) {
            console.warn(`   ⚠️ Error en fusión ${m.from}: ${e.message}`);
        }
    }

    // RENOMBRES TÁCTICOS (Para que queden con nombre completo)
    const renames = [
        { id: 4, name: "Diego Retamar" },
        { id: 6, name: "Jonathan Vondrack" },
        { id: 8, name: "Miguel Cejas" },
        { id: 3, name: "Gerardo Visconti" },
        { id: 5, name: "Esteban Diaz" },
        { id: 7, name: "Gonzalo Martínez" }
    ];

    for (const r of renames) {
        try {
            await prisma.chofer.update({
                where: { id: r.id },
                data: { nombre: r.name }
            });
            console.log(`✅ Nombre actualizado: ID ${r.id} -> ${r.name}`);
        } catch (e) {
            console.warn(`⚠️ Error al renombrar ID ${r.id}: ${e.message}`);
        }
    }

    console.log('\n✅ FUSIÓN Y LIMPIEZA COMPLETADA.');
    process.exit(0);
}

mergeDrivers();
