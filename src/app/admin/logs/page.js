export const dynamic = 'force-dynamic';
import Link from "next/link";
import { getDailyReport, deleteRegistroDiario } from "@/lib/actions";
import FormattedDate from "@/components/FormattedDate";
import VehicleIcon from "@/components/VehicleIcon";

async function deleteRegistroAction(formData) {
  "use server";
  const id = formData.get("id");
  await deleteRegistroDiario(id);
  const { redirect } = await import("next/navigation");
  redirect("/admin/logs");
}

export default async function AdminLogs() {
  const dateString = new Date().toISOString().split('T')[0];
  const res = await getDailyReport(dateString);
  
  // getDailyReport devuelve ordenado por fecha ascendente. Los invertimos para ver los más recientes primero.
  const registros = res.success && res.data ? [...res.data.registros].reverse() : [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700  pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">Bitácoras del Día</h1>
          <p className="text-gray-500 ">Mostrando todos los {registros.length} registros generados hoy.</p>
        </div>
        <Link 
          href="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900/40 text-black hover:bg-slate-800/50 rounded-2xl font-black transition-all shadow-xl shadow-white/5 text-[10px] uppercase tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Volver al Panel
        </Link>
      </div>

      <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-[2rem] p-8 shadow-2xl shadow-black/5 flex flex-col gap-6">
        {registros.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300  mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p className="text-gray-500  font-bold uppercase tracking-widest text-sm">No hay bitácoras registradas hoy.</p>
          </div>
        ) : registros.map((r) => (
          <div key={r.id} className="pb-6 border-b border-slate-800/50  last:border-0 last:pb-0 relative group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                   <span className="text-gray-400">
                      <VehicleIcon categoria={r.vehiculo?.categoria} className="w-4 h-4" />
                   </span>
                   <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400 tracking-wider">
                     {r.vehiculo?.patente || 'S/D'}
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
              <div className="flex items-center gap-4">
                <div className="font-bold text-blue-600 dark:text-blue-400 text-sm bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-500/20">
                    <FormattedDate date={r.fecha} showDate={false} />
                </div>
                <form action={deleteRegistroAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors bg-slate-800/30  p-2 rounded-lg" title="Borrar Registro">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </form>
              </div>
            </div>
            
            {/* Kilómetros con alerta visual de modificación */}
            <div className="text-sm font-bold mb-2 flex items-center gap-1 mt-3">
              {r.kmActual != null ? (
                <span className={r.kmModificado ? "text-orange-600 dark:text-orange-400 flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800/50 shadow-sm" : "flex items-baseline gap-1 text-slate-100 dark:text-white"}>
                  {r.kmActual.toLocaleString()} <span className="text-[10px] opacity-70 font-black uppercase tracking-tighter">km</span>
                  {r.kmModificado && (
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                      <span className="text-[9px] font-black uppercase tracking-widest">Editado Manual</span>
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest bg-slate-800/50  px-3 py-1 rounded-lg">Parada en Ruta</span>
              )}
            </div>

            {r.nombreConductor && (
              <div className="text-xs text-gray-500  font-bold uppercase tracking-tighter mb-2 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 text-[8px] font-black">
                  {r.nombreConductor.charAt(0).toUpperCase()}
                </div>
                {r.nombreConductor}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mb-2 mt-2">
              {r.sucursales?.map(s => (
                <span key={s.id} className="text-[9px] bg-slate-800/50  border border-slate-700  text-gray-600  px-2 py-1 rounded-md font-bold uppercase tracking-widest shadow-sm">
                  {s.nombre}
                </span>
              ))}
            </div>
            
            {r.nivelCombustible && (
               <div className="mt-2 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                  Combustible reportado: <span className="text-blue-500 font-black">{r.nivelCombustible}</span>
               </div>
            )}

            {r.novedades && (
              <div className="mt-3 text-[10px] bg-amber-50 dark:bg-amber-500/5 text-amber-900 dark:text-amber-200 p-3 rounded-xl border border-amber-100 dark:border-amber-500/20 leading-relaxed font-medium">
                <span className="font-black mr-1 uppercase text-[9px] tracking-widest">Observaciones:</span>
                {r.novedades}
              </div>
            )}
            
            {/* Fotos */}
            {(r.fotoFrente || r.fotoTrasera || r.fotoLateralIzq || r.fotoLateralDer) && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[r.fotoFrente, r.fotoTrasera, r.fotoLateralIzq, r.fotoLateralDer].filter(Boolean).map((foto, idx) => (
                  <a key={idx} href={foto} target="_blank" rel="noreferrer" className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-800/50  flex-shrink-0 hover:scale-105 transition-transform shadow-md">
                    <img src={foto} className="w-full h-full object-cover" alt="Inspección" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
