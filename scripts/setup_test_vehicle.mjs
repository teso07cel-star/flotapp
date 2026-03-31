import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: "postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require"
});

async function main() {
  await client.connect();
  const res = await client.query(
    'UPDATE "InspeccionMensual" SET mes = 2 WHERE "vehiculoId" = (SELECT id FROM "Vehiculo" WHERE patente = $1)',
    ['DZC212']
  );
  console.log('UPDATED:', res.rowCount);
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
