export const dynamic = 'force-dynamic';
import Link from "next/link";
import { getAllVehiculos, getUltimosRegistros, deleteVehiculo, deleteRegistroDiario } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import FormattedDate from "@/components/FormattedDate";
import AutoRefresh from "@/components/AutoRefresh";


async function deleteVehiculoAction(formData) {
  "use server";
  const id = formData.get("id");
  await deleteVehiculo(id);
  const { redirect } = await import("next/navigation");
  redirect("/admin");
}

async function deleteRegistroAction(formData) {
  "use server";
  const id = formData.get("id");
  await deleteRegistroDiario(id);
  const { redirect } = await import("next/navigation");
  redirect("/admin");
}

async function resolverNovedadAction(formData) {
  "use server";
  const id = formData.get("id");
  const resolucion = formData.get("resolucion");
  const { resolverNovedad } = await import("@/lib/actions");
  await resolverNovedad(id, resolucion);
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin");
}

export default async function AdminDashboard() {
  const [vRes, rRes] = await Promise.all([
    getAllVehiculos(),
    getUltimosRegistros(10)
  ]);
  
  const vehiculos = vRes.success ? vRes.data : [];
  const registros = rRes.success ? rRes.data : [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 dark bg-gray-950 min-h-screen p-8 text-white">
      <AutoRefresh interval={15000} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase italic text-blue-400">Panel General</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Control Operativo de Flota</p>
        </div>
        <Link href="/admin/summary" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
          VER RESUMEN MENSUAL
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehículos List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-tight">Flota de Vehículos</h2>
            <div className="flex gap-4">
              <Link href="/admin/choferes" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors uppercase tracking-wider">
                👥 Gestionar Choferes
              </Link>
              <Link href="/admin/vehicles/new" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors uppercase tracking-wider">
                + Agregar Vehículo
              </Link>
            </div>

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
                    const treintaDias = new Date(hoy.getTime() + (30 * 24 * 60 * 60 * 1000));
                    
                    const vtvVencida = v.vtvVencimiento && new Date(v.vtvVencimiento) < hoy;
                    const vtvProxima = v.vtvVencimiento && new Date(v.vtvVencimiento) <= quinceDias;
                    const vtvAviso = v.vtvVencimiento && new Date(v.vtvVencimiento) <= treintaDias;
                    
                    const seguroVencido = v.seguroVencimiento && new Date(v.seguroVencimiento) < hoy;
                    const seguroProximo = v.seguroVencimiento && new Date(v.seguroVencimiento) <= quinceDias;
                    const seguroAviso = v.seguroVencimiento && new Date(v.seguroVencimiento) <= treintaDias;

                    const kmActual = v.registros?.[0]?.kmActual || 0;
                    
                    const kmParaService = v.proximoServiceKm ? (v.proximoServiceKm - kmActual) : null;
                    const serviceCritico = kmParaService !== null && kmParaService <= 0;
                    const serviceProximo = kmParaService !== null && kmParaService <= 500;
                    const serviceAviso = kmParaService !== null && kmParaService <= 1000;

                    const kmParaCubiertas = v.proximoCambioCubiertasKm ? (v.proximoCambioCubiertasKm - kmActual) : null;
                    const cubiertasCritico = kmParaCubiertas !== null && kmParaCubiertas <= 0;
                    const cubiertasProximo = kmParaCubiertas !== null && kmParaCubiertas <= 2000;
                    const cubiertasAviso = kmParaCubiertas !== null && kmParaCubiertas <= 5000;

                    const isRed = vtvVencida || seguroVencido || serviceCritico || cubiertasCritico;
                    const isAmber = !isRed && (vtvProxima || seguroProximo || serviceProximo || cubiertasProximo);
                    const isYellow = !isRed && !isAmber && (vtvAviso || seguroAviso || serviceAviso || cubiertasAviso);

                    return (
                      <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                        <td className="p-5 pl-8">
                          <div className="font-mono font-black text-lg tracking-wider text-gray-900 dark:text-white">{v.patente}</div>
                          {kmActual > 0 && <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{kmActual.toLocaleString()} KM</div>}
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            {isRed ? (
                              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse" title="Crítico" />
                            ) : isAmber ? (
                              <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" title="Atención" />
                            ) : isYellow ? (
                              <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" title="Aviso" />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" title="Al día" />
                            )}
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isRed ? 'text-red-600' : isAmber ? 'text-orange-600' : isYellow ? 'text-yellow-600' : 'text-emerald-600'}`}>
                              {isRed ? 'CRÍTICO' : isAmber ? 'URGENTE' : isYellow ? 'PENDIENTE' : 'OPERATIVO'}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                             {vtvVencida && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[8px] font-black rounded uppercase">VTV</span>}
                             {seguroVencido && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[8px] font-black rounded uppercase">Seguro</span>}
                             {serviceCritico && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[8px] font-black rounded uppercase">Service</span>}
                             {cubiertasCritico && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[8px] font-black rounded uppercase">Gomas</span>}
                             {!isRed && vtvProxima && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[8px] font-black rounded uppercase">VTV</span>}
                             {!isRed && seguroProximo && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[8px] font-black rounded uppercase">Seguro</span>}
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
          <h2 className="text-xl font-bold uppercase tracking-tight">Actividad</h2>
          
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-2xl shadow-black/5 flex flex-col gap-6">
            {registros.length === 0 ? (
              <p className="text-gray-500 text-center py-4 font-medium italic">Aún no hay registros.</p>
            ) : registros.map((r) => (
              <div key={r.id} className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0 relative group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400 tracking-wider">
                    {r.vehiculo.patente}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                        <FormattedDate date={r.fecha} showDate={false} />
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        <FormattedDate date={r.fecha} />
                    </div>
                    <form action={deleteRegistroAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="text-gray-300 hover:text-red-500 transition-colors" title="Borrar Registro">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </form>
                  </div>
                </div>
                <div className="text-sm font-bold mb-2 flex items-baseline gap-1">
                  {(r.kmActual || 0).toLocaleString()} <span className="text-[10px] text-gray-500 font-medium">KM</span>
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
                  <div className={`mt-3 p-3 rounded-xl border leading-relaxed font-medium ${r.novedadResuelta ? 'bg-emerald-50 dark:bg-emerald-500/5 text-emerald-900 dark:text-emerald-200 border-emerald-100 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/5 text-amber-900 dark:text-amber-200 border-amber-100 dark:border-amber-500/20'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black uppercase text-[9px]">{r.novedadResuelta ? 'Resuelto:' : 'Aviso:'}</span>
                      {!r.novedadResuelta && (
                        <form action={resolverNovedadAction} className="flex gap-2">
                          <input type="hidden" name="id" value={r.id} />
                          <input name="resolucion" placeholder="Resolución..." className="text-[8px] px-2 py-1 bg-white dark:bg-gray-950 border border-amber-200 dark:border-amber-500/30 rounded-md outline-none" required />
                          <button type="submit" className="text-[8px] font-black uppercase text-amber-600 hover:text-emerald-600 transition-colors">OK</button>
                        </form>
                      )}
                    </div>
                    <div className="text-[10px]">{r.novedades}</div>
                    {r.resolucion && <div className="mt-2 pt-2 border-t border-emerald-100 dark:border-emerald-500/10 text-[9px] italic opacity-80 font-bold">{r.resolucion}</div>}
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
