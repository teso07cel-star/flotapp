import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL no encontrada en .env");

  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false }  });
  
  const branchesToDelete = ['logistica sur', 'planta norte', 'sede central'];
  
  for (const name of branchesToDelete) {
    try {
      console.log(`Buscando sucursal: ${name}...`);
      const res = await pool.query(`SELECT id, nombre FROM "Sucursal" WHERE LOWER(nombre) = LOWER($1)`, [name]);
      
      if (res.rows.length > 0) {
        const branch = res.rows[0];
        console.log(`Eliminando sucursal: ${branch.nombre} (ID: ${branch.id})...`);
        
        // 1. Desconectar de bitácoras si hubiera (join table en prisma suele llamarse "_RegistroDiarioToSucursal")
        await pool.query(`DELETE FROM "_RegistroDiarioToSucursal" WHERE "B" = $1`, [branch.id]);
        
        // 2. Eliminar la sucursal
        await pool.query(`DELETE FROM "Sucursal" WHERE id = $1`, [branch.id]);
        console.log(`✅ ${branch.nombre} eliminada.`);
      } else {
        console.log(`⚠️ No se encontró la sucursal: ${name}`);
      }
    } catch (e) {
      console.error(`❌ Error eliminando ${name}:`, e.message);
    }
  }
  
  await pool.end();
}

main().catch(console.error);
