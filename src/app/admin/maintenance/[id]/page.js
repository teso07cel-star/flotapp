export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import MaintenanceTimelineClient from "@/components/MaintenanceTimelineClient";

export default async function VehicleMaintenancePage({ params }) {
  const vId = parseInt((await params).id);
  if (isNaN(vId)) redirect("/admin/maintenance");

  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id: vId },
    include: {
      mantenimientos: {
         orderBy: { fecha: 'desc' }
      },
      registros: { 
         orderBy: { fecha: 'desc' }, 
         take: 1 
      }
    }
  });

  if (!vehiculo) redirect("/admin/maintenance");

  const kmActual = vehiculo.registros?.[0]?.kmActual || 0;

  return (
    <div className="space-y-6">
      <Link 
         href="/admin/maintenance"
         className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
       >
         <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
         Volver al Tablero General
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-200 dark:border-emerald-900/50 pb-6">
        <div>
          <h1 className="text-3xl font-black text-emerald-900 dark:text-emerald-50 tracking-tight flex items-center gap-3">
             {vehiculo.patente}
             <span className="text-sm px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
               {vehiculo.tipo}
             </span>
          </h1>
          <p className="text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Historia Clínica y Mantenimientos Previos</p>
        </div>
        <div className="text-right bg-white dark:bg-emerald-900/20 px-4 py-2 rounded-xl shadow-inner border border-emerald-50 dark:border-emerald-800">
           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Odómetro Actual</p>
           <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{kmActual.toLocaleString()} <span className="text-sm font-bold">km</span></p>
        </div>
      </div>

      <MaintenanceTimelineClient vehiculo={vehiculo} />
    </div>
  );
}
