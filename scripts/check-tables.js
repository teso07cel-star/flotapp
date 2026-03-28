const { Pool } = require('pg');
require('dotenv').config();

async function checkTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in database:");
    res.rows.forEach(row => console.log("- " + row.table_name));
    
    // Check columns for any driver-related table
    const potentialTables = res.rows.filter(row => 
      row.table_name.toLowerCase().includes('chofer') || 
      row.table_name.toLowerCase().includes('driver') ||
      row.table_name.toLowerCase().includes('conductor')
    );

    for (const table of potentialTables) {
      console.log(`\nColumns in ${table.table_name}:`);
      const cols = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table.table_name}'
      `);
      cols.rows.forEach(col => console.log(`  ${col.column_name} (${col.data_type})`));
      
      const count = await pool.query(`SELECT COUNT(*) FROM "${table.table_name}"`);
      console.log(`Row count: ${count.rows[0].count}`);
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

checkTables();
