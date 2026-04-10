export const dynamic = 'force-dynamic';
import { getRangeReport } from "@/lib/actions";
import { format, startOfWeek, endOfWeek, subDays } from "date-fns";
import { es } from "date-fns/locale";
import ShareReportButton from "@/components/ShareReportButton";
import { getArgentinaTodayISO } from "@/lib/dateUtils";

export default async function RangeReportPage({ searchParams }) {
  const params = await searchParams;
  
  // Default to current week (Monday to Saturday as per user request)
  const today = new Date();
  const defaultStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const defaultEnd = getArgentinaTodayISO();

  const startDate = params.start || defaultStart;
  const endDate = params.end || defaultEnd;

  const res = await getRangeReport(startDate, endDate);
  const data = res.success ? res.data : null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase italic text-cyan-500">Reporte Semanal</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Análisis estratégico por rango de fechas</p>
        </div>

        <form className="flex flex-wrap items-center gap-3 bg-[#0f172a] p-3 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 px-3 border-r border-slate-800">
            <label className="text-[9px] font-black uppercase text-gray-500">Desde:</label>
            <input 
              name="start"
              type="date" 
              defaultValue={startDate}
              className="bg-transparent text-xs font-bold outline-none text-white cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 px-3">
            <label className="text-[9px] font-black uppercase text-gray-500">Hasta:</label>
            <input 
              name="end"
              type="date" 
              defaultValue={endDate}
              className="bg-transparent text-xs font-bold outline-none text-white cursor-pointer"
            />
          </div>
          <button type="submit" className="bg-cyan-600 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all ml-auto">Filtrar Rango</button>
        </form>
      </div>

      {!data ? (
        <div className="p-20 border-2 border-dashed border-slate-700 rounded-[3rem] text-center bg-slate-900/20">
          <h2 className="text-slate-500 font-black uppercase tracking-widest">Error al cargar datos</h2>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Dashboard Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">KM Totales Flota</p>
                <h3 className="text-3xl font-black text-white">{data.stats.totalKm.toLocaleString()} <span className="text-sm text-cyan-500">KM</span></h3>
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Visitas Totales</p>
                <h3 className="text-3xl font-black text-white">{data.stats.totalVisits} <span className="text-sm text-emerald-500">Nodos</span></h3>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Unidades Operativas</p>
                <h3 className="text-3xl font-black text-white">{data.stats.uniqueVehicles} <span className="text-sm text-blue-500">Veh.</span></h3>
            </div>
            <div className="flex items-center justify-center">
              <ShareReportButton 
                type="weekly"
                data={{
                  stats: data.stats,
                  range: `${format(new Date(startDate), "dd/MM")} al ${format(new Date(endDate), "dd/MM")}`
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Actividad por Unidad */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] mb-6 border-b border-white/5 pb-4">Rendimiento por Unidad</h3>
                <div className="space-y-4">
                    {data.stats.vehicleBreakdown.sort((a, b) => b.km - a.km).map(v => (
                        <div key={v.patente} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] text-cyan-400 border border-cyan-500/20">{v.patente}</div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase">{v.km.toLocaleString()} KM</p>
                                    <p className="text-[8px] text-slate-500 uppercase font-bold">{v.visits} Visitas</p>
                                </div>
                            </div>
                            <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-600" style={{ width: `${Math.min(100, (v.km / (data.stats.totalKm || 1)) * 300)}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Sucursales */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] mb-6 border-b border-white/5 pb-4">Frecuencia por Sucursal</h3>
                <div className="space-y-3">
                    {Object.entries(data.stats.branchBreakdown)
                      .sort((a, b) => b[1] - a[1])
                      .map(([name, count]) => (
                        <div key={name} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{name}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono font-black text-white">{count}</span>
                                <span className="text-[8px] text-slate-600 uppercase font-bold">Visitas</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
