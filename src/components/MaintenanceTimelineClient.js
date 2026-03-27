"use client";
import { useState } from "react";
import { createMantenimiento, deleteMantenimiento } from "@/lib/actions";

export default function MaintenanceTimelineClient({ vehiculo }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
     fecha: new Date().toISOString().split('T')[0],
     tipoServicio: "Mantenimiento General",
     descripcion: "",
     taller: "",
     costo: "",
     kilometraje: vehiculo.registros?.[0]?.kmActual || ""
  });

  const tiposServicio = [
     "Mantenimiento General",
     "Cambio de Aceite y Filtros",
     "Cambio de Cubiertas",
     "Alineación y Balanceo",
     "Tren Delantero",
     "Frenos",
     "Electricidad",
     "Reparación de Motor",
     "Chapa y Pintura",
     "Otro"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createMantenimiento({
       vehiculoId: vehiculo.id,
       ...formData
    });

    if (res.success) {
      setIsAdding(false);
      setFormData(prev => ({ ...prev, descripcion: "", taller: "", costo: "" }));
    } else {
      setError("Error: " + res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (mId) => {
     if (!confirm("¿Seguro que deseas eliminar este registro?")) return;
     setLoading(true);
     const res = await deleteMantenimiento(mId);
     if (!res.success) {
        alert(res.error);
     }
     setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       {/* Panel Izquierdo: Formulario */}
       <div className="lg:col-span-1 border-r border-emerald-100 dark:border-emerald-900/50 pr-0 lg:pr-8">
          <div className="sticky top-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-emerald-900 dark:text-emerald-50 tracking-tight">Nuevo Registro</h2>
                <button 
                  onClick={() => setIsAdding(!isAdding)}
                  className={`p-2 rounded-xl transition-colors ${isAdding ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-emerald-600 text-white shadow-lg hover:bg-emerald-500'}`}
                >
                  {isAdding ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  )}
                </button>
             </div>

             {isAdding ? (
               <form onSubmit={handleSubmit} className="bg-white/60 dark:bg-emerald-900/20 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800 shadow-xl space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</label>
                     <input type="date" required value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Servicio Realizado</label>
                     <select value={formData.tipoServicio} onChange={e => setFormData({...formData, tipoServicio: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                       {tiposServicio.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kilometraje Actual</label>
                     <input type="number" required value={formData.kilometraje} onChange={e => setFormData({...formData, kilometraje: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. 145000" />
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detalle del Trabajo</label>
                     <textarea rows={3} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" placeholder="Pastillas delanteras, alineación..." />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Taller</label>
                        <input type="text" value={formData.taller} onChange={e => setFormData({...formData, taller: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Nombre" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Costo ($)</label>
                        <input type="number" step="0.01" value={formData.costo} onChange={e => setFormData({...formData, costo: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
                     </div>
                  </div>

                  {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

                  <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold tracking-wide py-4 mt-2 rounded-xl transition-all shadow-lg flex justify-center">
                    {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Guardar Historial"}
                  </button>
               </form>
             ) : (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-8 rounded-3xl text-center flex flex-col items-center opacity-80">
                   <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800/40 rounded-full flex items-center justify-center mb-4">
                     <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                   </div>
                   <h3 className="text-emerald-900 dark:text-emerald-50 font-bold mb-2">Mantén el control</h3>
                   <p className="text-xs text-emerald-700 dark:text-emerald-400/80 leading-relaxed">
                     Registra cada servicio, cambio de repuestos o reparación para que el sistema audite la frecuencia y rentabilidad del vehículo.
                   </p>
                </div>
             )}
          </div>
       </div>

       {/* Panel Derecho: Timeline */}
       <div className="lg:col-span-2">
          <h2 className="text-xl font-black text-emerald-900 dark:text-emerald-50 tracking-tight mb-8">Línea de Vida</h2>
          
          <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-100 dark:border-emerald-800/50 space-y-10 before:absolute before:inset-y-0 before:left-[-1px] before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:to-transparent">
             
             {vehiculo.mantenimientos.length === 0 ? (
               <div className="text-gray-400 italic text-sm">No hay mantenimientos registrados aún.</div>
             ) : (
               vehiculo.mantenimientos.map((m, index) => (
                 <div key={m.id} className="relative group">
                    <div className="absolute -left-[35px] sm:-left-[43px] w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-gray-950 mt-1.5 transition-transform group-hover:scale-125 z-10 shadow-md"></div>
                    
                    <div className="bg-white/60 dark:bg-emerald-900/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-emerald-50 dark:border-emerald-800/30 shadow-sm transition-all hover:shadow-lg group-hover:-translate-y-1">
                       
                       <button 
                          onClick={() => handleDelete(m.id)}
                          disabled={loading}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Eliminar registro"
                       >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>

                       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pr-8">
                          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 text-xs font-black uppercase tracking-widest rounded-lg">
                            {m.tipoServicio}
                          </span>
                          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 font-mono">
                             <span className="flex items-center gap-1">📅 {new Date(m.fecha).toLocaleDateString()}</span>
                             <span className="text-emerald-300">|</span>
                             <span className="flex items-center gap-1">⏱️ {m.kilometraje ? m.kilometraje.toLocaleString() + ' km' : 'N/A'}</span>
                          </div>
                       </div>
                       
                       {m.descripcion && <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{m.descripcion}</p>}
                       
                       {(m.taller || m.costo) && (
                         <div className="bg-gray-50 dark:bg-gray-950/50 rounded-xl p-3 flex flex-wrap gap-4 text-xs font-medium border border-gray-100 dark:border-gray-800/50">
                           {m.taller && <div className="text-gray-500 flex items-center gap-1">🛠️ <span className="text-gray-700 dark:text-gray-300">{m.taller}</span></div>}
                           {m.costo && <div className="text-gray-500 flex items-center gap-1">💰 <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest">${m.costo.toLocaleString()}</span></div>}
                         </div>
                       )}
                    </div>
                 </div>
               ))
             )}

          </div>
       </div>
    </div>
  );
}
