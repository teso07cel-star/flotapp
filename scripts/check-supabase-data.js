const { Client } = require('pg');

const connectionString = 'postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require&sslcert=';

const client = new Client({
  connectionString: connectionString,
});

async function test() {
  try {
    console.log('Conectando a Prisma para listar tablas...');
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tablas encontradas:', res.rows.map(r => r.table_name).join(', '));
    
    // Si existe Chofer, ver cuántos hay
    const hasChofer = res.rows.some(r => r.table_name === 'Chofer');
    if (hasChofer) {
        const choferes = await client.query("SELECT COUNT(*) FROM \"Chofer\"");
        console.log('Total de Choferes en Prisma:', choferes.rows[0].count);
    }

    // Ver vehiculos
    const hasVehiculo = res.rows.some(r => r.table_name === 'Vehiculo');
    if (hasVehiculo) {
        const vehiculos = await client.query("SELECT COUNT(*) FROM \"Vehiculo\"");
        console.log('Total de Vehiculos en Prisma:', vehiculos.rows[0].count);
    }

    // Ver registros (bitacoras)
    const hasRegistros = res.rows.some(r => r.table_name === 'RegistroDiario');
    if (hasRegistros) {
        const registros = await client.query("SELECT COUNT(*) FROM \"RegistroDiario\"");
        console.log('Total de Registros en Prisma:', registros.rows[0].count);
    }
    
    // Ver gastos
    const hasGastos = res.rows.some(r => r.table_name === 'Gasto');
    if (hasGastos) {
        const gastos = await client.query("SELECT COUNT(*) FROM \"Gasto\"");
        console.log('Total de Gastos en Prisma:', gastos.rows[0].count);
    }

    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
