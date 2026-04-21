export const dynamic = 'force-dynamic';
import Link from "next/link";
import { getAllVehiculos, getUltimosRegistros, deleteVehiculo, getDailyReport } from "@/lib/appActions";
import FormattedDate from "@/components/FormattedDate";
import VehicleIcon from "@/components/VehicleIcon";
import DeleteLogButton from "@/components/DeleteLogButton";

async function deleteVehiculoAction(formData) {
  "use server";
  const id = formData.get("id");
  await deleteVehiculo(id);
  const { redirect } = await import("next/navigation");
  redirect("/admin");
}

export default async function AdminDashboard() {
  const [vRes, rRecentRes, rDailyRes] = await Promise.all([
    getAllVehiculos(),
    getUltimosRegistros(10),
    getDailyReport(new Date().toISOString().split('T')[0])
  ]);
  
  const vehiculos = vRes.success ? vRes.data : [];
  const registros = rRecentRes.success ? rRecentRes.data : [];
  const dailyStats = rDailyRes.success ? rDailyRes.data.stats : { uniqueVehicles: 0, totalVisits: 0, totalKm: 0, branchBreakdown: {} };

  return (
    <div className="min-h-screen bg-[#020617] text-white space-y-12 animate-in fade-in duration-1000 relative overflow-hidden">
      {/* HUD Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none -z-20" />

      {/* Header Premium HUD v2.0 */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/10 pb-12 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-6">
             <div className="h-1 w-16 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Orquestador Logístico v3.6</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter mb-4 uppercase italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Centro de <span className="text-blue-500">Mando</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            Protocolo de Visualización Táctica Activo
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
           <Link href="/api/sync" className="bg-slate-900/60 backdrop-blur-2xl px-8 py-4 rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-all group flex flex-col items-center justify-center min-w-[140px]">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 group-hover:animate-pulse">Sincronizar</span>
              <span className="text-xs font-bold uppercase italic text-white/70 group-hover:text-white transition-colors">Data Stream</span>
           </Link>
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

          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl group hover:border-blue-500/50 transition-all duration-500">
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
                    const hoy = new Date();
                    const quinceDias = new Date(hoy.getTime() + (15 * 24 * 60 * 60 * 1000));
                    
                    const vtvVencida = v.vtvVencimiento && new Date(v.vtvVencimiento) < hoy;
                    const vtvProxima = v.vtvVencimiento && new Date(v.vtvVencimiento) <= quinceDias;
                    
                    const seguroVencido = v.seguroVencimiento && new Date(v.seguroVencimiento) < hoy;
                    const seguroProximo = v.seguroVencimiento && new Date(v.seguroVencimiento) <= quinceDias;

                    const kmActual = v.registros?.[0]?.kmActual || 0;
                    const kmParaService = v.proximoServiceKm ? (v.proximoServiceKm - kmActual) : null;
                    
                    const serviceCritico = kmParaService !== null && kmParaService <= 100;
                    const serviceProximo = kmParaService !== null && kmParaService <= 500;

                    const isRed = vtvVencida || seguroVencido || serviceCritico;
                    const isAmber = !isRed && (vtvProxima || seguroProximo || serviceProximo);

                    return (
                      <tr key={v.id} className="hover:bg-white/5 transition-all group border-b border-white/5 last:border-0">
                        <td className="p-8 pl-10">
                          <div className="flex items-center gap-6">
                             <div className="text-blue-500/40 group-hover:text-blue-500 transition-colors drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                               <VehicleIcon categoria={v.categoria} className="w-14 h-12"/>
                             </div>
                             <div>
                                <div className="font-mono font-black text-2xl tracking-widest text-white group-hover:scale-105 transition-transform origin-left drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{v.patente}</div>
                                {kmActual > 0 && <div className="text-[9px] text-blue-500 font-black uppercase mt-1 tracking-widest opacity-60">{kmActual.toLocaleString()} KM REPORTADOS</div>}
                             </div>
                          </div>
                        </td>
                        <td className="p-8 text-sm">
                          {isRed ? (
                            <div className="flex flex-col gap-2">
                               <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20 tracking-[0.2em] animate-pulse">
                                 Fallo Crítico
                               </span>
                            </div>
                          ) : isAmber ? (
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 tracking-[0.2em]">
                              Alerta Preventiva
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 tracking-[0.2em]">
                              Operativo Nominal
                            </span>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                             {vtvVencida && <span className="text-[8px] font-black text-white bg-red-600 px-2 py-0.5 rounded-md uppercase tracking-tighter">VTV Vencida</span>}
                             {seguroVencido && <span className="text-[8px] font-black text-white bg-red-600 px-2 py-0.5 rounded-md uppercase tracking-tighter">Sin Seguro</span>}
                             {serviceCritico && <span className="text-[8px] font-black text-white bg-red-600 px-2 py-0.5 rounded-md uppercase tracking-tighter">Service Urgente</span>}
                          </div>
                        </td>
                        <td className="p-8 pr-10 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link href={`/admin/vehicles/${v.id}`} className="px-6 py-2.5 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95">
                              Expediente
                            </Link>
                            <form action={deleteVehiculoAction}>
                              <input type="hidden" name="id" value={v.id} />
                              <button type="submit" className="p-2.5 text-white/20 hover:text-red-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              </button>
                            </form>
                          </div>
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
            <Link href="/admin/logs" className="text-[9px] font-black text-blue-400 hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
              Historial Completo &rarr;
            </Link>
          </div>
          
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-3xl space-y-8">
            {registros.length === 0 ? (
              <p className="text-slate-600 text-center py-10 font-black uppercase text-[10px] tracking-widest italic">Iniciando recepción de señales...</p>
            ) : registros.map((r) => (
              <div key={r.id} className="relative pl-6 border-l-2 border-blue-500/30 group">
                <div className="absolute top-0 -left-[5px] w-2 h-2 bg-blue-500 rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <p className="font-mono font-black text-sm text-white tracking-widest">{r.vehiculo?.patente || "S/D"}</p>
                    <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{r.nombreConductor || "S/D"}</p>
                  </div>
                  <div className="text-right">
                    <FormattedDate date={r.fecha} showDate={false} className="text-[10px] font-black text-slate-400" />
                    <div className={`text-[7px] font-black px-1.5 py-0.5 mt-1 rounded uppercase tracking-[0.2em] inline-block ${
                      r.tipoReporte === 'INICIO' ? 'bg-cyan-500 text-black' :
                      r.tipoReporte === 'CIERRE' ? 'bg-pink-600 text-white' :
                      'bg-white/10 text-white'
                    }`}>
                      {r.tipoReporte}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-all">
                  <div className="flex items-center justify-between mb-3 text-xs">
                     <span className="font-black text-blue-400">{r.kmActual?.toLocaleString()} <span className="text-[8px] opacity-50">KM</span></span>
                     <DeleteLogButton id={r.id} />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.sucursales?.map(s => (
                      <span key={s.id} className="text-[7px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20 font-black uppercase tracking-tighter">
                        {s.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

