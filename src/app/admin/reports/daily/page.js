export const dynamic = 'force-dynamic';
import { getDailyReport } from "@/lib/appActions";
import Link from "next/link";
import FormattedDate from "@/components/FormattedDate";
import DeleteLogButton from "@/components/DeleteLogButton";
import ShareReportButton from "@/components/ShareReportButton";
import PrintButton from "@/components/PrintButton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function DailyReport({ searchParams }) {
  try {
    const params = await searchParams;
    const dateStr = params.date || new Date().toISOString().split('T')[0];
    
    const res = await getDailyReport(dateStr);
    
    if (!res || !res.success) {
        return (
            <div className="p-10 border-2 border-dashed border-red-200 rounded-[2rem] text-center bg-red-50/30">
                <h2 className="text-red-500 font-black uppercase mb-2">Error Crítico al cargar reporte</h2>
                <p className="text-xs text-red-500/60 font-medium">{res?.error || "Error desconocido de base de datos"}</p>
            </div>
        );
    }

    const { registros, stats } = res.data || { registros: [], stats: {} };
    const registrosList = Array.isArray(registros) ? registros : [];
    const branchEntries = Object.entries(stats?.branchBreakdown || {});

    // Formateo de fecha seguro para el ShareButton
    let safeFormattedDate = "Fecha No Definida";
    try {
      safeFormattedDate = format(new Date(dateStr + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es });
    } catch (e) {
      console.warn("Fallo en formateo de fecha diaria:", e);
    }

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase italic text-blue-600 dark:text-blue-400">Jornada <span className="text-slate-400">TÁCTICA v2.0</span></h1>
            <p className="text-gray-500  font-bold uppercase text-[10px] tracking-widest">Auditoría Operativa para Señor X</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <PrintButton />
            <ShareReportButton 
              title="Auditoría v2.0"
              data={{ 
                stats: stats || {}, 
                date: safeFormattedDate
              }}
              type="daily"
            />
          </div>
          
          <form className="flex items-center gap-3 bg-slate-900/40 bg-[#0f172a] p-2 rounded-2xl border border-slate-700  shadow-xl shadow-black/5">
            <label className="pl-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Calendario:</label>
            <input 
              name="date"
              type="date" 
              defaultValue={dateStr}
              className="bg-transparent text-sm font-bold outline-none p-2 border-r border-slate-800/50 "
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all">Sincronizar</button>
          </form>
        </div>

        {/* SECCIÓN LIBRITO (ACORDEÓN POR CONDUCTOR) */}
        <div className="space-y-6">
           <h2 className="text-xs font-black uppercase tracking-[0.4em] text-blue-500 mb-4 border-l-4 border-blue-600 pl-4">Historial por Conductor (Escudo v2.0)</h2>
           {Object.entries(registrosList.reduce((acc, r) => {
              const name = r.nombreConductor || "Sin Asignar";
              if (!acc[name]) acc[name] = [];
              acc[name].push(r);
              return acc;
           }, {})).map(([chofer, logs]) => (
              <details key={chofer} className="group bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500">
                 <summary className="flex items-center justify-between p-8 cursor-pointer hover:bg-white/5 list-none">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center font-black text-xl border border-blue-500/20">
                          {chofer.charAt(0)}
                       </div>
                       <div>
                          <h3 className="text-xl font-black uppercase tracking-tight text-white">{chofer}</h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{logs.length} Operaciones registradas</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="bg-slate-800 text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-tighter text-slate-400 group-open:hidden">Ver Actividad</span>
                       <svg className="w-6 h-6 text-slate-600 transform transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                 </summary>
                 <div className="p-8 pt-0 space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                       {logs.map((L, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-white/5 gap-4">
                             <div className="flex items-center gap-4">
                                <span className="font-mono text-xs font-black text-blue-400 bg-blue-400/5 px-3 py-1 rounded-lg border border-blue-400/10">{L.vehiculo?.patente || "S/D"}</span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{L.tipoReporte}</span>
                                <span className="text-[10px] font-bold text-slate-500"><FormattedDate date={L.fecha} showDate={false} /></span>
                             </div>
                             <div className="flex items-center gap-6">
                                <div className="text-right">
                                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">KM Reportado</p>
                                   <p className="text-sm font-black text-white">{(Number(L.kmActual) || 0).toLocaleString()} KM</p>
                                </div>
                                <div className="h-8 w-px bg-white/5" />
                                <div className="flex items-center gap-1">
                                   {L.sucursales?.map(s => (
                                      <span key={s.id} className="text-[8px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-black uppercase">{s.nombre}</span>
                                   ))}
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </details>
           ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-3xl p-6 shadow-xl shadow-black/5">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 text-center md:text-left">Unidades Activas</p>
              <h2 className="text-4xl font-black tracking-tighter text-blue-600 dark:text-blue-400 text-center md:text-left">{stats?.uniqueVehicles || 0}</h2>
           </div>
           <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-3xl p-6 shadow-xl shadow-black/5">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 text-center md:text-left">Visitas Totales</p>
              <h2 className="text-4xl font-black tracking-tighter text-blue-600 dark:text-blue-400 text-center md:text-left">{stats?.totalVisits || 0}</h2>
           </div>
           <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-3xl p-6 shadow-xl shadow-black/5">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 text-center md:text-left">Kilometraje Total</p>
              <h2 className="text-4xl font-black tracking-tighter text-blue-600 dark:text-blue-400 text-center md:text-left">{(stats?.totalKm || 0).toLocaleString()} <span className="text-xs">KM</span></h2>
           </div>
           <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-3xl p-6 shadow-xl shadow-black/5">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 text-center md:text-left">Sucursales Distintas</p>
              <h2 className="text-4xl font-black tracking-tighter text-blue-600 dark:text-blue-400 text-center md:text-left">{Object.keys(stats?.branchBreakdown || {}).length}</h2>
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
                {registrosList.length === 0 ? (
                  <tr><td colSpan="6" className="p-20 text-center text-gray-400 font-black uppercase tracking-widest">No hubo actividad este día.</td></tr>
                ) : registrosList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 dark:hover:bg-gray-800/20 transition-colors group">
                    <td className="p-6 pl-10">
                      <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                          <FormattedDate date={r.fecha} showDate={false} />
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-mono font-black text-sm tracking-widest bg-slate-800/50  px-3 py-1 rounded-lg inline-block border border-slate-700 ">{r.vehiculo?.patente || 'S/D'}</div>
                    </td>
                    <td className="p-6">
                      <div className="font-bold">{(Number(r.kmActual) || 0).toLocaleString()}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                         <span className="font-mono text-xs font-black text-blue-500/70">{Number(r.kmTeoricos) > 0 ? `${Number(r.kmTeoricos).toLocaleString()} km` : "-"}</span>
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
  } catch (error) {
    console.error("CRASH FATAL EN REPORTE DIARIO:", error);
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="bg-slate-950 border-2 border-dashed border-blue-500/50 rounded-[3rem] p-16 max-w-2xl w-full text-center shadow-2xl">
           <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">REPORTE BLOQUEADO</h2>
           <p className="text-blue-400 font-bold uppercase text-[10px] tracking-widest mb-8">Señor X, fallo detectado en la capa de auditoría</p>
           <div className="bg-black/50 p-6 rounded-2xl text-left border border-white/5 mb-8">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-2">Error de Auditoría:</p>
              <code className="text-blue-300 font-mono text-xs break-all">{error.message || "Excepción crítica de servidor"}</code>
           </div>
           <Link href="/admin" className="inline-block bg-blue-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
             Reintentar Acceso
           </Link>
        </div>
      </div>
    );
  }
}
