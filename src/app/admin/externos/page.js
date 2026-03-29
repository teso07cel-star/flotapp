export const dynamic = 'force-dynamic';
import Link from "next/link";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import FormattedDate from "@/components/FormattedDate";

export default async function ExternalAdmin() {
  const vehiculos = await prisma.vehiculo.findMany({
    where: { tipo: "EXTERNO" },
    orderBy: { patente: 'asc' },
    include: {
      registros: { 
        orderBy: { fecha: 'desc' }, 
        take: 5 
      },
      InspeccionMensual: {
        orderBy: { fecha: 'desc' },
        take: 1
      }
    }
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">Conductores Externos</h1>
        <p className="text-gray-500 dark:text-gray-400">Panel de control de terceros y vehículos externos.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-black border-b border-gray-200 dark:border-gray-800">
                <th className="p-5 pl-8">Patente</th>
                <th className="p-5">Última Inspección</th>
                <th className="p-5">Última Actividad</th>
                <th className="p-5 text-right pr-8">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {vehiculos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500 font-medium">No hay vehículos externos registrados aún.</td>
                </tr>
              ) : vehiculos.map((v) => {
                const insp = v.InspeccionMensual?.[0];
                const lastLog = v.registros?.[0];
                return (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                    <td className="p-5 pl-8">
                      <div className="font-mono font-black text-lg tracking-wider text-purple-600 dark:text-purple-400">{v.patente}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{v.categoria}</div>
                    </td>
                    <td className="p-5">
                      {insp ? (
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Mes: {insp.mes}/{insp.anio}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{insp.nombreConductor || 'S/D'}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded-md uppercase font-black tracking-widest">Falta Inspección</span>
                      )}
                    </td>
                    <td className="p-5">
                      {lastLog ? (
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                            <FormattedDate date={lastLog.fecha} />
                          </p>
                          <div className="flex gap-1 mt-1">
                             <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 rounded-md font-bold uppercase text-gray-500">{lastLog.frecuenciaRegistro || 'diario'}</span>
                             {lastLog.kmActual && <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 rounded-md">{lastLog.kmActual} km</span>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin registros</span>
                      )}
                    </td>
                    <td className="p-5 pr-8 text-right">
                       <Link href={`/admin/vehicles/${v.id}`} className="inline-flex py-2 px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800 hover:bg-black hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                         Expediente
                       </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
