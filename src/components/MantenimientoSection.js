"use client";
import { useState } from "react";
import { addMantenimiento } from "@/lib/appActions";

export default function MantenimientoSection({ vehiculoId, mantenimientos = [] }) {
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    data.vehiculoId = vehiculoId;

    const res = await addMantenimiento(data);
    if (res.success) {
      setOpenForm(false);
      e.target.reset();
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 font-sans mt-8">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-xl font-black uppercase tracking-tighter">Control y Mantenimiento</h2>
        <button 
          onClick={() => setOpenForm(!openForm)} 
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-widest transition-colors"
        >
          {openForm ? "Cancelar" : "+ Nuevo Registro"}
        </button>
      </div>

      {openForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/30 rounded-[2rem] border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-4">
           <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-widest text-[10px]">Cargar Nuevo Mantenimiento</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Servicio / Tipo</label>
                <select name="tipoServicio" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-white appearance-none cursor-pointer">
                  <option value="" disabled selected className="bg-slate-900">Seleccione una opción</option>
                  <option value="Cambio de aceite y filtros" className="bg-slate-900">Cambio de aceite y filtros</option>
                  <option value="Tren delantero" className="bg-slate-900">Tren delantero</option>
                  <option value="Aire acondicionado" className="bg-slate-900">Aire acondicionado</option>
                  <option value="Embrague" className="bg-slate-900">Embrague</option>
                  <option value="Caja de direccion" className="bg-slate-900">Caja de dirección</option>
                  <option value="Frenos" className="bg-slate-900">Frenos</option>
                  <option value="Alineacion, balanceo y rotacion" className="bg-slate-900">Alineación, balanceo y rotación</option>
                  <option value="Cambio de cubiertas" className="bg-slate-900">Cambio de cubiertas</option>
                  <option value="Problema electrico" className="bg-slate-900">Problema eléctrico</option>
                  <option value="Chapa y pintura" className="bg-slate-900">Chapa y pintura</option>
                  <option value="Luces altas y bajas" className="bg-slate-900">Luces altas y bajas</option>
                  <option value="Luces de posicion" className="bg-slate-900">Luces de posición</option>
                  <option value="Luces de giro" className="bg-slate-900">Luces de giro</option>
                  <option value="Luces de freno" className="bg-slate-900">Luces de freno</option>
                  <option value="Otro" className="bg-slate-900">Otro / Varios</option>
                </select>
             </div>
             <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Fecha</label>
                <input name="fecha" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-white" />
             </div>
             <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Kilometraje del Tablero</label>
                <input name="kilometraje" type="number" placeholder="Ej: 155000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-white" />
             </div>
             <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Costo ($)</label>
                <input name="costo" type="number" placeholder="Ej: 85000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-white" />
             </div>
             <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Taller / Proveedor (Opcional)</label>
                <input name="taller" type="text" placeholder="Ej: Neumáticos Centro" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-white" />
             </div>
             <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Descripción del Trabajo</label>
                <textarea name="descripcion" rows="2" placeholder="Detalles de filtros cambiados, repuestos..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm resize-none text-white"></textarea>
             </div>
           </div>
           <div className="flex justify-end mt-4">
              <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-105 disabled:opacity-50">
                 {loading ? "Guardando..." : "Guardar Registro"}
              </button>
           </div>
        </form>
      )}

      <div className="space-y-4">
         {mantenimientos.length === 0 ? (
           <p className="text-gray-400 text-center uppercase tracking-widest text-[10px] font-bold py-10">Sin registros de mantenimiento</p>
         ) : mantenimientos.map(m => (
            <div key={m.id} className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/10 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
               <div>
                  <div className="flex items-center gap-3 mb-1">
                     <h4 className="font-black uppercase text-gray-900 dark:text-white tracking-tight">{m.tipoServicio}</h4>
                     {m.kilometraje && (
                       <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">{m.kilometraje.toLocaleString()} km</span>
                     )}
                  </div>
                  {m.descripcion && <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{m.descripcion}</p>}
                  {m.taller && <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 border-l-2 border-gray-300 dark:border-gray-700 pl-2">Taller: {m.taller}</p>}
               </div>
               <div className="flex flex-col items-end whitespace-nowrap">
                  {m.costo && <div className="text-lg font-black text-gray-900 dark:text-gray-100">${m.costo.toLocaleString()}</div>}
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(m.fecha).toLocaleDateString("es-AR")}</div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
