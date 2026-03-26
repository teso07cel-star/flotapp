import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient({ log: ['info', 'error', 'warn'] })

async function main() {
  const sucursales = [
    { nombre: 'Centro', direccion: 'Av. Principal 123' },
    { nombre: 'Norte', direccion: 'Ruta 9 Km 50' },
    { nombre: 'Sur', direccion: 'Av. San Martín 456' }
  ]

  console.log('Seeding branches...')
  for (const s of sucursales) {
    await prisma.sucursal.upsert({
      where: { id: sucursales.indexOf(s) + 1 },
      update: s,
      create: s,
    })
  }

  console.log('Seeding test vehicle...')
  await prisma.vehiculo.upsert({
    where: { patente: 'AB123CD' },
    update: {},
    create: {
      patente: 'AB123CD',
      vtvVencimiento: new Date('2026-12-31'),
      seguroVencimiento: new Date('2026-11-30'),
      proximoServiceKm: 50000,
    },
  })

  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
