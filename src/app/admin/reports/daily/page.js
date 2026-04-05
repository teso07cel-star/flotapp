export const dynamic = 'force-dynamic';
import { getDailyReport } from "@/lib/actions";
import Link from "next/link";
import FormattedDate from "@/components/FormattedDate";
import DeleteLogButton from "@/components/DeleteLogButton";
import ShareReportButton from "@/components/ShareReportButton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function DailyReport({ searchParams }) {
  const params = await searchParams;
  // Usar la fecha actual en la zona horaria del servidor como fallback
  // Nota: Para ser 100% precisos con el usuario, esto podría ser un Client Component,
  // pero por ahora aseguramos que no crashee y use una fecha válida.
  const dateStr = params.date || new Date().toISOString().split('T')[0];
  
  const res = await getDailyReport(dateStr);
  
  if (!res.success) {
      return (
          <div className="p-10 border-2 border-dashed border-red-200 rounded-[2rem] text-center bg-red-50/30">
              <h2 className="text-red-500 font-black uppercase mb-2">Error al cargar reporte</h2>
              <p className="text-xs text-red-500/60 font-medium">{res.error}</p>
          </div>
      );
  }

  const { registros, stats } = res.data;
  const branchEntries = Object.entries(stats.branchBreakdown || {});

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase italic text-blue-600 dark:text-blue-400">Reporte Diario</h1>
          <p className="text-gray-500  font-bold uppercase text-[10px] tracking-widest">Actividad operativa por fecha</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <ShareReportButton 
            title="Reporte Diario FlotApp"
            data={{ 
              stats, 
              date: format(new Date(dateStr + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es }) 
            }}
            type="daily"
          />
        </div>
        
        <form className="flex items-center gap-3 bg-slate-900/40 bg-[#0f172a] p-2 rounded-2xl border border-slate-700  shadow-xl shadow-black/5">
          <label className="pl-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Fecha:</label>
          <input 
            name="date"
            type="date" 
            defaultValue={dateStr}
            className="bg-transparent text-sm font-bold outline-none p-2 border-r border-slate-800/50 "
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all">Ver Día</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-3xl p-6 shadow-xl shadow-black/5">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 text-center md:text-left">Unidades Activas</p>
            <h2 className="text-4xl font-black tracking-tighter text-blue-600 dark:text-blue-400 text-center md:text-left">{stats.uniqueVehicles}</h2>
         </div>
         <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-3xl p-6 shadow-xl shadow-black/5">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 text-center md:text-left">Visitas Totales</p>
            <h2 className="text-4xl font-black tracking-tighter text-blue-600 dark:text-blue-400 text-center md:text-left">{stats.totalVisits}</h2>
         </div>
         <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-3xl p-6 shadow-xl shadow-black/5">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 text-center md:text-left">Kilometraje Total</p>
            <h2 className="text-4xl font-black tracking-tighter text-blue-600 dark:text-blue-400 text-center md:text-left">{(stats.totalKm || 0).toLocaleString()} <span className="text-xs">KM</span></h2>
         </div>
         <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-3xl p-6 shadow-xl shadow-black/5">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 text-center md:text-left">Sucursales Distintas</p>
            <h2 className="text-4xl font-black tracking-tighter text-blue-600 dark:text-blue-400 text-center md:text-left">{Object.keys(stats.branchBreakdown || {}).length}</h2>
         </div>
      </div>

      {/* Breakdown de sucursales */}
      {branchEntries.length > 0 && (
         <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-[2.5rem] p-8 shadow-xl shadow-black/5">
            <h2 className="text-lg font-black uppercase tracking-tighter mb-6 border-b border-slate-800/50  pb-4">Visitas por Sucursal</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {branchEntries.sort((a,b) => b[1] - a[1]).map(([name, count]) => (
                  <div key={name} className="flex flex-col items-center p-4 bg-slate-800/30 /40 rounded-2xl border border-slate-800/50 ">
                     <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest text-center mb-1 truncate w-full">{name}</span>
                     <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{count}</span>
                  </div>
               ))}
            </div>
         </div>
      )}

      <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/30 /50 text-[10px] font-black uppercase text-gray-500  border-b border-slate-700 ">
                <th className="p-6 pl-10">Horario</th>
                <th className="p-6">Vehículo</th>
                <th className="p-6">KM Reales</th>
                <th className="p-6">KM Sugeridos</th>
                <th className="p-6">Conductor</th>
                <th className="p-6">Sucursales Visitadas</th>
                <th className="p-6">Novedades</th>
                <th className="p-6 text-right pr-10">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-sans">
              {registros.length === 0 ? (
                <tr><td colSpan="6" className="p-20 text-center text-gray-400 font-black uppercase tracking-widest">No hubo actividad este día.</td></tr>
              ) : registros.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 dark:hover:bg-gray-800/20 transition-colors group">
                  <td className="p-6 pl-10">
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                        <FormattedDate date={r.fecha} showDate={false} />
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="font-mono font-black text-sm tracking-widest bg-slate-800/50  px-3 py-1 rounded-lg inline-block border border-slate-700 ">{r.vehiculo.patente}</div>
                  </td>
                  <td className="p-6">
                    <div className="font-bold">{(r.kmActual || 0).toLocaleString()}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                       <span className="font-mono text-xs font-black text-blue-500/70">{r.kmTeoricos > 0 ? `${r.kmTeoricos.toLocaleString()} km` : "-"}</span>
                       {r.kmTeoricos > 0 && r.tipoReporte === "PARADA" && (
                          <span className="text-[8px] px-1 bg-slate-800/50  rounded text-gray-500 font-bold uppercase tracking-tighter">Teórico</span>
                       )}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-xs font-black uppercase tracking-tighter text-gray-600 ">{r.nombreConductor || "-"}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-wrap gap-1">
                      {r.sucursales?.map(s => (
                        <span key={s.id} className="text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-black uppercase tracking-tighter border border-blue-100 dark:border-blue-800">
                          {s.nombre}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-6">
                    {r.novedades ? (
                        <span className="text-[10px] font-medium italic text-amber-600 dark:text-amber-400 truncate max-w-[150px] inline-block">{r.novedades}</span>
                    ) : "-"}
                  </td>
                  <td className="p-6 pr-10 text-right">
                    <DeleteLogButton id={r.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
