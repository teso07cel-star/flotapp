const { Pool } = require('pg');
require('dotenv').config();

async function checkDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Checking database:", process.env.DATABASE_URL);
    
    const tables = ['Vehiculo', 'Sucursal', 'Chofer', 'RegistroDiario', 'Gasto'];
    
    for (const table of tables) {
      try {
        const res = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`Table "${table}": ${res.rows[0].count} rows`);
      } catch (e) {
        console.log(`Table "${table}": Error or does not exist (${e.message})`);
      }
    }

    const drivers = await pool.query('SELECT DISTINCT "nombreConductor" FROM "RegistroDiario" WHERE "nombreConductor" IS NOT NULL');
    console.log(`Unique drivers in RegistroDiario: ${drivers.rows.length}`);
    drivers.rows.forEach(d => console.log(`- ${d.nombreConductor}`));

  } catch (err) {
    console.error("Connection Error:", err.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
