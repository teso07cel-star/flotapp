import { 
  getAllChoferes, addChofer, deleteChofer, updateChoferPatente, resetDriverDevice,
  getAutorizacionesPendientes, aprobarAutorizacion, rechazarAutorizacion, resetSystem
} from "@/lib/actions";
import { revalidatePath } from "next/cache";
import AutoRefresh from "@/components/AutoRefresh";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ChoferesAdmin() {
  const [res, authRes] = await Promise.all([
    getAllChoferes(),
    getAutorizacionesPendientes()
  ]);
  
  if (!res.success) {
    return (
      <div className="p-10 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-3xl">
        <h2 className="text-red-600 dark:text-red-400 font-bold uppercase mb-2">Error de Conexión</h2>
        <p className="text-gray-600  font-mono text-sm">{res.error}</p>
        <p className="mt-4 text-xs text-gray-500 italic text-balance">Si ves este error, es probable que la base de datos configurada en Vercel sea incorrecta o esté inaccesible.</p>
      </div>
    );
  }

  const choferes = res.data || [];
  const identityAlerts = res.alerts || [];
  const solicitudesPendientes = authRes.success ? authRes.data : [];

  async function addAction(formData) {
    "use server";
    const nombre = formData.get("nombre");
    await addChofer(nombre);
  }

  async function deleteAction(formData) {
    "use server";
    const id = formData.get("id");
    await deleteChofer(id);
  }

  async function assignPatenteAction(formData) {
    "use server";
    const id = formData.get("id");
    const patente = formData.get("patente");
    await updateChoferPatente(id, patente);
  }

  async function resetDeviceAction(formData) {
    "use server";
    const id = formData.get("id");
    await resetDriverDevice(id);
  }

  async function approveAuthAction(formData) {
    "use server";
    const id = formData.get("id");
    await aprobarAutorizacion(id);
  }

  async function rejectAuthAction(formData) {
    "use server";
    const id = formData.get("id");
    await rechazarAutorizacion(id);
  }
  async function resetSystemAction() {
    "use server";
    await resetSystem();
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AutoRefresh />
      
      {/* BANNER DE VERSIÓN PARA VERIFICACIÓN */}
      <div className="bg-blue-600 px-6 py-2 rounded-full inline-block mb-4 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
         <p className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Protocolo de Enlace Táctico v2.0 Activo</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      </div>
      
      {/* ALERTAS DE IDENTIDAD DIPLOMÁTICAS */}
      {identityAlerts.length > 0 && (
        <div className="space-y-4">
          {identityAlerts.map((alert, idx) => (
            <div key={idx} className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Conflicto de Enlace Detectado</p>
                <p className="text-xs text-slate-300">
                  No se pudo vincular a <span className="font-bold text-white text-sm">{alert.chofer}</span> porque su celular ya pertenece a <span className="font-bold text-amber-400 text-sm italic underline decoration-amber-500/50 underline-offset-4">{alert.occupiedBy}</span>.
                </p>
              </div>
              <div className="text-[9px] font-black uppercase tracking-tighter text-amber-500/50 italic">
                Requiere Acción Manual
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECCIÓN DE SOLICITUDES PENDIENTES - HUD TÁCTICO */}
      <div className={`relative group transition-all duration-1000 ${solicitudesPendientes.length > 0 ? 'scale-[1.01]' : 'opacity-80'}`}>
           {solicitudesPendientes.length > 0 && (
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[2.6rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse" />
           )}
           
           <div className={`relative bg-[#020617]/90 border-2 ${solicitudesPendientes.length > 0 ? 'border-blue-500/50' : 'border-slate-800/40'} rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl`}>
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 ${solicitudesPendientes.length > 0 ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-slate-800'} rounded-2xl flex items-center justify-center transition-all duration-500`}>
                         <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                         </svg>
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1 text-glow-blue">Solicitudes de Enlace</h2>
                         <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.4em] opacity-80">Protocolo de Identificación de Hardware</p>
                      </div>
                   </div>
                   
                   {solicitudesPendientes.length > 0 && (
                     <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full animate-bounce">
                        <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Señal Entrante</span>
                     </div>
                   )}
                </div>

                {solicitudesPendientes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {solicitudesPendientes.map((s) => (
                        <div key={s.id} className="bg-slate-900/60 border border-white/5 hover:border-blue-500/40 rounded-3xl p-7 relative overflow-hidden group/card transition-all duration-500">
                           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover/card:opacity-10 transition-opacity">
                              <img src="/icons/admin_hud.png" className="w-24 h-24 object-contain contrast-200 grayscale" alt="HUD" />
                           </div>
                           
                           <div className="space-y-1 mb-6">
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em]">Operador en Espera</p>
                              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{s.nombreSolicitante}</h3>
                              <p className="text-[8px] text-slate-600 font-mono">HASHID: {s.deviceId?.substring(0, 12)}...</p>
                           </div>
                           
                           <div className="flex gap-4">
                              <form action={approveAuthAction} className="flex-[2]">
                                 <input type="hidden" name="id" value={s.id} />
                                 <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                                    Aceptar Enlace
                                 </button>
                              </form>
                              <form action={rejectAuthAction} className="flex-1">
                                 <input type="hidden" name="id" value={s.id} />
                                 <button type="submit" className="w-full py-4 bg-slate-950 text-red-500 border border-red-500/20 hover:bg-red-950/40 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                                    Rechazar
                                 </button>
                              </form>
                           </div>
                        </div>
                     ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-slate-800/50 rounded-[2rem] bg-slate-900/20">
                     <svg className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.111 16.404a5.5 5.5 0 117.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.256-3.905 14.162 0m-1.415-1.414a10 10 0 10-11.33 0" />
                     </svg>
                     <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600">Frecuencia Limpia • Sin Solicitudes</p>
                     
                     {!authRes.success && (
                       <div className="mt-8 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                          <p className="text-red-500 text-[10px] italic mb-4">Sincronización de Base de Datos Interrumpida</p>
                          <form action={resetSystemAction}>
                             <button className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-red-600/20 transition-all">
                                Reiniciar Motores Tácticos
                             </button>
                          </form>
                       </div>
                     )}
                  </div>
                )}
           </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-100 ">
        <div className="lg:col-span-2">
          <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/30 /50 text-gray-500  text-xs uppercase font-black border-b border-slate-700 ">
                  <th className="p-5 pl-8 text-slate-100 ">Nombre</th>
                  <th className="p-5 text-slate-100 ">Patente Asignada</th>
                  <th className="p-5 text-right pr-8 text-slate-100 ">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {choferes.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="p-10 text-center text-gray-500 font-medium italic">No hay choferes registrados.</td>
                  </tr>
                ) : choferes.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/30 dark:hover:bg-gray-800/20 transition-colors group">
                    <td className="p-5 pl-8 font-bold text-slate-100 flex items-center gap-2">
                       {c.nombre}
                       {c.passkeyId && (
                         <span title="Dispositivo Vinculado" className="inline-flex w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                       )}
                    </td>
                    <td className="p-5">
                      <form action={assignPatenteAction} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={c.id} />
                        <input 
                          name="patente" 
                          defaultValue={c.patenteAsignada || ""} 
                          placeholder="Ninguna" 
                          className="w-24 bg-slate-800/50  border-none rounded-lg px-3 py-2 text-xs uppercase font-mono font-bold text-slate-100 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:font-sans placeholder:capitalize"
                        />
                        <button type="submit" className="text-blue-500 hover:text-blue-600 focus:outline-none transition-colors" title="Guardar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        </button>
                      </form>
                    </td>
                    <td className="p-5 pr-8 text-right space-x-3">
                      {c.passkeyId && (
                        <form action={resetDeviceAction} className="inline">
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" className="text-amber-500 hover:text-amber-400 font-bold text-[9px] uppercase tracking-widest transition-colors focus:outline-none focus:underline" title="Desvincular Dispositivo (Reset Credencial)">
                             Desvincular
                          </button>
                        </form>
                      )}
                      <form action={deleteAction} className="inline">
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors focus:outline-none focus:underline">Eliminar</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-[2rem] p-8 shadow-2xl shadow-black/5">
            <h2 className="text-xl font-bold mb-6 uppercase tracking-tight text-slate-100 ">Nuevo Chofer</h2>
            <form action={addAction} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nombre Completo</label>
                <input 
                  name="nombre" 
                  type="text" 
                  required 
                  className="w-full bg-slate-800/30  border-none rounded-2xl px-5 py-4 text-slate-100 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 uppercase text-xs tracking-widest">Agregar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
