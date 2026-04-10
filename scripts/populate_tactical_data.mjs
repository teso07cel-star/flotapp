import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function populate() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("❌ ERROR: DATABASE_URL no está definida.");
    process.exit(1);
  }

  console.log('🚀 Iniciando población táctica de Base de Datos vía SQL Directo...');
  const pool = new pg.Pool({ 
    connectionString, 
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false } 
  });

  try {
    // 1. Sucursales
    console.log('--- Sincronizando Sucursales ---');
    const sucursales = [
      { nombre: 'SEDE CENTRAL', direccion: 'Av. Corrientes 1234, CABA' },
      { nombre: 'LOGÍSTICA SUR', direccion: 'Pueyrredón 456, Avellaneda' },
      { nombre: 'PLANTA NORTE', direccion: 'Ruta 9 Km 50, Campana' }
    ];

    for (const s of sucursales) {
      await pool.query(
        `INSERT INTO "Sucursal" (nombre, direccion) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`,
        [s.nombre, s.direccion]
      );
    }
    console.log('✅ Sucursales listas.');

    // 2. Vehículos
    console.log('--- Sincronizando Vehículos ---');
    const vehiculos = [
      { patente: 'AE123FG', categoria: 'PICKUP', tipo: 'INTERNO', km: 45000 },
      { patente: 'AF456GH', categoria: 'CAMIONETA', tipo: 'INTERNO', km: 12000 },
      { patente: '234ABC', categoria: 'MOTO', tipo: 'INTERNO', km: 5000 }
    ];

    for (const v of vehiculos) {
      await pool.query(
        `INSERT INTO "Vehiculo" (patente, categoria, tipo, activo, "proximoServiceKm") 
         VALUES ($1, $2, $3, true, $4) 
         ON CONFLICT (patente) DO UPDATE SET categoria = $2, "proximoServiceKm" = $4`,
        [v.patente, v.categoria, v.tipo, v.km]
      );
    }
    console.log('✅ Vehículos listos.');

    // 3. Conductores
    console.log('--- Sincronizando Conductores ---');
    const conductores = [
      { nombre: 'GONZALO' },
      { nombre: 'RAMIRO' },
      { nombre: 'LUCAS' },
      { nombre: 'MARIANO' }
    ];

    for (const c of conductores) {
      await pool.query(
        `INSERT INTO "Chofer" (nombre, activo) 
         VALUES ($1, true) 
         ON CONFLICT (nombre) DO UPDATE SET activo = true`,
        [c.nombre]
      );
    }
    console.log('✅ Conductores listos.');

    // 4. Limpieza de logs de hoy para reiniciar el demo si es necesario
    console.log('--- Reset de logs de hoy para demo limpia ---');
    await pool.query(`DELETE FROM "RegistroDiario" WHERE fecha >= CURRENT_DATE`);
    console.log('✅ Logs de hoy eliminados.');

    console.log('🏁 Proceso finalizado exitosamente.');
  } catch (err) {
    console.error('🔥 Error crítico:', err);
  } finally {
    await pool.end();
  }
}

populate();
