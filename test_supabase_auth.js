const { Client } = require('pg');

const connectionString = 'postgresql://postgres.siqxydghsjmvmjgkmvps:admin123@db.siqxydghsjmvmjgkmvps.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function test() {
  try {
    console.log('Intertando conectar a Supabase...');
    await client.connect();
    console.log('¡Conexión exitosa!');
    await client.end();
  } catch (err) {
    console.error('Fallo en la conexión:', err.message);
  }
}

test();
