import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const choferes = await prisma.chofer.findMany()
  console.log('Choferes:', choferes)
  const vehiculos = await prisma.vehiculo.findMany()
  console.log('Vehiculos:', vehiculos)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
