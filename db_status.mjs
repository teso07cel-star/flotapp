import { getPrisma } from './src/lib/prisma.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const prisma = getPrisma();
  try {
    const choferes = await prisma.chofer.count();
    const vehiculos = await prisma.vehiculo.count();
    const registros = await prisma.registroDiario.count();
    
    console.log("DATABASE STATUS:");
    console.log("- Choferes:", choferes);
    console.log("- Vehiculos:", vehiculos);
    console.log("- Registros:", registros);
  } catch (err) {
    console.error("DB Error:", err.message);
  }
}

check();
