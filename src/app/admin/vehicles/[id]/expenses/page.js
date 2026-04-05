import Link from "next/link";
import { getVehiculoById, getGastosByVehiculo, addGasto, deleteGasto } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function addGastoAction(formData) {
  "use server";
  const vehiculoId = formData.get("vehiculoId");
  await addGasto(formData);
  revalidatePath(`/admin/vehicles/${vehiculoId}/expenses`);
}

async function deleteGastoAction(formData) {
  "use server";
  const id = formData.get("id");
  const vehiculoId = formData.get("vehiculoId");
  await deleteGasto(id);
  revalidatePath(`/admin/vehicles/${vehiculoId}/expenses`);
}

export default async function VehicleExpenses({ params }) {
  const { id } = await params;
  
  const [vRes, gRes] = await Promise.all([
    getVehiculoById(id),
    getGastosByVehiculo(id)
  ]);
  
  const vehiculo = vRes.success ? vRes.data : null;
  const gastos = gRes.success ? gRes.data : [];

  if (!vehiculo) return <div>Vehículo no encontrado.</div>;

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
           <h1 className="text-3xl font-bold font-mono tracking-tight">{vehiculo.patente}</h1>
           <p className="text-gray-500 ">Control de Gastos</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-700  pb-4">
         <Link href={`/admin/vehicles/${vehiculo.id}`} className="font-medium text-gray-500 hover:text-slate-100 dark:hover:text-gray-200 px-2 transition-colors">General</Link>
         <span className="font-semibold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-4 -mb-4 px-2">Gastos</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20">
             <div className="text-blue-100 text-sm font-medium mb-1">Gasto Total Registrado</div>
             <div className="text-4xl font-bold tracking-tight">${totalGastos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-tighter">Registrar Gasto</h3>
            <form action={addGastoAction} className="space-y-4">
               <input type="hidden" name="vehiculoId" value={vehiculo.id} />
               <div>
                 <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-widest">Tipo</label>
                 <select name="tipo" className="w-full bg-slate-800/30  border border-slate-700  rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold">
                    <option>Combustible</option>
                    <option>Peajes</option>
                    <option>Service Oficial</option>
                    <option>Repuestos</option>
                    <option>Lavado</option>
                    <option>Seguro</option>
                    <option>Otros</option>
                 </select>
               </div>
               <div>
                 <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-widest">Monto ($)</label>
                 <input name="monto" type="number" step="0.01" required className="w-full bg-slate-800/30  border border-slate-700  rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold" placeholder="0.00" />
               </div>
               <div>
                 <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-widest">Fecha</label>
                 <input name="fecha" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-800/30  border border-slate-700  rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold" />
               </div>
               <div>
                 <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-widest">Descripción</label>
                 <textarea name="descripcion" required rows="2" className="w-full bg-slate-800/30  border border-slate-700  rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none font-medium" placeholder="Ticket o detalle..." />
               </div>
               <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                 Registrar Gasto
               </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-3xl p-6 shadow-sm min-h-[500px]">
             <h3 className="text-xl font-bold mb-6 uppercase tracking-tighter">Historial de Gastos</h3>
             <div className="space-y-4">
                {gastos.length === 0 ? (
                  <div className="text-gray-500 text-center py-10 font-medium">No existen gastos registrados.</div>
                ) : gastos.map(g => (
                  <div key={g.id} className="flex justify-between items-center p-5 bg-slate-800/30 /50 rounded-2xl border border-slate-800/50 ">
                    <div className="flex-1">
                      <div className="font-black text-slate-100  flex items-center gap-3">
                        <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] uppercase">{g.tipo}</span>
                        <span className="text-xs font-bold text-gray-400" suppressHydrationWarning>{new Date(g.fecha).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-2 font-medium">{g.descripcion}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-xl font-black text-slate-100 dark:text-white">
                        ${g.monto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <form action={deleteGastoAction}>
                        <input type="hidden" name="id" value={g.id} />
                        <input type="hidden" name="vehiculoId" value={vehiculo.id} />
                        <button type="submit" className="text-gray-300 hover:text-red-500 transition-colors" title="Borrar Gasto">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
