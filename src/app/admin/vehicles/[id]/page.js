import Link from "next/link";
import { getVehiculoById, updateVehiculo } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import FormattedDate from "@/components/FormattedDate";
import MileageAuth from "@/components/MileageAuth";

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
          <Link href="/admin" className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 transition-all text-gray-500 shadow-sm">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black font-mono tracking-tighter uppercase">{vehiculo.patente}</h1>
              {!vehiculo.activo && (
                <span className="px-3 py-1 text-[10px] font-black uppercase bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded-full tracking-widest">Inactivo</span>
              )}
            </div>
            <div className="flex gap-2 mt-1">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-black uppercase text-[10px] tracking-widest rounded-lg">{vehiculo.categoria}</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 font-black uppercase text-[10px] tracking-widest rounded-lg">{vehiculo.tipo}</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Expediente de Unidad</p>
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
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5">
            <h2 className="text-xl font-black mb-6 uppercase tracking-tighter border-b border-gray-100 dark:border-gray-800 pb-4">Documentación</h2>
            <form action={saveAction} className="space-y-6">
              <input type="hidden" name="id" value={vehiculo.id} />
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Vencimiento VTV</label>
                <input
                  name="vtvVencimiento"
                  type="date"
                  defaultValue={vtvStr}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Vencimiento Seguro</label>
                <input
                  name="seguroVencimiento"
                  type="date"
                  defaultValue={seguroStr}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Próximo Service (km)</label>
                <input
                  name="proximoServiceKm"
                  type="number"
                  defaultValue={vehiculo.proximoServiceKm || ""}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="Ej. 150000"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Categoría del Vehículo</label>
                <select
                  name="categoria"
                  defaultValue={vehiculo.categoria || "PICKUP"}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold uppercase text-sm"
                >
                  <option value="AUTO">Auto</option>
                  <option value="PICKUP">Pick up</option>
                  <option value="MOTO">Moto</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Tipo de Vehículo</label>
                <select
                  name="tipo"
                  defaultValue={vehiculo.tipo || "INTERNO"}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold uppercase text-sm"
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

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5">
            <h2 className="text-xl font-black mb-6 uppercase tracking-tighter border-b border-gray-100 dark:border-gray-800 pb-4">Visitas por Sucursal</h2>
            <div className="space-y-4">
              {sortedBranches.length === 0 ? (
                <p className="text-gray-400 text-center font-bold uppercase text-[10px] tracking-widest py-4">Sin datos de visitas</p>
              ) : sortedBranches.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="font-bold text-sm uppercase tracking-tight">{name}</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <MileageAuth vehiculoId={vehiculo.id} initialCode={vehiculo.codigoAutorizacion} />
        </div>

        {/* Columna Derecha: Historial */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 font-sans min-h-[600px]">
            <h2 className="text-xl font-black mb-8 uppercase tracking-tighter border-b border-gray-100 dark:border-gray-800 pb-4 flex items-center justify-between">
              Historial de Uso
              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500">{vehiculo.registros?.length || 0} Registros</span>
            </h2>
            <div className="space-y-6">
              {!vehiculo.registros?.length ? (
                <div className="text-gray-300 text-center py-20 font-black uppercase tracking-widest">Aún no hay actividad</div>
              ) : vehiculo.registros.map(r => (
                <div key={r.id} className="p-6 bg-gray-50 dark:bg-gray-800/20 rounded-[2rem] border border-gray-100 dark:border-gray-800 group hover:border-blue-200 dark:hover:border-blue-900/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-400">{(r.kmActual || 0).toLocaleString()} <span className="text-xs uppercase ml-1">km</span></div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        <FormattedDate date={r.fecha} />
                      </div>
                    </div>
                    {r.nombreConductor && (
                      <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-gray-100 dark:border-gray-800">
                        {r.nombreConductor}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {r.sucursales?.map(s => (
                       <span key={s.id} className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                         {s.nombre}
                       </span>
                    ))}
                  </div>

                  {r.novedades && (
                    <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-100 dark:border-amber-500/10 text-sm font-medium italic text-amber-900 dark:text-amber-200">
                      &quot;{r.novedades}&quot;
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
