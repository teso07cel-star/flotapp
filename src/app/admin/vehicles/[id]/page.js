import Link from "next/link";
import { getVehiculoById, updateVehiculo } from "@/lib/appActions";
import { revalidatePath } from "next/cache";
import FormattedDate from "@/components/FormattedDate";
import MileageAuth from "@/components/MileageAuth";
import MantenimientoSection from "@/components/MantenimientoSection";

async function saveAction(formData) {
  "use server";
  const id = formData.get("id");
    const payload = {
      vtvVencimiento: formData.get("vtvVencimiento") || null,
      seguroVencimiento: formData.get("seguroVencimiento") || null,
      proximoServiceKm: parseInt(formData.get("proximoServiceKm")) || null,
      categoria: formData.get("categoria") || "PICKUP",
      tipo: formData.get("tipo") || "INTERNO"
    };
  await updateVehiculo(id, payload);
  revalidatePath(`/admin/vehicles/${id}`);
}

export default async function VehicleDetails({ params }) {
  const { id } = await params;
  const res = await getVehiculoById(id);
  const vehiculo = res.success ? res.data : null;

  if (!vehiculo) {
    return <div className="p-10 text-red-500">Vehículo no encontrado.</div>;
  }

  const vtvStr = vehiculo.vtvVencimiento ? new Date(vehiculo.vtvVencimiento).toISOString().split('T')[0] : "";
  const seguroStr = vehiculo.seguroVencimiento ? new Date(vehiculo.seguroVencimiento).toISOString().split('T')[0] : "";

  // Calcular estadísticas de sucursales
  const branchVisits = {};
  vehiculo.registros?.forEach(r => {
    // Caso de sucursales múltiples
    if (r.sucursales && r.sucursales.length > 0) {
      r.sucursales.forEach(s => {
        branchVisits[s.nombre] = (branchVisits[s.nombre] || 0) + 1;
      });
    } else if (r.sucursal) { // Caso de sucursal única (legacy)
      branchVisits[r.sucursal.nombre] = (branchVisits[r.sucursal.nombre] || 0) + 1;
    }
  });

  const sortedBranches = Object.entries(branchVisits)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8 max-w-6xl animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-3 rounded-2xl bg-slate-900/40 bg-[#0f172a] border border-slate-700  hover:bg-slate-800/50 transition-all text-gray-500 shadow-sm">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black font-mono tracking-tighter uppercase">{vehiculo.patente}</h1>
              {!vehiculo.activo && (
                <span className="px-3 py-1 text-[10px] font-black uppercase bg-slate-800/50 text-slate-200   rounded-full tracking-widest">Inactivo</span>
              )}
            </div>
            <div className="flex gap-2 mt-1">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-black uppercase text-[10px] tracking-widest rounded-lg">{vehiculo.categoria}</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 font-black uppercase text-[10px] tracking-widest rounded-lg">{vehiculo.tipo}</span>
            </div>
            <p className="text-gray-500  font-bold uppercase text-[10px] tracking-widest mt-2">Expediente de Unidad</p>
          </div>
        </div>

        <div className="flex gap-3">
           <Link href={`/admin/vehicles/${vehiculo.id}/expenses`} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs tracking-widest transition-all shadow-lg shadow-blue-500/20 uppercase">
             Ver Gastos
           </Link>
        </div>
      </div>

      {/* Alertas Detalladas */}
      {(() => {
        const hoy = new Date();
        const quinceDias = new Date(hoy.getTime() + (15 * 24 * 60 * 60 * 1000));
        const kmActual = vehiculo.registros?.[0]?.kmActual || 0;
        const kmParaService = vehiculo.proximoServiceKm ? (vehiculo.proximoServiceKm - kmActual) : null;

        const alerts = [];
        if (vehiculo.vtvVencimiento && new Date(vehiculo.vtvVencimiento) < hoy) alerts.push({ type: 'red', msg: 'VTV Vencida' });
        else if (vehiculo.vtvVencimiento && new Date(vehiculo.vtvVencimiento) <= quinceDias) alerts.push({ type: 'amber', msg: 'VTV por vencer (menos de 15 días)' });

        if (vehiculo.seguroVencimiento && new Date(vehiculo.seguroVencimiento) < hoy) alerts.push({ type: 'red', msg: 'Seguro Vencido' });
        else if (vehiculo.seguroVencimiento && new Date(vehiculo.seguroVencimiento) <= quinceDias) alerts.push({ type: 'amber', msg: 'Seguro por vencer (menos de 15 días)' });

        if (kmParaService !== null) {
          if (kmParaService <= 100) alerts.push({ type: 'red', msg: `SERVICE CRÍTICO: Faltan ${kmParaService} km` });
          else if (kmParaService <= 500) alerts.push({ type: 'amber', msg: `Service Cercano: Faltan ${kmParaService} km` });
        }

        if (alerts.length === 0) return null;

        return (
          <div className="flex flex-col gap-3">
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${
                a.type === 'red' 
                  ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-400 animate-pulse' 
                  : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400'
              }`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="text-sm font-black uppercase tracking-widest">{a.msg}</span>
              </div>
            ))}
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Mantenimiento & Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-[2.5rem] p-8 shadow-2xl shadow-black/5">
            <h2 className="text-xl font-black mb-6 uppercase tracking-tighter border-b border-slate-800/50  pb-4">Documentación</h2>
            <form action={saveAction} className="space-y-6">
              <input type="hidden" name="id" value={vehiculo.id} />
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Vencimiento VTV</label>
                <input
                  name="vtvVencimiento"
                  type="date"
                  defaultValue={vtvStr}
                  className="w-full bg-slate-800/30  border border-slate-700  rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Vencimiento Seguro</label>
                <input
                  name="seguroVencimiento"
                  type="date"
                  defaultValue={seguroStr}
                  className="w-full bg-slate-800/30  border border-slate-700  rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Próximo Service (km)</label>
                <input
                  name="proximoServiceKm"
                  type="number"
                  defaultValue={vehiculo.proximoServiceKm || ""}
                  className="w-full bg-slate-800/30  border border-slate-700  rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="Ej. 150000"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Categoría del Vehículo</label>
                <select
                  name="categoria"
                  defaultValue={vehiculo.categoria || "PICKUP"}
                  className="w-full bg-slate-800/30  border border-slate-700  rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold uppercase text-sm"
                >
                  <option value="AUTO">Auto</option>
                  <option value="PICKUP">Pick up / Camioneta</option>
                  <option value="UTILITARIO">Utilitario / Van</option>
                  <option value="MOTO">Moto</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Tipo de Vehículo</label>
                <select
                  name="tipo"
                  defaultValue={vehiculo.tipo || "INTERNO"}
                  className="w-full bg-slate-800/30  border border-slate-700  rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold uppercase text-sm"
                >
                  <option value="INTERNO">Flota Interna</option>
                  <option value="EXTERNO">Tercero / Externo</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl transition-all shadow-xl"
              >
                Actualizar Datos
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-500/10 dark:to-purple-500/10 border border-pink-100 dark:border-pink-500/20 rounded-[2.5rem] p-8 shadow-xl shadow-pink-500/5 font-sans">
            <h2 className="text-xl font-black mb-6 uppercase tracking-tighter border-b border-pink-200 dark:border-pink-500/20 pb-4 flex items-center justify-between text-pink-600 dark:text-pink-400">
              Fotos del Mes
              <span className="text-[10px] bg-slate-900/40 dark:bg-pink-900/30 px-3 py-1 rounded-full text-pink-500 dark:text-pink-300">
                {vehiculo.InspeccionMensual?.length || 0} Reg.
              </span>
            </h2>
            <div className="space-y-6">
              {(!vehiculo.InspeccionMensual || vehiculo.InspeccionMensual.length === 0) ? (
                 <p className="text-pink-400/70 text-center font-bold uppercase text-[10px] tracking-widest py-8">
                   Sin fotos cargadas este mes
                 </p>
              ) : vehiculo.InspeccionMensual.map((insp) => (
                 <div key={insp.id} className="bg-slate-900/40 bg-[#0f172a] border border-slate-800/50  rounded-[2rem] p-5 shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h3 className="font-black text-sm text-slate-200 dark:text-white uppercase tracking-tight">Período {insp.mes}/{insp.anio}</h3>
                       <p className="text-[10px] uppercase font-bold text-gray-400 mt-1"><FormattedDate date={insp.fecha} /></p>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     {[{label: 'Frente', img: insp.fotoFrente}, {label: 'Trasera', img: insp.fotoTrasera}, {label: 'Lat Izq', img: insp.fotoLateralIzq}, {label: 'Lat Der', img: insp.fotoLateralDer}].map(foto => (
                       <div key={foto.label} className="relative aspect-square bg-slate-800/50  rounded-xl overflow-hidden group border border-slate-700 ">
                          {foto.img ? (
                             <a href={foto.img} target="_blank" rel="noreferrer">
                               <img src={foto.img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={foto.label}/>
                             </a>
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 font-bold uppercase text-center p-2">Sin Foto</div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] uppercase font-bold text-center py-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            {foto.label}
                          </div>
                       </div>
                     ))}
                   </div>
                   <div className="grid grid-cols-2 gap-3 mt-3">
                      {insp.fotoVTV && (
                        <a href={insp.fotoVTV} target="_blank" rel="noreferrer" className="block text-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase py-2 rounded-lg border border-blue-100 dark:border-blue-800">Ver VTV</a>
                      )}
                      {insp.fotoSeguro && (
                        <a href={insp.fotoSeguro} target="_blank" rel="noreferrer" className="block text-center bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[9px] font-black uppercase py-2 rounded-lg border border-purple-100 dark:border-purple-800">Ver Segu.</a>
                      )}
                   </div>
                 </div>
              ))}
            </div>
          </div>

          <MileageAuth vehiculoId={vehiculo.id} initialCode={vehiculo.codigoAutorizacion} />
          
          <MantenimientoSection vehiculoId={vehiculo.id} mantenimientos={vehiculo.Mantenimiento || []} />
        </div>

        {/* Columna Derecha: Historial */}
        <div className="lg:col-span-2 space-y-8">

          <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 font-sans min-h-[600px]">
            <h2 className="text-xl font-black mb-8 uppercase tracking-tighter border-b border-slate-800/50  pb-4 flex items-center justify-between">
              Historial de Uso (Diarios)
              <span className="text-[10px] bg-slate-800/50  px-3 py-1 rounded-full text-gray-500">{vehiculo.registros?.length || 0} Registros</span>
            </h2>
            <div className="space-y-6">
              {!vehiculo.registros?.length ? (
                <div className="text-gray-300 text-center py-20 font-black uppercase tracking-widest">Aún no hay actividad</div>
              ) : vehiculo.registros.map(r => (
                <div key={r.id} className="p-6 bg-slate-800/30 /20 rounded-[2rem] border border-slate-800/50  group hover:border-blue-200 dark:hover:border-blue-900/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-400">{(r.kmActual || 0).toLocaleString()} <span className="text-xs uppercase ml-1">km</span></div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        <FormattedDate date={r.fecha} />
                      </div>
                    </div>
                    {r.nombreConductor && (
                      <div className="bg-slate-900/40 bg-[#0f172a] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-slate-800/50 ">
                        {r.nombreConductor}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {r.sucursales?.map(s => (
                       <span key={s.id} className="bg-gray-200  text-gray-600  px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                         {s.nombre}
                       </span>
                    ))}
                    {r.nivelCombustible && (
                       <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         Tanque: {r.nivelCombustible}
                       </span>
                    )}
                    {r.fotoTicketCombustible && (
                       <a href={r.fotoTicketCombustible} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                         <svg className="w-3 h-3 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 5v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                         Ticket Combustible (${r.montoCombustible})
                       </a>
                    )}
                  </div>

                  {r.novedades && (
                    <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-100 dark:border-amber-500/10 text-sm font-medium italic text-amber-900 dark:text-amber-200">
                      &quot;{r.novedades}&quot;
                    </div>
                  )}

                  {/* Visual indicator for photos in history */}
                  {(r.fotoFrente || r.fotoTrasera || r.fotoLateralIzq || r.fotoLateralDer) && (
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                       {[
                         {l: 'Frente', img: r.fotoFrente}, 
                         {l: 'Trasera', img: r.fotoTrasera}, 
                         {l: 'Lat Izq', img: r.fotoLateralIzq}, 
                         {l: 'Lat Der', img: r.fotoLateralDer}
                       ].filter(f => f.img).map((foto, idx) => (
                         <a key={idx} href={foto.img} target="_blank" rel="noreferrer" className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-800/50  flex-shrink-0 group">
                           <img src={foto.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={foto.l} />
                           <div className="absolute inset-x-0 bottom-0 bg-black/50 text-[8px] text-white text-center py-1 font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                             {foto.l}
                           </div>
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
    </div>
  );
}
