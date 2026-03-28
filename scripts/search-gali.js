const { Client } = require('pg');

const connectionString = 'postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require&sslcert=';

async function d() { 
  const client = new Client({connectionString}); 
  await client.connect(); 
  const res = await client.query('SELECT * FROM "RegistroDiario"'); 
  res.rows.forEach(r => {
      const match = JSON.stringify(r).toLowerCase();
      if (match.includes("gali") || match.includes("gal") || match.includes("nels") || match.includes("nls") || match.includes("nelson")) {
        console.log("MATCH FOUND IN REGISTRO:", r);
      }
  }); 
  await client.end(); 
} 
d();
