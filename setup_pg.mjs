import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function setup() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) throw new Error("No config");

  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false }  });

  // Ensure Vehiculo AAA000
  let res = await pool.query(`SELECT id FROM "Vehiculo" WHERE patente = 'AAA000'`);
  let vId;
  if (res.rows.length === 0) {
    console.log("Creating vehicle AAA000...");
    res = await pool.query(`INSERT INTO "Vehiculo" (patente, categoria, tipo, activo, "vtvVencimiento", "seguroVencimiento") VALUES ('AAA000', 'PICKUP', 'INTERNO', true, now() + interval '1 year', now() + interval '1 year') RETURNING id`);
    vId = res.rows[0].id;
  } else {
    vId = res.rows[0].id;
  }

  // Ensure Chofer JUAN PEREZ
  res = await pool.query(`SELECT id FROM "Chofer" WHERE nombre = 'JUAN PEREZ'`);
  let cId;
  if (res.rows.length === 0) {
    console.log("Creating driver JUAN PEREZ...");
    res = await pool.query(`INSERT INTO "Chofer" (nombre, activo, "patenteAsignada") VALUES ('JUAN PEREZ', true, 'AAA000') RETURNING id`);
    cId = res.rows[0].id;
  } else {
    cId = res.rows[0].id;
  }

  // Delete all logs for today for AAA000
  const delRes = await pool.query(`
    DELETE FROM "RegistroDiario" 
    WHERE "vehiculoId" = $1 
    AND "nombreConductor" = 'JUAN PEREZ' 
    AND "fecha" >= current_date
  `, [vId]);
  console.log(`Deleted ${delRes.rowCount} previous logs for today.`);

  // Reset auth code
  await pool.query(`UPDATE "Vehiculo" SET "codigoAutorizacion" = null WHERE id = $1`, [vId]);
  
  console.log("Setup complete. Ready for recording.");
}

setup().finally(() => process.exit(0));
