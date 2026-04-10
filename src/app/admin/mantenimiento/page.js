import prisma from "@/lib/prisma";
import ControlMantenimientoClient from "./ControlMantenimientoClient";
import { getNovedadesPendientes } from "@/lib/actions";

export default async function ControlMantenimientoPage() {
  const [vehiculos, novedadesRes] = await Promise.all([
    prisma.vehiculo.findMany({
      where: { activo: true },
      orderBy: { patente: 'asc' },
      include: {
        registros: { 
          orderBy: { fecha: 'desc' }, 
          take: 1 
        },
        Mantenimiento: {
          where: { tipoServicio: { contains: 'Cubiertas', mode: 'insensitive' } },
          orderBy: { fecha: 'desc' },
          take: 1
        }
      }
    }),
    getNovedadesPendientes()
  ]);

  const novedades = novedadesRes.success ? novedadesRes.data : [];

  // Calculate days for VTV and Seguro on the server
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const processedVehicles = vehiculos.map(v => {
    let vtvDias = null;
    let seguroDias = null;

    if (v.vtvVencimiento) {
      const vtvDate = new Date(v.vtvVencimiento);
      vtvDate.setHours(0, 0, 0, 0);
      const diffTime = vtvDate - hoy;
      vtvDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (v.seguroVencimiento) {
      const seguroDate = new Date(v.seguroVencimiento);
      seguroDate.setHours(0, 0, 0, 0);
      const diffTime = seguroDate - hoy;
      seguroDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const odometro = v.registros?.[0]?.kmActual || 0;
    const ultimoCambioCubiertas = v.Mantenimiento?.[0];
    let cubiertasEstado = 'Sin Datos';
    if (ultimoCambioCubiertas) {
      const date = new Date(ultimoCambioCubiertas.fecha);
      cubiertasEstado = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }

    // Alerta de Service
    const proxService = v.proximoServiceKm || 0;
    const kmParaService = proxService > 0 ? (proxService - odometro) : null;
    const serviceAlert = kmParaService !== null && kmParaService <= 1000;

    return {
      id: v.id,
      patente: v.patente,
      categoria: v.categoria,
      tipo: v.tipo,
      odometro,
      vtvDias,
      seguroDias,
      cubiertasEstado,
      kmParaService,
      serviceAlert,
      proximoServiceKm: proxService
    };
  });

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-emerald-800 dark:text-emerald-400">Control y Mantenimiento</h1>
        <p className="text-emerald-600 dark:text-emerald-500 font-bold text-sm mt-1">Estado general de la flota, cubiertas y fiesteros</p>
      </div>
      
      <ControlMantenimientoClient vehiculos={processedVehicles} />
    </div>
  );
}
