import pkg from 'pg';
const { Client } = pkg;

async function check() {
  const client = new Client({
    connectionString: 'postgres://297be268d5b229f560b1d1b4be4a8f794ca14c6fe8aab949b5ca9bc4e0542063:sk_igmAkoXaDNyPkmXZhzeWl@pooled.db.prisma.io:5432/postgres?sslmode=require'
  });

  try {
    await client.connect();
    console.log('--- CONEXION EXITOSA ---');
    
    // Verificar tablas
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tablas detectadas:', tables.rows.map(r => r.table_name).join(', '));

    if (tables.rows.some(r => r.table_name === 'Vehiculo')) {
      const v = await client.query('SELECT count(*) FROM "Vehiculo"');
      const d = await client.query('SELECT count(*) FROM "Chofer"');
      console.log('Vehiculos en Cloud:', v.rows[0].count);
      console.log('Choferes en Cloud:', d.rows[0].count);
    } else {
      console.log('La base de datos parece estar vacia (sin tablas de FlotApp).');
    }

  } catch (e) {
    console.error('Error durante la verificacion:', e.message);
  } finally {
    await client.end();
  }
}

check();
