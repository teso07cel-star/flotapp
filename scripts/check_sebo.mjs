import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: "postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require"
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT * FROM "RegistroDiario" WHERE "nombreConductor" ILIKE $1 OR "novedades" ILIKE $2 LIMIT 5', ['%SEBO%', '%auditoria%']);
  console.log('RESULTS:', JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
