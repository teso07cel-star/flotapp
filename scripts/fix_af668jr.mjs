import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require&connect_timeout=300"
    }
  }
});

async function main() {
  console.log("Conectando a la DB en produccion...");
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { patente: 'AF668JR' },
    include: { registros: true, gastos: true }
  });

  if (!vehiculo) {
    console.log("No se encontro AF668JR");
    return;
  }

  console.log("Vehiculo encontrado! ID:", vehiculo.id);
  console.log("VTV:", vehiculo.vtvVencimiento);
  console.log("Seguro:", vehiculo.seguroVencimiento);

  const updateData = {};
  if (vehiculo.vtvVencimiento) {
    const vtv = new Date(vehiculo.vtvVencimiento);
    if (isNaN(vtv.getTime()) || vtv.getFullYear() > 2100 || vtv.getFullYear() < 2000) {
      console.log("VTV_CORRUPTO: ", vehiculo.vtvVencimiento);
      updateData.vtvVencimiento = new Date("2026-01-01T00:00:00Z");
    }
  }
  
  if (vehiculo.seguroVencimiento) {
    const seg = new Date(vehiculo.seguroVencimiento);
    if (isNaN(seg.getTime()) || seg.getFullYear() > 2100 || seg.getFullYear() < 2000) {
      console.log("SEGURO_CORRUPTO: ", vehiculo.seguroVencimiento);
      updateData.seguroVencimiento = new Date("2026-01-01T00:00:00Z");
    }
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.vehiculo.update({
      where: { id: vehiculo.id },
      data: updateData
    });
    console.log("Fechas de vehiculo corregidas!");
  }

  let fixedRegistros = 0;
  for (const r of vehiculo.registros) {
    if (r.fecha) {
      const d = new Date(r.fecha);
      if (isNaN(d.getTime()) || d.getFullYear() > 2100 || d.getFullYear() < 2000) {
        console.log(`Registro ${r.id} tiene fecha corrupta: ${r.fecha}`);
        await prisma.registroDiario.update({
          where: { id: r.id },
          data: { fecha: new Date("2026-01-01T12:00:00Z") }
        });
        fixedRegistros++;
      }
    }
  }
  
  if (fixedRegistros > 0) console.log(`Corregidos ${fixedRegistros} registros diarios corruptos.`);

  let fixedGastos = 0;
  for (const g of vehiculo.gastos) {
    if (g.fecha) {
      const d = new Date(g.fecha);
      if (isNaN(d.getTime()) || d.getFullYear() > 2100 || d.getFullYear() < 2000) {
        console.log(`Gasto ${g.id} tiene fecha corrupta: ${g.fecha}`);
        await prisma.gasto.update({
          where: { id: g.id },
          data: { fecha: new Date("2026-01-01T12:00:00Z") }
        });
        fixedGastos++;
      }
    }
  }

  if (fixedGastos > 0) console.log(`Corregidos ${fixedGastos} gastos corruptos.`);

  if (Object.keys(updateData).length === 0 && fixedRegistros === 0 && fixedGastos === 0) {
    console.log("No se encontraron fechas corruptas. El problema es otro.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  });
