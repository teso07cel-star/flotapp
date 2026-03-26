import pg from 'pg';

const pool = new pg.Pool({
  connectionString: "postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require&connect_timeout=300"
});

async function main() {
  console.log("Conectando a la DB en produccion con pg...");
  const client = await pool.connect();
  
  try {
    const res = await client.query(`SELECT id, patente, "vtvVencimiento", "seguroVencimiento" FROM "Vehiculo" WHERE patente = 'AF668JR'`);
    if (res.rows.length === 0) {
      console.log("No se encontro AF668JR");
      return;
    }

    const vehiculo = res.rows[0];
    console.log("Vehiculo encontrado! ID:", vehiculo.id);

    // Patch VTV
    if (vehiculo.vtvVencimiento) {
      const vtv = new Date(vehiculo.vtvVencimiento);
      if (isNaN(vtv.getTime()) || vtv.getFullYear() > 2100 || vtv.getFullYear() < 2000) {
        console.log("VTV_CORRUPTO:", vehiculo.vtvVencimiento);
        await client.query(`UPDATE "Vehiculo" SET "vtvVencimiento" = '2026-01-01T00:00:00Z' WHERE id = $1`, [vehiculo.id]);
        console.log("-> VTV corregido");
      }
    }

    // Patch Seguro
    if (vehiculo.seguroVencimiento) {
      const seg = new Date(vehiculo.seguroVencimiento);
      if (isNaN(seg.getTime()) || seg.getFullYear() > 2100 || seg.getFullYear() < 2000) {
        console.log("SEGURO_CORRUPTO:", vehiculo.seguroVencimiento);
        await client.query(`UPDATE "Vehiculo" SET "seguroVencimiento" = '2026-01-01T00:00:00Z' WHERE id = $1`, [vehiculo.id]);
        console.log("-> Seguro corregido");
      }
    }

    // Check registros
    const registrosRes = await client.query(`SELECT id, fecha FROM "RegistroDiario" WHERE "vehiculoId" = $1`, [vehiculo.id]);
    let fixedReg = 0;
    for (const r of registrosRes.rows) {
      if (r.fecha) {
        const d = new Date(r.fecha);
        if (isNaN(d.getTime()) || d.getFullYear() > 2100 || d.getFullYear() < 2000) {
          console.log(`Registro ${r.id} tiene fecha corrupta: ${r.fecha}`);
          await client.query(`UPDATE "RegistroDiario" SET fecha = '2026-01-01T12:00:00Z' WHERE id = $1`, [r.id]);
          fixedReg++;
        }
      }
    }
    if (fixedReg > 0) console.log(`Corregidos ${fixedReg} registros.`);

    // Check gastos
    const gastosRes = await client.query(`SELECT id, fecha FROM "Gasto" WHERE "vehiculoId" = $1`, [vehiculo.id]);
    let fixedGas = 0;
    for (const g of gastosRes.rows) {
      if (g.fecha) {
        const d = new Date(g.fecha);
        if (isNaN(d.getTime()) || d.getFullYear() > 2100 || d.getFullYear() < 2000) {
          console.log(`Gasto ${g.id} tiene fecha corrupta: ${g.fecha}`);
          await client.query(`UPDATE "Gasto" SET fecha = '2026-01-01T12:00:00Z' WHERE id = $1`, [g.id]);
          fixedGas++;
        }
      }
    }
    if (fixedGas > 0) console.log(`Corregidos ${fixedGas} gastos.`);

    console.log("Revision terminada.");
  } finally {
    client.release();
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => pool.end());
