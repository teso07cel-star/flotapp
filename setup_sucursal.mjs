import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function setup() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) throw new Error("No config");

  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false }  });

  // Ensure Sucursales exist
  const res = await pool.query(`SELECT id FROM "Sucursal" LIMIT 1`);
  if (res.rows.length === 0) {
    console.log("Creating Branch 1...");
    await pool.query(`INSERT INTO "Sucursal" (nombre, direccion) VALUES ('Sucursal Centro', 'Av. Corrientes 1234')`);
    console.log("Creating Branch 2...");
    await pool.query(`INSERT INTO "Sucursal" (nombre, direccion) VALUES ('Planta Industrial', 'Ruta 9 Km 45')`);
  }
  
  console.log("Sucursal Setup complete.");
}

setup().finally(() => process.exit(0));
