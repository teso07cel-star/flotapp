const { Client } = require('pg');

const connectionString = 'postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require&sslcert=';

async function list() { 
  const client = new Client({connectionString}); 
  await client.connect(); 
  const res = await client.query('SELECT * FROM "Chofer"'); 
  console.log(res.rows); 
  await client.end(); 
} 
list();
