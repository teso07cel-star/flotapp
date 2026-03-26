const fs = require('fs/promises');
const path = require('path');

async function test(patente) {
  const DB_PATH = path.join(process.cwd(), 'data.json');
  try {
    const data = JSON.parse(await fs.readFile(DB_PATH, 'utf-8'));
    const v = data.vehiculos.find(v => v.patente === patente.toUpperCase().trim());
    console.log('Vehiculo found:', v ? v.id : 'null');
    
    if (v) {
        // Mock findUnique include logic
        const include = { registros: { take: 1 } };
        v.registros = data.registros
          .filter(r => r.vehiculoId === v.id)
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, include.registros.take || 999);
        console.log('Registros count:', v.registros.length);
    }
    console.log('Success');
  } catch (err) {
    console.error('Error caught:', err);
  }
}

test('AD724VP');
