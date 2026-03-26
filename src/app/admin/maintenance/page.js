export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import MaintenanceDashboardClient from "@/components/MaintenanceDashboardClient";

export default async function MaintenancePage() {
  const vehiculos = await prisma.vehiculo.findMany({
    orderBy: { patente: 'asc' },
    include: {
      registros: { 
        orderBy: { fecha: 'desc' }, 
        take: 1 
      },
      inspecciones: {
        orderBy: { fecha: 'desc' },
        take: 1
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-emerald-900 dark:text-emerald-50 tracking-tight">Control y Mantenimiento</h1>
          <p className="text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Estado general de la flota, cubiertas y fleteros</p>
        </div>
      </div>

      <MaintenanceDashboardClient vehiculos={vehiculos} />
    </div>
  );
}
