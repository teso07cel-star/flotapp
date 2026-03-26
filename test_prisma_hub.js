const { Client } = require('pg');

const connectionString = 'postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require';

const client = new Client({
  connectionString: connectionString,
});

async function test() {
  try {
    console.log('Intentando conectar a DB Prisma...');
    await client.connect();
    console.log('¡Conexión exitosa!');
    await client.end();
  } catch (err) {
    console.error('Fallo en la conexión:', err.message);
  }
}

test();
