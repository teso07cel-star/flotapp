import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const res = await pool.query('SELECT id, fecha, "nombreConductor" FROM "RegistroDiario" ORDER BY fecha DESC LIMIT 5');
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}
main().catch(console.error);
