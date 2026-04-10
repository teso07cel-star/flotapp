import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false }  });
  const res = await pool.query(`SELECT id, nombre FROM "Sucursal" ORDER BY nombre`);
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}
main();
