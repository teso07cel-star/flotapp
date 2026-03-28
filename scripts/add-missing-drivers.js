const { Client } = require('pg');

const connectionString = 'postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require&sslcert=';

const missingDrivers = [
  'Tomás Casco',
  'Iván Santillán',
  'Gali Nelson',
  'Juan Cruz Hidalgo',
  'Matías Chaile',
  'Vega Jorge Daniel',
  'Christian González'
];

async function addDrivers() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    for (const name of missingDrivers) {
      // Check if exists
      const res = await client.query('SELECT id FROM "Chofer" WHERE nombre = $1', [name]);
      if (res.rows.length === 0) {
        await client.query('INSERT INTO "Chofer" (nombre, activo) VALUES ($1, true)', [name]);
        console.log(`✅ Agregado: ${name}`);
      } else {
        console.log(`⚠️ Ya existe: ${name}`);
      }
    }
    
    console.log('Proceso completado.');
  } catch (err) {
    console.error('Error insertando conductores:', err.message);
  } finally {
    await client.end();
  }
}

addDrivers();
