import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient({ log: ['query'] });

async function main() {
  console.log("Creando vehículo externo de prueba...");
  
  let vehiculo = await prisma.vehiculo.findUnique({ where: { patente: 'EXT999' } });
  
  if (!vehiculo) {
    vehiculo = await prisma.vehiculo.create({
      data: {
        patente: 'EXT999',
        categoria: 'PICKUP',
        tipo: 'EXTERNO',
        activo: true,
        vtvVencimiento: new Date('2026-12-01'),
        seguroVencimiento: new Date('2026-10-15')
      }
    });

    const hoy = new Date();
    
    // Crear Inspeccion Mensual (Auditoria / Control)
    console.log("Creando Inspección Mensual...");
    await prisma.inspeccionMensual.create({
      data: {
        vehiculoId: vehiculo.id,
        nombreConductor: 'Carlos Tercerizado',
        mes: hoy.getMonth() + 1,
        anio: hoy.getFullYear(),
        fotoFrente: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&h=200&fit=crop',
        fotoTrasera: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200&h=200&fit=crop',
        fotoLateralIzq: 'https://images.unsplash.com/photo-1502877338535-34cb0f4abc04?w=200&h=200&fit=crop',
        fotoLateralDer: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=200&fit=crop',
        fotoVTV: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&h=200&fit=crop', // Fake Document
        fotoSeguro: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200&h=200&fit=crop', // Fake Document
        lugarGuardaFijo: 'NO',
        lugarGuardaResguardo: 'Galpón Sur - Moreno 1234'
      }
    });

    console.log("Creando Registro Diario (Ticket)...");
    await prisma.registroDiario.create({
      data: {
        vehiculoId: vehiculo.id,
        nombreConductor: 'Carlos Tercerizado',
        esExterno: true,
        frecuenciaRegistro: 'mensual',
        kmActual: 145000,
        nivelCombustible: 'si',
        montoCombustible: 25000,
        fotoTicketCombustible: 'https://images.unsplash.com/photo-1604719312566-8faee495e4ae?w=200&h=200&fit=crop', // Fake receipt
        lugarGuarda: 'Galpón Sur'
      }
    });
    
    console.log("Mock data creada con éxito. Patente: EXT999");
  } else {
    console.log("El vehículo de prueba EXT999 ya existe.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
