export const dynamic = 'force-dynamic';
import Link from "next/link";
import { getAllVehiculos, getUltimosRegistros, getDailyReport } from "@/lib/appActions";
import FormattedDate from "@/components/FormattedDate";
import VehicleIcon from "@/components/VehicleIcon";
import DeleteLogButton from "@/components/DeleteLogButton";
import { MASTER_VEHICULOS } from "@/lib/constants";

export default async function AdminDashboard() {
  let vehiculos = [];
  let registros = [];
  let dailyStats = { uniqueVehicles: 0, totalVisits: 0, totalKm: 0, branchBreakdown: {} };
  let errorStatus = null;

  try {
    const [vRes, rRecentRes, rDailyRes] = await Promise.all([
      getAllVehiculos(),
      getUltimosRegistros(10),
      getDailyReport(new Date().toISOString().split('T')[0])
    ]);
    
    if (vRes.success) {
      vehiculos = vRes.data;
    } else {
      console.warn("Usando fallback de vehiculos en Dashboard");
      vehiculos = MASTER_VEHICULOS.map((v, i) => ({ ...v, id: 900+i, registros: [] }));
      errorStatus = "FALLBACK_DATA";
    }

    registros = rRecentRes.success ? rRecentRes.data : [];
    dailyStats = rDailyRes.success ? rDailyRes.data.stats : dailyStats;

  } catch (error) {
    console.error("Error crítico en Dashboard Admin:", error);
    vehiculos = MASTER_VEHICULOS.map((v, i) => ({ ...v, id: 900+i, registros: [] }));
    errorStatus = "CRITICAL_FAILURE";
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white space-y-12 animate-in fade-in duration-1000 relative overflow-hidden">
      {/* HUD Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none -z-20" />

      {/* Alerta de Modo Resiliente */}
      {errorStatus && (
        <div className="bg-amber-600/20 border-y border-amber-500/30 py-2 text-center relative z-50">
           <span className="text-[9px] font-black uppercase text-amber-500 tracking-[0.3em] animate-pulse">
             ⚠️ Advertencia: Conexión Inestable | Visualizando Datos Maestro de Respaldo
           </span>
        </div>
      )}

      {/* Header Premium HUD v2.0 */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/10 pb-12 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-6">
             <div className="h-1 w-16 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Orquestador Logístico v3.7 NUCLEAR</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter mb-4 uppercase italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Centro de <span className="text-blue-500">Mando</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            Vigilancia Operativa en Tiempo Real
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
             <Link href="/admin/summary" className="bg-blue-600/20 backdrop-blur-2xl px-10 py-5 rounded-3xl border border-blue-500/30 hover:bg-blue-600/40 transition-all flex flex-col items-center justify-center min-w-[200px] shadow-2xl shadow-blue-500/10">
               <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Métrica Mensual</span>
               <span className="text-xl font-black uppercase italic tracking-widest">El Libro</span>
            </Link>
        </div>
      </div>
      
      {/* Resumen Táctico Hoy */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[3rem] p-10 shadow-3xl shadow-blue-500/20 relative group overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-200/60 text-[10px] font-black uppercase tracking-widest mb-4">Recorrido Hoy</p>
              <h2 className="text-6xl font-black tracking-tighter">{(dailyStats.totalKm || 0).toLocaleString()}</h2>
              <p className="text-white/80 font-bold text-xs uppercase mt-4">Kilómetros Consolidados</p>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Operación Local</p>
            <h2 className="text-6xl font-black tracking-tighter text-white">{dailyStats.totalVisits}</h2>
            <p className="text-blue-500 font-bold text-xs uppercase mt-4">Visitas Cumplidas</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Disponibilidad</p>
            <h2 className="text-6xl font-black tracking-tighter text-white">{dailyStats.uniqueVehicles}</h2>
            <p className="text-emerald-500 font-bold text-xs uppercase mt-4">Unidades en Red</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Eficiencia Hoy</p>
            <h2 className="text-6xl font-black tracking-tighter text-white">{dailyStats.totalVisits > 0 ? (dailyStats.totalKm / dailyStats.totalVisits).toFixed(1) : 0}</h2>
            <p className="text-amber-500 font-bold text-xs uppercase mt-4">KM por Visita</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
        {/* Vehículos List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-white italic border-l-4 border-blue-500 pl-6">Estado de Flota</h2>
            <Link href="/admin/vehicles/new" className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-6 py-3 border border-blue-500/30 rounded-2xl hover:bg-blue-500/20 hover:text-blue-300 transition-all uppercase tracking-widest shadow-xl">
              + Integrar Unidad
            </Link>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] overflow-hidden shadow-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-blue-400 text-[10px] tracking-[0.3em] uppercase font-black border-b border-white/5">
                    <th className="p-8 pl-10">Matrícula Táctica</th>
                    <th className="p-8">Estatus Operativo</th>
                    <th className="p-8 text-right pr-10">Auditoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vehiculos.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-20 text-center text-slate-500 font-black uppercase tracking-widest text-xs">
                        Base de datos vacía - Esperando señal...
                      </td>
                    </tr>
                  ) : vehiculos.map((v) => {
                    const kmActual = v.registros?.[0]?.kmActual || 0;
                    return (
                      <tr key={v.id} className="hover:bg-white/5 transition-all group border-b border-white/5 last:border-0">
                        <td className="p-8 pl-10">
                          <div className="flex items-center gap-6">
                             <div className="text-blue-500/40 group-hover:text-blue-500 transition-colors">
                               <VehicleIcon categoria={v.categoria} className="w-16 h-12"/>
                             </div>
                             <div>
                                <div className="font-mono font-black text-2xl tracking-widest text-white group-hover:scale-105 transition-transform origin-left">{v.patente}</div>
                                <div className="text-[9px] text-blue-500 font-black uppercase mt-1 tracking-widest opacity-60">
                                   {v.modelo || "UNIDAD TÁCTICA"}
                                </div>
                             </div>
                          </div>
                        </td>
                        <td className="p-8 text-sm">
                           <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 tracking-[0.2em]">
                              Operativo Nominal
                           </span>
                           {kmActual > 0 && <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase">{kmActual.toLocaleString()} KM TOTALES</div>}
                        </td>
                        <td className="p-8 pr-10 text-right">
                           <Link href={`/admin/vehicles/${v.id}`} className="px-6 py-2.5 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95">
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

        {/* Actividad Reciente */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white italic">Bitácora Live</h2>
          </div>
          
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-3xl space-y-8">
            {registros.length === 0 ? (
              <p className="text-slate-600 text-center py-10 font-black uppercase text-[10px] tracking-widest italic leading-relaxed px-4">
                Iniciando recepción de señales de alta fidelidad...
              </p>
            ) : registros.map((r) => (
              <div key={r.id} className="relative pl-6 border-l-2 border-blue-500/30 group">
                <div className="absolute top-0 -left-[5px] w-2 h-2 bg-blue-500 rounded-full group-hover:scale-150 transition-transform" />
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <p className="font-mono font-black text-sm text-white tracking-widest">{r.vehiculo?.patente || "S/D"}</p>
                    <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{r.nombreConductor || "S/D"}</p>
                  </div>
                  <FormattedDate date={r.fecha} showDate={false} className="text-[10px] font-black text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
