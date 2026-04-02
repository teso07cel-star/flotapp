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
  const [vRes, rRes] = await Promise.all([
    getAllVehiculos(),
    getUltimosRegistros(10)
  ]);
  
  const vehiculos = vRes.success ? vRes.data : [];
  const registros = rRes.success ? rRes.data : [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">Panel General</h1>
          <p className="text-gray-500 dark:text-gray-400">Resumen de la actividad de tu flota.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/benefits" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-2xl font-black transition-all shadow-xl shadow-white/5 text-[10px] uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 7 3 5-3 5"/><path d="m19 7-3 5 3 5"/></svg>
            Impacto y ROI
          </Link>
          <Link href="/admin/summary" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
            VER RESUMEN MENSUAL
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehículos List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-tight">Flota de Vehículos</h2>
            <Link href="/admin/vehicles/new" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors uppercase tracking-wider">
              + Agregar Vehículo
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-black border-b border-gray-200 dark:border-gray-800">
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
                      <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                        <td className="p-5 pl-8">
                          <div className="flex items-center gap-2">
                             <span className="text-gray-400"><VehicleIcon categoria={v.categoria} className="w-5 h-5"/></span>
                             <div className="font-mono font-black text-lg tracking-wider">{v.patente}</div>
                          </div>
                          {kmActual > 0 && <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 ml-7">{kmActual.toLocaleString()} KM</div>}
                        </td>
                        <td className="p-5">
                          {isRed ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/20 tracking-tighter animate-pulse">
                              Crítico / Vencido
                            </span>
                          ) : isAmber ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 tracking-tighter">
                              Atención Próxima
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 tracking-tighter">
                              Al Día
                            </span>
                          )}
                          <div className="mt-1 flex flex-wrap gap-1">
                             {vtvVencida && <span className="text-[8px] font-bold text-red-600 uppercase">VTV</span>}
                             {!vtvVencida && vtvProxima && <span className="text-[8px] font-bold text-amber-600 uppercase">VTV</span>}
                             {seguroVencido && <span className="text-[8px] font-bold text-red-600 uppercase">Seguro</span>}
                             {!seguroVencido && seguroProximo && <span className="text-[8px] font-bold text-amber-600 uppercase">Seguro</span>}
                             {serviceCritico && <span className="text-[8px] font-bold text-red-600 uppercase">Service</span>}
                             {!serviceCritico && serviceProximo && <span className="text-[8px] font-bold text-amber-600 uppercase">Service</span>}
                          </div>
                        </td>
                        <td className="p-5 pr-8 text-right">
                          <div className="flex items-center justify-end gap-2 text-xs">
                            <Link href={`/admin/vehicles/${v.id}`} className="inline-flex items-center justify-center h-8 px-3 font-bold transition-all rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 hover:bg-black hover:text-white dark:hover:bg-gray-800 shadow-sm uppercase tracking-tighter" title="Ver Expediente">
                              Ficha
                            </Link>
                            <Link href={`/admin/vehicles/${v.id}/expenses`} className="inline-flex items-center justify-center h-8 px-3 font-bold transition-all rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors shadow-sm uppercase tracking-tighter" title="Registrar Gastos">
                              $
                            </Link>
                            <form action={deleteVehiculoAction} className="inline">
                              <input type="hidden" name="id" value={v.id} />
                              <button type="submit" className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Borrar Vehículo">
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
            <h2 className="text-xl font-bold uppercase tracking-tight">Actividad</h2>
            <Link href="/admin/logs" className="text-[10px] font-black text-rose-500 hover:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest flex items-center gap-1">
              Ver Todas (Hoy)
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-2xl shadow-black/5 flex flex-col gap-6">
            {registros.length === 0 ? (
              <p className="text-gray-500 text-center py-4 font-medium italic">Aún no hay registros.</p>
            ) : registros.map((r) => (
              <div key={r.id} className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0 relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <span className="text-gray-400">
                          <VehicleIcon categoria={r.vehiculo.categoria} className="w-4 h-4" />
                       </span>
                       <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400 tracking-wider">
                         {r.vehiculo.patente}
                       </span>
                       {r.tipoReporte && (
                         <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                           r.tipoReporte === 'INICIO' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                           r.tipoReporte === 'CIERRE' ? 'bg-pink-500/10 text-pink-500 border-pink-500/20' :
                           'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                         }`}>
                           {r.tipoReporte}
                         </span>
                       )}
                    </div>
                    {r.lugarGuarda && (
                      <a 
                        href={`https://www.google.com/maps?q=${r.lugarGuarda}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[9px] text-emerald-500 hover:text-emerald-400 transition-colors font-black uppercase tracking-widest"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        Ver Ubicación
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                        <FormattedDate date={r.fecha} showDate={false} />
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        <FormattedDate date={r.fecha} />
                    </div>
                    <DeleteLogButton id={r.id} />
                  </div>
                </div>
                <div className="text-sm font-bold mb-2 flex items-center gap-1">
                  {r.kmActual != null ? (
                    <span className={r.kmModificado ? "text-orange-600 dark:text-orange-400 flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1 rounded-md border border-orange-200 dark:border-orange-800/50" : "flex items-baseline gap-1 text-gray-900 dark:text-white"}>
                      {r.kmActual.toLocaleString()} <span className="text-[10px] opacity-70 font-black uppercase">km</span>
                      {r.kmModificado && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" title="Editado manualmente"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">Viaje Posterior</span>
                  )}
                </div>
                {r.nombreConductor && (
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-tighter mb-2 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {r.nombreConductor}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-2">
                  {r.sucursales?.map(s => (
                    <span key={s.id} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                      {s.nombre}
                    </span>
                  ))}
                </div>
                {r.novedades && (
                  <div className="mt-3 text-[10px] bg-amber-50 dark:bg-amber-500/5 text-amber-900 dark:text-amber-200 p-3 rounded-xl border border-amber-100 dark:border-amber-500/20 leading-relaxed font-medium">
                    <span className="font-black mr-1 uppercase text-[9px]">Aviso:</span>
                    {r.novedades}
                  </div>
                )}
                {/* Visual indicator for photos */}
                {(r.fotoFrente || r.fotoTrasera || r.fotoLateralIzq || r.fotoLateralDer) && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[r.fotoFrente, r.fotoTrasera, r.fotoLateralIzq, r.fotoLateralDer].filter(Boolean).map((foto, idx) => (
                      <a key={idx} href={foto} target="_blank" rel="noreferrer" className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 flex-shrink-0 hover:scale-105 transition-transform">
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
}
