import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function reset() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) throw new Error("No string");

  const pool = new pg.Pool({ connectionString });

  // Get vehicle
  const res = await pool.query(`SELECT id FROM "Vehiculo" WHERE patente = 'AAA000'`);
  if (res.rows.length > 0) {
    const vId = res.rows[0].id;
    // Delete today's logs
    const delRes = await pool.query(`
      DELETE FROM "RegistroDiario" 
      WHERE "vehiculoId" = $1 
      AND "nombreConductor" = 'JUAN PEREZ' 
      AND "fecha" >= current_date
    `, [vId]);
    console.log(`Deleted ${delRes.rowCount} logs.`);

    // Reset auth
    await pool.query(`UPDATE "Vehiculo" SET "codigoAutorizacion" = null WHERE id = $1`, [vId]);
    console.log("Auth code cleared.");
  }
}

reset().finally(() => process.exit(0));
