import { Pool } from 'pg';

const connectionString = "postgres://297be268d5b229f560b1d1b4be4a8f794ca14c6fe8aab949b5ca9bc4e0542063:sk_igmAkoXaDNyPkmXZhzeWl@pooled.db.prisma.io:5432/postgres?sslmode=require";

async function testConnection() {
  const pool = new Pool({ connectionString });
  try {
    console.log("⏳ Conectando a la DB Pooled...");
    const client = await pool.connect();
    console.log("✅ Conexión establecida.");
    
    const drivers = await client.query('SELECT count(*) FROM "Chofer"');
    console.log(`👨‍✈️ Cantidad de Choferes: ${drivers.rows[0].count}`);
    
    const vehicles = await client.query('SELECT count(*) FROM "Vehiculo"');
    console.log(`🚗 Cantidad de Vehículos: ${vehicles.rows[0].count}`);
    
    client.release();
  } catch (err) {
    console.error("❌ Error de conexión:", err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
