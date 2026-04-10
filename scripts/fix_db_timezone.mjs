import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const pool = new pg.Pool({ 
  connectionString, 
  ssl: { rejectUnauthorized: false } 
});

async function migrate() {
  console.log("🚀 Iniciando migración de zona horaria (Restando 3 horas)...");
  
  const tables = [
    { name: 'RegistroDiario', column: 'fecha' },
    { name: 'Gasto', column: 'fecha' },
    { name: 'InspeccionMensual', column: 'fecha' },
    { name: 'Mantenimiento', column: 'fecha' },
    { name: 'AutorizacionDispositivo', column: 'fechaSolicitud' }
  ];

  try {
    for (const table of tables) {
      console.log(`\n📦 Procesando tabla: ${table.name}...`);
      
      // SQL para restar 3 horas de forma segura en Postgres
      const query = `
        UPDATE "${table.name}" 
        SET "${table.column}" = "${table.column}" - INTERVAL '3 hours'
        WHERE "${table.column}" IS NOT NULL
      `;
      
      const res = await pool.query(query);
      console.log(`✅ ${table.name} actualizada: ${res.rowCount} filas modificadas.`);
    }

    console.log("\n✨ Migración completada con éxito.");
  } catch (err) {
    console.error("\n❌ Error durante la migración:", err);
  } finally {
    await pool.end();
  }
}

migrate();
