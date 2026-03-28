const { Pool } = require('pg');
require('dotenv').config();

async function recoverDrivers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Reading registrations to find drivers...");
    const res = await pool.query('SELECT DISTINCT "nombreConductor" FROM "RegistroDiario" WHERE "nombreConductor" IS NOT NULL');
    console.log("Found drivers in history:");
    const names = res.rows.map(r => r.nombreConductor);
    names.forEach(name => console.log("- " + name));

    if (names.length === 0) {
      console.log("No drivers found in RegistroDiario. Checking if maybe there was another table before.");
    } else {
      // If we found names, we should make sure the Chofer table exists and has these names
      console.log("\nReconstructing Chofer table...");
      // Check if Chofer table exists
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'Chofer'
        )
      `);

      if (!tableCheck.rows[0].exists) {
        console.log("Creating Chofer table...");
        await pool.query(`
          CREATE TABLE "Chofer" (
            "id" SERIAL PRIMARY KEY,
            "nombre" TEXT NOT NULL UNIQUE,
            "activo" BOOLEAN NOT NULL DEFAULT true
          )
        `);
      }

      for (const name of names) {
        console.log(`Adding ${name} to Chofer table...`);
        await pool.query('INSERT INTO "Chofer" ("nombre") VALUES ($1) ON CONFLICT DO NOTHING', [name]);
      }
      console.log("Chofer table successfully populated!");
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

recoverDrivers();
