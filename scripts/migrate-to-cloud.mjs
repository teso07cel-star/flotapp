import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const baseUrls = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const FALLBACK_URL = "postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require";

const connectionString = baseUrls || FALLBACK_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DB_PATH = path.join(process.cwd(), 'data.json');

async function migrate() {
  try {
    const dataStr = await fs.readFile(DB_PATH, 'utf-8');
    const data = JSON.parse(dataStr);

    console.log("Migrando sucursales...");
    for (const s of data.sucursales) {
      await prisma.sucursal.upsert({
        where: { id: s.id },
        update: { nombre: s.nombre, direccion: s.direccion },
        create: { id: s.id, nombre: s.nombre, direccion: s.direccion },
      });
    }

    console.log("Migrando vehículos...");
    for (const v of data.vehiculos) {
      await prisma.vehiculo.upsert({
        where: { id: v.id },
        update: {
          patente: v.patente,
          vtvVencimiento: v.vtvVencimiento ? new Date(v.vtvVencimiento) : null,
          seguroVencimiento: v.seguroVencimiento ? new Date(v.seguroVencimiento) : null,
          proximoServiceKm: v.proximoServiceKm,
          activo: v.activo
        },
        create: {
          id: v.id,
          patente: v.patente,
          vtvVencimiento: v.vtvVencimiento ? new Date(v.vtvVencimiento) : null,
          seguroVencimiento: v.seguroVencimiento ? new Date(v.seguroVencimiento) : null,
          proximoServiceKm: v.proximoServiceKm,
          activo: v.activo
        },
      });
    }

    console.log("Migrando registros...");
    for (const r of data.registros) {
      await prisma.registroDiario.upsert({
        where: { id: r.id },
        update: {
          fecha: new Date(r.fecha),
          kmActual: r.kmActual,
          novedades: r.novedades,
          nombreConductor: r.nombreConductor,
          vehiculoId: r.vehiculoId,
        },
        create: {
          id: r.id,
          fecha: new Date(r.fecha),
          kmActual: r.kmActual,
          novedades: r.novedades,
          nombreConductor: r.nombreConductor,
          vehiculoId: r.vehiculoId,
        },
      });
      
      // Connect branches if they exist
      if (r.sucursalIds && r.sucursalIds.length > 0) {
        await prisma.registroDiario.update({
          where: { id: r.id },
          data: {
            sucursales: {
              connect: r.sucursalIds.map(id => ({ id }))
            }
          }
        });
      }
    }

    console.log("Migrando gastos...");
    for (const g of data.gastos) {
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
    }

    console.log("Migración completada con éxito.");
  } catch (error) {
    console.error("Error en la migración:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
