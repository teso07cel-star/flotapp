const { Client } = require('pg');

const connectionString = 'postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require&sslcert=';

async function findName() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    // Obtener nombres distintos en RegistroDiario
    const res = await client.query('SELECT DISTINCT "nombreConductor" FROM "RegistroDiario"');
    console.log('Nombres encontrados en bitácoras:');
    res.rows.forEach(r => console.log('-', r.nombreConductor));

    // Y ver si hay algún chofer que ya estaba con nombre parecido
    const resChofer = await client.query('SELECT "nombre" FROM "Chofer"');
    console.log('\nNombres de choferes en BD:');
    resChofer.rows.forEach(r => console.log('-', r.nombre));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

findName();
