export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import InspectionGalleryClient from "@/components/InspectionGalleryClient";

export default async function VehicleInspectionGalleryPage({ params }) {
  const vId = parseInt((await params).id);
  if (isNaN(vId)) redirect("/admin/maintenance");

  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id: vId },
    include: {
      inspecciones: {
         orderBy: { fecha: 'desc' },
         include: { chofer: true }
      }
    }
  });

  if (!vehiculo) redirect("/admin/maintenance");

  return (
    <div className="space-y-6">
      <Link 
         href="/admin/maintenance"
         className="inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-bold hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
       >
         <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
         Volver al Tablero General
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-200 dark:border-amber-900/50 pb-6">
        <div>
          <h1 className="text-3xl font-black text-amber-900 dark:text-amber-50 tracking-tight flex items-center gap-3">
             {vehiculo.patente}
             <span className="text-sm px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
               {vehiculo.tipo}
             </span>
          </h1>
          <p className="text-amber-600 dark:text-amber-400 mt-1 font-medium">Historial de Inspecciones Legales (Externo)</p>
        </div>
      </div>

      <InspectionGalleryClient inspecciones={vehiculo.inspecciones} />
    </div>
  );
}
