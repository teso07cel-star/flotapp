export const dynamic = 'force-dynamic';
import Link from "next/link";
import { getAllVehiculos, getUltimosRegistros, deleteVehiculo } from "@/lib/actions";
import { revalidatePath } from "next/cache";
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
  try {
    const [vRes, rRes] = await Promise.all([
      getAllVehiculos(),
      getUltimosRegistros(10)
    ]);
    
    if (!vRes.success) throw new Error("Vehiculos: " + vRes.error);
    if (!rRes.success) throw new Error("Registros: " + rRes.error);

    const vehiculos = vRes.data || [];
    const registros = rRes.data || [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-widest mb-2 uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Panel General</h1>
          <p className="text-blue-400 font-bold tracking-[0.2em] uppercase text-xs">Centro de Monitoreo Táctico</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/benefits" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white hover:bg-slate-700 border border-slate-600 rounded-2xl font-black transition-all shadow-lg text-[10px] uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 7 3 5-3 5"/><path d="m19 7-3 5 3 5"/></svg>
            Impacto y ROI
          </Link>
          <Link href="/admin/summary" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/40 text-blue-300 hover:text-white rounded-2xl font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] text-[10px] uppercase tracking-widest backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
            VER RESUMEN MENSUAL
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehículos List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-200">Flota de Vehículos</h2>
            <Link href="/admin/vehicles/new" className="text-xs font-bold text-blue-400 bg-blue-500/10 px-4 py-2 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 hover:text-blue-300 transition-colors uppercase tracking-wider">
              + Agregar Vehículo
            </Link>
          </div>

          <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-blue-500/30 rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-500/10 text-blue-300 text-[10px] tracking-[0.2em] uppercase font-black border-b border-blue-500/20">
                    <th className="p-5 pl-8">Patente</th>
                    <th className="p-5">Estado</th>
                    <th className="p-5 text-right pr-8">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {vehiculos.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-10 text-center text-gray-500 font-medium">
                        No hay vehículos registrados.
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
                      <tr key={v.id} className="hover:bg-blue-500/5 transition-colors group border-b border-blue-500/10 last:border-0">
                        <td className="p-5 pl-8">
                          <div className="flex items-center gap-3">
                             <span className="text-blue-400 opacity-60 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]"><VehicleIcon categoria={v.categoria} className="w-12 h-10"/></span>
                             <div className="font-mono font-black text-lg tracking-widest text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{v.patente}</div>
                          </div>
                          {kmActual > 0 && <div className="text-[10px] text-blue-300/60 font-bold uppercase mt-1 ml-9">{kmActual.toLocaleString()} KM</div>}
                        </td>
                        <td className="p-5">
                          {isRed ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/30 tracking-widest animate-pulse shadow-[0_0_10px_rgba(248,113,113,0.2)]">
                              Crítico / Vencido
                            </span>
                          ) : isAmber ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 tracking-widest">
                              Atención Próxima
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 tracking-widest pb-[0.2rem]">
                              Al Día
                            </span>
                          )}
                          <div className="mt-1.5 flex flex-wrap gap-1">
                             {vtvVencida && <span className="text-[8px] font-bold text-red-400 bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20 uppercase">VTV</span>}
                             {!vtvVencida && vtvProxima && <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 uppercase">VTV</span>}
                             {seguroVencido && <span className="text-[8px] font-bold text-red-400 bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20 uppercase">Seguro</span>}
                             {!seguroVencido && seguroProximo && <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 uppercase">Seguro</span>}
                             {serviceCritico && <span className="text-[8px] font-bold text-red-400 bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20 uppercase">Service</span>}
                             {!serviceCritico && serviceProximo && <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 uppercase">Service</span>}
                          </div>
                        </td>
                        <td className="p-5 pr-8 text-right">
                          <div className="flex items-center justify-end gap-2 text-xs">
                            <Link href={`/admin/vehicles/${v.id}`} className="inline-flex items-center justify-center h-8 px-3 font-bold transition-all rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500 hover:text-white shadow-sm uppercase tracking-tighter" title="Ver Expediente">
                              Ficha
                            </Link>
                            <Link href={`/admin/vehicles/${v.id}/expenses`} className="inline-flex items-center justify-center h-8 px-3 font-bold transition-all rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-slate-900 shadow-sm uppercase tracking-tighter" title="Registrar Gastos">
                              $
                            </Link>
                            <form action={deleteVehiculoAction} className="inline">
                              <input type="hidden" name="id" value={v.id} />
                              <button type="submit" className="h-8 w-8 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-transparent hover:border-red-400 border border-red-500/20 bg-red-500/10" title="Borrar Vehículo">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
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

        {/* Ultimos Registros */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-200">Actividad</h2>
            <Link href="/admin/logs" className="text-[10px] font-black text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/30 px-4 py-2 rounded-xl transition-colors uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
              Tracker Operativo
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
          
          <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-blue-500/30 rounded-[2rem] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-6">
            {registros.length === 0 ? (
              <p className="text-blue-400/50 text-center py-4 font-bold tracking-widest uppercase text-xs">Sin actividad reciente.</p>
            ) : registros.map((r) => (
              <div key={r.id} className="pb-6 border-b border-blue-500/10 last:border-0 last:pb-0 relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400/60">
                           <VehicleIcon categoria={r.vehiculo?.categoria || 'UNKNOWN'} className="w-10 h-8" />
                        </span>
                        <span className="font-mono text-sm font-black text-cyan-400 tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                          {r.vehiculo?.patente || 'S/V'}
                        </span>
                       {r.tipoReporte && (
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                           r.tipoReporte === 'INICIO' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                           r.tipoReporte === 'CIERRE' ? 'bg-pink-500/10 text-pink-400 border-pink-500/30' :
                           'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                         }`}>
                           {r.tipoReporte}
                         </span>
                       )}
                       {r.lugarGuarda && (
                        <a 
                          href={`https://www.google.com/maps?q=${r.lugarGuarda}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="ml-auto text-[8px] text-emerald-500 hover:text-emerald-400 transition-colors font-black uppercase tracking-widest flex items-center gap-1 opacity-60 hover:opacity-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          GPS
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <div className="font-bold text-blue-400 text-sm tracking-widest drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
                          <FormattedDate date={r.fecha} showDate={false} />
                      </div>
                    </div>
                    <DeleteLogButton id={r.id} />
                  </div>
                </div>
                <div className="text-sm font-bold mb-2 flex items-center gap-1">
                  {r.kmActual != null ? (
                    <span className={r.kmModificado ? "text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]" : "flex items-baseline gap-1 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] tracking-widest"}>
                      {r.kmActual.toLocaleString()} <span className="text-[10px] text-blue-300/50 font-black uppercase">km</span>
                      {r.kmModificado && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" title="Editado manualmente"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      )}
                    </span>
                  ) : (
                    <span className="text-blue-300/50 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">Viaje Posterior</span>
                  )}
                </div>
                {r.nombreConductor && (
                  <div className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5 opacity-80">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {r.nombreConductor}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-2">
                  {r.sucursales?.map(s => (
                    <span key={s.id} className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-cyan-400 px-2 py-1 rounded-md font-black uppercase tracking-[0.2em]">
                      {s.nombre}
                    </span>
                  ))}
                </div>
                {r.novedades && (
                  <div className="mt-3 text-[10px] bg-pink-500/5 text-pink-300 p-3 rounded-xl border border-pink-500/20 leading-relaxed font-bold tracking-wide">
                    <span className="font-black mr-2 uppercase text-[9px] text-pink-400">INFO TÁCTICA:</span>
                    {r.novedades}
                  </div>
                )}
                {/* Visual indicator for photos */}
                {(r.fotoFrente || r.fotoTrasera || r.fotoLateralIzq || r.fotoLateralDer) && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {[r.fotoFrente, r.fotoTrasera, r.fotoLateralIzq, r.fotoLateralDer].filter(Boolean).map((foto, idx) => (
                      <a key={idx} href={foto} target="_blank" rel="noreferrer" className="relative w-16 h-16 rounded-xl overflow-hidden border border-blue-500/30 flex-shrink-0 hover:scale-110 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all">
                        <img src={foto} className="w-full h-full object-cover" alt="Inspección" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error("CRITICAL ADMIN ERROR:", error);
    return (
      <div className="p-10 bg-red-950/20 border border-red-500 rounded-3xl text-red-500">
        <h1 className="text-2xl font-black mb-4 uppercase">Error de Sistema Táctico</h1>
        <p className="font-mono text-xs bg-black/50 p-4 rounded-xl mb-4">{error.message}</p>
        <pre className="text-[10px] opacity-70 overflow-auto">{error.stack}</pre>
        <div className="mt-6">
           <a href="/api/debug-db" className="text-blue-400 underline uppercase text-xs font-black">Revisar Conexión de Base de Datos</a>
        </div>
      </div>
    );
  }
}
