import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function fix() {
  console.log('--- INICIANDO CORRECCIÓN DE DATOS ---');
  
  try {
    // 1. Corregir el outlier de AF601QS (ID 451)
    // El valor 284120 es claramente un error comparado con el anterior 28450.
    // Lo ajustamos a 28512 (un incremento razonable de 62km).
    await prisma.registroDiario.update({
      where: { id: 451 },
      data: { kmActual: 28512 }
    });
    console.log('✅ Registro 451 (AF601QS) corregido a 28512 km.');

    // 2. Actualizar direcciones de sucursales faltantes
    const branchUpdates = [
      { id: 39, direccion: 'Varela, Buenos Aires' },
      { id: 40, direccion: 'Berisso, Buenos Aires' },
      { id: 41, direccion: 'La Plata, Buenos Aires' },
      { id: 43, direccion: 'Chascomús, Buenos Aires' },
      { id: 44, direccion: 'Gualeguaychú, Entre Ríos' },
      { id: 45, direccion: 'Concordia, Entre Ríos' },
      { id: 36, direccion: 'Wilde, Buenos Aires' },
      { id: 37, direccion: 'Bernal, Buenos Aires' },
    ];

    for (const update of branchUpdates) {
      await prisma.sucursal.update({
        where: { id: update.id },
        data: { direccion: update.direccion }
      });
      console.log(`✅ Dirección de sucursal ID ${update.id} actualizada.`);
    }

    console.log('\n--- CORRECCIÓN COMPLETADA CON ÉXITO ---');

  } catch (err) {
    console.error('❌ ERROR DURANTE LA CORRECCIÓN:', err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}
fix();
