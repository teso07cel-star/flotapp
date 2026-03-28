import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function listDriversAndLastPatente() {
  try {
    const choferes = await prisma.$queryRaw`SELECT id, nombre FROM "Chofer" ORDER BY nombre ASC`;
    
    console.log("CONDUCTOR | ÚLTIMA PATENTE REGISTRADA");
    console.log("---------------------------------------");
    
    for (const c of choferes) {
      const lastRec = await prisma.$queryRaw`SELECT v.patente FROM "RegistroDiario" r JOIN "Vehiculo" v ON r."vehiculoId" = v.id WHERE r."nombreConductor" = ${c.nombre} ORDER BY r.fecha DESC LIMIT 1`;
      
      let patente = "Ninguna (Jamás se logueó)";
      if (lastRec && lastRec.length > 0) {
        patente = lastRec[0].patente;
      }
      
      console.log(c.nombre + " | " + patente);
    }
  } catch (err) {
    console.error(err);
  }
}

listDriversAndLastPatente().finally(() => process.exit(0));
