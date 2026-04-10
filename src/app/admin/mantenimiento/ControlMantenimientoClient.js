import { useState } from "react";
import { resolveNovedad } from "@/lib/actions";
import { VehicleIcon } from "@/components/FuturisticIcons";

export default function ControlMantenimientoClient({ vehiculos, initialNovedades = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [novedades, setNovedades] = useState(initialNovedades);
  const [resolving, setResolving] = useState(null);

  const handleResolve = async (id) => {
    setResolving(id);
    const res = await resolveNovedad(id);
    if (res.success) {
      setNovedades(prev => prev.filter(n => n.id !== id));
    }
    setResolving(null);
  };

  const filtered = vehiculos.filter(v => 
    v.patente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const internos = filtered.filter(v => v.tipo !== "EXTERNO");
  const externos = filtered.filter(v => v.tipo === "EXTERNO");

  const renderVehiculoCard = (vehiculo) => {
      // Color Logic for VTV 
      let vtvColor = "bg-slate-800/50  text-gray-500";
      if (vehiculo.vtvDias !== null) {
         if (vehiculo.vtvDias < 0) vtvColor = "bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-900/30 text-red-600";
         else if (vehiculo.vtvDias <= 15) vtvColor = "bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-900/30 text-amber-600";
         else vtvColor = "bg-emerald-100 dark:bg-emerald-900/40 relative/30 border border-emerald-200 dark:border-emerald-900/20 text-emerald-600";
      }

      // Color Logic for Seguro
      let seguroColor = "bg-slate-800/50  text-gray-500";
      if (vehiculo.seguroDias !== null) {
         if (vehiculo.seguroDias < 0) seguroColor = "bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-900/30 text-red-600";
         else if (vehiculo.seguroDias <= 15) seguroColor = "bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-900/30 text-amber-600";
         else seguroColor = "bg-emerald-100 dark:bg-emerald-900/40 relative/30 border border-emerald-200 dark:border-emerald-900/20 text-emerald-600";
      }

      return (
        <div key={vehiculo.id} className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-[2rem] p-5 shadow-xl shadow-black/5 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all group flex flex-col h-full">
          
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-800/60 p-4 rounded-2xl text-blue-400 overflow-visible flex items-center justify-center">
                <VehicleIcon categoria={vehiculo.categoria} className="w-24 h-14" />
              </div>
              <div className="flex flex-col gap-1 items-start">
                {/* Tactical HUD Odometer */}
                <div className={`border px-2 py-1 rounded-lg shadow-inner backdrop-blur-md z-20 min-w-[80px] ${vehiculo.serviceAlert ? 'bg-red-500/20 border-red-500 animate-pulse' : 'bg-slate-950/80 border-slate-800'}`}>
                   <p className={`text-[7px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${vehiculo.serviceAlert ? 'text-red-400' : 'text-slate-500'}`}>
                     {vehiculo.serviceAlert ? 'URGENT SERVICE' : 'Odometer'}
                   </p>
                   <p className="text-[11px] font-black text-white leading-none">{vehiculo.odometro.toLocaleString()} <span className={vehiculo.serviceAlert ? 'text-red-500' : 'text-blue-500'}>KM</span></p>
                   {vehiculo.serviceAlert && (
                      <p className="text-[7px] font-black text-red-400 mt-1 uppercase">Prox: {vehiculo.proximoServiceKm.toLocaleString()}</p>
                   )}
                </div>
                
                <h2 className="font-black text-xl uppercase tracking-tighter text-slate-100 bg-emerald-900/60 px-3 text-white rounded-xl py-0.5 w-fit border border-emerald-500/20 shadow-lg mt-1">{vehiculo.patente}</h2>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md w-fit ${vehiculo.tipo === "EXTERNO" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                  {vehiculo.tipo}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6 flex-1">
             
             <div className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center ${vtvColor}`}>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">VTV</p>
               {vehiculo.vtvDias !== null ? (
                 <p className="text-xl font-black">{vehiculo.vtvDias}</p>
               ) : (
                 <p className="text-lg font-black">-</p>
               )}
               <p className="text-[8px] uppercase font-black opacity-50 mt-1">Días</p>
             </div>

             <div className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center ${seguroColor}`}>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">Seguro</p>
               {vehiculo.seguroDias !== null ? (
                 <p className="text-xl font-black">{vehiculo.seguroDias}</p>
               ) : (
                 <p className="text-lg font-black">-</p>
               )}
               <p className="text-[8px] uppercase font-black opacity-50 mt-1">Días</p>
             </div>

             <div className="bg-slate-800/50  text-gray-400 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
               <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-2">Cubiertas</p>
               <p className="text-xs font-black uppercase">{vehiculo.cubiertasEstado}</p>
             </div>

          </div>

          <Link href={`/admin/vehicles/${vehiculo.id}`} className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px] tracking-widest py-3.5 rounded-2xl transition-all shadow-md mt-auto">
            Ficha Técnica
          </Link>

        </div>
      );
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Alertas de Novedades Tácticas */}
      {novedades.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="flex items-center gap-4 mb-6 border-b border-red-500/10 pb-4">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white animate-pulse">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <div>
                 <h2 className="text-xl font-black text-red-500 uppercase italic tracking-tighter">Alarmas Operativas</h2>
                 <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">Observaciones de conductores pendientes de revisión</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {novedades.map((n) => (
                 <div key={n.id} className="bg-[#0f172a] border border-red-500/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                       <span className="text-4xl font-black italic">!</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                       <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded">{n.vehiculo?.patente || 'S/V'}</span>
                       <span className="text-[9px] text-slate-500 font-bold">{new Date(n.fecha).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-300 mb-4 italic leading-relaxed">"{n.novedades}"</p>
                    <div className="flex items-center justify-between mt-auto">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{n.nombreConductor}</span>
                       <button 
                         onClick={() => handleResolve(n.id)}
                         disabled={resolving === n.id}
                         className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-emerald-600/30"
                       >
                          {resolving === n.id ? 'Procesando...' : 'Solucionar'}
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      <div className="relative max-w-md">
        <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder="Buscar por Patente..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
        />
      </div>

      {internos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-widest text-emerald-800/60 dark:text-emerald-500/60 border-b border-emerald-100 dark:border-emerald-900/30 pb-2">Flota Interna</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internos.map(renderVehiculoCard)}
          </div>
        </div>
      )}

      {externos.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-black uppercase tracking-widest text-purple-800/60 dark:text-purple-400/60 border-b border-purple-100 dark:border-purple-900/30 pb-2">Vehículos Externos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {externos.map(renderVehiculoCard)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">
          No se encontraron vehículos.
        </div>
      )}
    </div>
  );
}
