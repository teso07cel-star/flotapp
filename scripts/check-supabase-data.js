const { Client } = require('pg');

const connectionString = 'postgresql://postgres.siqxydghsjmvmjgkmvps:admin123@db.siqxydghsjmvmjgkmvps.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function test() {
  try {
    console.log('Conectando a Supabase para listar tablas...');
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tablas encontradas:', res.rows.map(r => r.table_name).join(', '));
    
    // Si existe Chofer, ver cuántos hay
    const hasChofer = res.rows.some(r => r.table_name === 'Chofer');
    if (hasChofer) {
        const choferes = await client.query("SELECT COUNT(*) FROM \"Chofer\"");
        console.log('Total de Choferes en Supabase:', choferes.rows[0].count);
    }

    // Ver registros
    const hasRegistros = res.rows.some(r => r.table_name === 'RegistroDiario');
    if (hasRegistros) {
        const registros = await client.query("SELECT COUNT(*) FROM \"RegistroDiario\"");
        console.log('Total de Registros en Supabase:', registros.rows[0].count);
    }

    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
