import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function debug() {
  console.log('--- DEEP DEBUG DIAGNOSTIC ---');
  console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
  
  try {
    const totalChoferes = await prisma.chofer.count();
    const activosChoferes = await prisma.chofer.count({ where: { activo: true } });
    const sample = await prisma.chofer.findFirst();
    
    console.log('RESULTADOS:');
    console.log('- Total Choferes en tabla:', totalChoferes);
    console.log('- Choferes con activo=true:', activosChoferes);
    console.log('- Muestra de dato:', sample ? JSON.stringify(sample) : 'Ninguno');
    
    const registros = await prisma.registroDiario.count();
    console.log('- Total Registros Diarios:', registros);
    
    if (totalChoferes > 0 && activosChoferes === 0) {
       console.log('\n⚠️ ALERTA: Tienes choferes pero están marcados como INACTIVOS (activo: false). Por eso la UI no los muestra.');
    }

  } catch (err) {
    console.error('\n❌ ERROR DE DB:', err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}
debug();
