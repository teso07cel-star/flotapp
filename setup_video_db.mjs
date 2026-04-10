import prisma from './src/lib/prisma.js';

async function main() {
  console.log("Reiniciando db para videos...");

  // Limpiar para asegurar estado limpio
  await prisma.registroDiario.deleteMany({});
  await prisma.inspeccionMensual.deleteMany({});
  await prisma.vehiculo.deleteMany({
    where: { patente: { in: ['EXT01', 'EXT02', 'EXT03', 'EXT04', 'INT01'] } }
  });

  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();

  // EXT01: Para Mensual. No necesita registros previos, se creará solo al entrar.

  // EXT02: Para Semanal. Necesita Inspeccion Mensual de este mes, pero ningún RegistroDiario esta semana.
  const ext02 = await prisma.vehiculo.create({
    data: { patente: 'EXT02', activo: true, categoria: 'AUTO', tipo: 'EXTERNO' }
  });
  await prisma.inspeccionMensual.create({
    data: {
      vehiculoId: ext02.id, nombreConductor: 'Carlos', mes: mesActual, anio: anioActual,
      fotoFrente: 'dummy', fotoTrasera: 'dummy', fotoLateralIzq: 'dummy', fotoLateralDer: 'dummy',
      fotoVTV: 'dummy', fotoSeguro: 'dummy', lugarGuardaFijo: 'SI', lugarGuardaResguardo: 'Base'
    }
  });
  // (No creamos RegistroDiario, así que la app pedirá Semanal)

  // EXT03: Para Diario Inicio. Necesita Mensual este mes, y al menos un Registro Diario esta semana pero NO HOY.
  let fechaSemanaPasada = new Date(hoy);
  fechaSemanaPasada.setDate(hoy.getDate() - 2); // hace 2 dias seguro es esta semana, pero no hoy. O mejor, vamos a forzar que sea "semana pasada" pero que sí haya algo esta semana..
  // Wait, the logic for Weekly is: "si no hay registro con KM esta semana".
  // So I'll create a RegistroDiario from yesterday (which should be in the current week).
  const ext03 = await prisma.vehiculo.create({
    data: { patente: 'EXT03', activo: true, categoria: 'AUTO', tipo: 'EXTERNO' }
  });
  await prisma.inspeccionMensual.create({
    data: {
      vehiculoId: ext03.id, nombreConductor: 'Carlos', mes: mesActual, anio: anioActual,
      fotoFrente: 'dummy', fotoTrasera: 'dummy', fotoLateralIzq: 'dummy', fotoLateralDer: 'dummy',
      fotoVTV: 'dummy', fotoSeguro: 'dummy', lugarGuardaFijo: 'SI', lugarGuardaResguardo: 'Base'
    }
  });
  await prisma.registroDiario.create({
    data: {
      vehiculoId: ext03.id, esExterno: true, nombreConductor: 'Carlos', frecuenciaRegistro: 'diario_inicio',
      kmActual: 1000, tipoReporte: 'INICIO', fecha: new Date(hoy.getTime() - 24*60*60*1000) // Ayer
    }
  });

  // EXT04: Para Diario Cierre. Necesita inicio HOY.
  const ext04 = await prisma.vehiculo.create({
    data: { patente: 'EXT04', activo: true, categoria: 'AUTO', tipo: 'EXTERNO' }
  });
  await prisma.inspeccionMensual.create({
    data: {
      vehiculoId: ext04.id, nombreConductor: 'Carlos', mes: mesActual, anio: anioActual,
      fotoFrente: 'dummy', fotoTrasera: 'dummy', fotoLateralIzq: 'dummy', fotoLateralDer: 'dummy',
      fotoVTV: 'dummy', fotoSeguro: 'dummy', lugarGuardaFijo: 'SI', lugarGuardaResguardo: 'Base'
    }
  });
  await prisma.registroDiario.create({
    data: {
      vehiculoId: ext04.id, esExterno: true, nombreConductor: 'Carlos', frecuenciaRegistro: 'diario_inicio',
      kmActual: 2000, tipoReporte: 'INICIO', fecha: hoy
    }
  });

  // INT01: Internal driver. Conductor 'VideoTest'.
  await prisma.chofer.deleteMany({ where: { nombre: 'VideoTest' } });
  await prisma.chofer.create({
    data: { nombre: 'VideoTest', activo: true }
  });
  const int01 = await prisma.vehiculo.create({
    data: { patente: 'INT01', activo: true, categoria: 'AUTO', tipo: 'INTERNO' }
  });
  await prisma.registroDiario.create({
    data: {
      vehiculoId: int01.id, esExterno: false, nombreConductor: 'VideoTest', frecuenciaRegistro: 'diario_inicio',
      kmActual: 50000, tipoReporte: 'CIERRE', fecha: new Date(hoy.getTime() - 24*60*60*1000)
    }
  });

  console.log("Ready!");
}
main().catch(console.error).finally(()=>prisma.$disconnect());
