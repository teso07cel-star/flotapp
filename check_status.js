const { Pool } = require('pg');
require('dotenv').config();

async function checkData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const cRes = await pool.query('SELECT COUNT(*) FROM "Chofer"');
    const vRes = await pool.query('SELECT COUNT(*) FROM "Vehiculo"');
    const choferes = await pool.query('SELECT nombre FROM "Chofer" LIMIT 5');
    const vehiculos = await pool.query('SELECT patente FROM "Vehiculo" LIMIT 5');

    console.log('--- DATABASE STATUS ---');
    console.log('Total Choferes:', cRes.rows[0].count);
    console.log('Total Vehiculos:', vRes.rows[0].count);
    console.log('\nSample Choferes:');
    choferes.rows.forEach(r => console.log('- ' + r.nombre));
    console.log('\nSample Vehiculos:');
    vehiculos.rows.forEach(r => console.log('- ' + r.patente));
    console.log('------------------------');

  } catch (err) {
    console.error('Error checking data:', err.message);
  } finally {
    await pool.end();
  }
}

checkData();
