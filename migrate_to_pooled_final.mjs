import pkg from 'pg';
const { Pool } = pkg;
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

// URL POOLED PROPORCIONADA POR SEÑOR X
const CONNECTION_STRING = 'postgres://297be268d5b229f560b1d1b4be4a8f794ca14c6fe8aab949b5ca9bc4e0542063:sk_igmAkoXaDNyPkmXZhzeWl@pooled.db.prisma.io:5432/postgres?sslmode=require';
const BACKUP_FILE = 'backups/respaldo_flotapp_2026-04-18T03-20-42-288Z.json';

const pool = new Pool({ connectionString: CONNECTION_STRING });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migrate() {
  console.log('🚀 INICIANDO MIGRACIÓN FINAL A POOLED DB...');
  
  if (!fs.existsSync(BACKUP_FILE)) {
    console.error('❌ ERROR: Archivo de respaldo no encontrado.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));

  // 1. Sucursales
  console.log(`📍 Sincronizando ${data.sucursales.length} sucursales...`);
  for (const s of data.sucursales) {
    try {
      await prisma.sucursal.upsert({
        where: { id: s.id },
        update: { nombre: s.nombre, direccion: s.direccion, lat: s.lat, lng: s.lng },
        create: { id: s.id, nombre: s.nombre, direccion: s.direccion, lat: s.lat, lng: s.lng },
      });
    } catch (e) {
      console.warn(`⚠️ Error sucursal ${s.id}: ${e.message}`);
    }
  }

  // 2. Vehículos
  console.log(`🚗 Sincronizando ${data.vehiculos.length} vehículos...`);
  for (const v of data.vehiculos) {
    try {
      await prisma.vehiculo.upsert({
        where: { id: v.id },
        update: {
          patente: v.patente,
          vtvVencimiento: v.vtvVencimiento ? new Date(v.vtvVencimiento) : null,
          seguroVencimiento: v.seguroVencimiento ? new Date(v.seguroVencimiento) : null,
          proximoServiceKm: v.proximoServiceKm,
          activo: v.activo,
          categoria: v.categoria,
          tipo: v.tipo,
          kmParaCambioCubiertas: v.kmParaCambioCubiertas,
          ultimoCambioCubiertasKm: v.ultimoCambioCubiertasKm
        },
        create: {
          id: v.id,
          patente: v.patente,
          vtvVencimiento: v.vtvVencimiento ? new Date(v.vtvVencimiento) : null,
          seguroVencimiento: v.seguroVencimiento ? new Date(v.seguroVencimiento) : null,
          proximoServiceKm: v.proximoServiceKm,
          activo: v.activo,
          categoria: v.categoria,
          tipo: v.tipo,
          kmParaCambioCubiertas: v.kmParaCambioCubiertas,
          ultimoCambioCubiertasKm: v.ultimoCambioCubiertasKm
        },
      });
    } catch (e) {
      console.warn(`⚠️ Error vehículo ${v.patente}: ${e.message}`);
    }
  }

  // 3. Choferes
  console.log(`👨‍✈️ Sincronizando ${data.choferes.length} conductores...`);
  for (const c of data.choferes) {
    try {
      await prisma.chofer.upsert({
        where: { id: c.id },
        update: { 
          nombre: c.nombre, 
          activo: c.activo, 
          passkeyId: c.passkeyId, 
          passkeyPubKey: c.passkeyPubKey ? Buffer.from(Object.values(c.passkeyPubKey)) : null,
          patenteAsignada: c.patenteAsignada 
        },
        create: { 
          id: c.id, 
          nombre: c.nombre, 
          activo: c.activo, 
          passkeyId: c.passkeyId, 
          passkeyPubKey: c.passkeyPubKey ? Buffer.from(Object.values(c.passkeyPubKey)) : null,
          patenteAsignada: c.patenteAsignada 
        },
      });
    } catch (e) {
      console.warn(`⚠️ Error chofer ${c.nombre}: ${e.message}`);
    }
  }

  // 4. Registros Diarios
  console.log(`📝 Sincronizando ${data.registros.length} registros diarios...`);
  for (const r of data.registros) {
    try {
      await prisma.registroDiario.upsert({
        where: { id: r.id },
        update: {
          fecha: new Date(r.fecha),
          kmActual: r.kmActual,
          novedades: r.novedades,
          nombreConductor: r.nombreConductor,
          vehiculoId: r.vehiculoId,
          sucursales: {
              set: r.sucursales ? r.sucursales.map(s => ({ id: s.id })) : []
          }
        },
        create: {
          id: r.id,
          fecha: new Date(r.fecha),
          kmActual: r.kmActual,
          novedades: r.novedades,
          nombreConductor: r.nombreConductor,
          vehiculoId: r.vehiculoId,
          sucursales: {
              connect: r.sucursales ? r.sucursales.map(s => ({ id: s.id })) : []
          }
        },
      });
    } catch (e) {
      // console.warn(`⚠️ Error registro ${r.id}: ${e.message}`);
    }
  }

  // 5. Gastos
  console.log(`💸 Sincronizando ${data.gastos.length} gastos...`);
  for (const g of data.gastos) {
    try {
      await prisma.gasto.upsert({
        where: { id: g.id },
        update: {
          fecha: new Date(g.fecha),
          monto: g.monto,
          descripcion: g.descripcion,
          tipo: g.tipo,
          vehiculoId: g.vehiculoId
        },
        create: {
          id: g.id,
          fecha: new Date(g.fecha),
          monto: g.monto,
          descripcion: g.descripcion,
          tipo: g.tipo,
          vehiculoId: g.vehiculoId
        },
      });
    } catch (e) {
        console.warn(`⚠️ Error gasto ${g.id}: ${e.message}`);
    }
  }

  console.log('✅ MIGRACION COMPLETADA EXITOSAMENTE.');
}

migrate()
  .catch(e => {
    console.error('❌ ERROR FATAL EN MIGRACIÓN:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
