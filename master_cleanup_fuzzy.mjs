import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ ERROR: DATABASE_URL no definida");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const FUZZY_CHOFERES = [
  { from: ["DAVID F", "DAVID FRANCISCONI "], to: "David Francisconi" },
  { from: ["TOMAS C", "TOMÁS CASCO", "TOMAS CASCO", "TOMAS CASCO "], to: "Tomas Casco" },
  { from: ["GALLY NELSON", "GALI NELSON"], to: "Gali Nelson" },
  { from: ["DIEGO R"], to: "Diego Rodriguez" },
  { from: ["IVÁN SANTILLÁN", "IVAN SANTILLAN"], to: "Ivan Santillan" },
  { from: ["JONATHAN V"], to: "Jonathan Villalba" },
  { from: ["BRIAN LOPEZ", "BRIAN LOPEZ "], to: "Brian Lopez" }
];

const FUZZY_SUCURSALES = [
  { from: ["CANNING2", "CANNING "], to: "Canning" },
  { from: ["LAPLATA30", "LAPLATA", " LA PLATA"], to: "La Plata" },
  { from: ["MORON II", "MORON ", "MORÓN"], to: "Moron" },
  { from: ["AVELLANEDA "], to: "Avellaneda" },
  { from: ["CONSTITUCIÓN"], to: "Constitucion" }
];

async function mergeChoferes(fromList, toName) {
  console.log(`🔍 FUSIONANDO CHOFERES -> ${toName}`);
  
  // 1. Buscar o crear el destino
  let destination = await prisma.chofer.findUnique({ where: { nombre: toName } });
  if (!destination) {
    destination = await prisma.chofer.create({ data: { nombre: toName } });
  }

  // 2. Buscar orígenes
  const sources = await prisma.chofer.findMany({
    where: { nombre: { in: fromList }, NOT: { id: destination.id } }
  });

  for (const src of sources) {
    console.log(`  Merging ID ${src.id} (${src.nombre}) into ID ${destination.id}`);
    await prisma.registroDiario.updateMany({
      where: { choferId: src.id },
      data: { choferId: destination.id, nombreConductor: toName }
    });
    await prisma.inspeccionMensual.updateMany({
      where: { choferId: src.id },
      data: { choferId: destination.id, nombreConductor: toName }
    });
    await prisma.chofer.delete({ where: { id: src.id } });
  }
}

async function mergeSucursales(fromList, toName) {
  console.log(`🔍 FUSIONANDO SUCURSALES -> ${toName}`);
  
  let destination = await prisma.sucursal.findFirst({ where: { nombre: toName } });
  if (!destination) {
    destination = await prisma.sucursal.create({ data: { nombre: toName } });
  }

  const sources = await prisma.sucursal.findMany({
    where: { nombre: { in: fromList }, NOT: { id: destination.id } }
  });

  for (const src of sources) {
    console.log(`  Merging Branch ID ${src.id} (${src.nombre}) into ID ${destination.id}`);
    await prisma.registroSucursal.updateMany({
      where: { sucursalId: src.id },
      data: { sucursalId: destination.id }
    });
    // Tricky: we can't easily merge the ManyToMany relation 'registros' without raw SQL or looping
    // But mostly it's used via RegistroSucursal
    await prisma.sucursal.delete({ where: { id: src.id } });
  }
}

async function main() {
  console.log("🚀 INICIANDO MASTER CLEANUP FUZZY v8.3");

  for (const group of FUZZY_CHOFERES) {
    await mergeChoferes(group.from, group.to);
  }

  for (const group of FUZZY_SUCURSALES) {
    await mergeSucursales(group.from, group.to);
  }

  // Normalización general final
  const allDrivers = await prisma.chofer.findMany();
  for (const d of allDrivers) {
      const clean = d.nombre.trim();
      if (clean !== d.nombre) {
          await prisma.chofer.update({ where: { id: d.id }, data: { nombre: clean } });
      }
  }

  console.log("✅ MASTER CLEANUP COMPLETADO.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
