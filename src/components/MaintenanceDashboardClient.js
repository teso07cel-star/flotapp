"use client";
import { useState } from "react";
import Link from "next/link";

export default function MaintenanceDashboardClient({ vehiculos }) {
  const [searchTerm, setSearchTerm] = useState("");

  const getDaysDiff = (dateStr) => {
    if (!dateStr) return null;
    const now = new Date();
    const date = new Date(dateStr);
    const diffTime = date - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const getSemaphoreColor = (days) => {
    if (days === null) return "bg-gray-200 dark:bg-gray-800 text-gray-500";
    if (days < 0) return "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800";
    if (days <= 30) return "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
    return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
  };

  const getTireSemaphoreColor = (kmActual, ultimoCambio, limite) => {
    if (!kmActual || !ultimoCambio || !limite) return "bg-gray-200 dark:bg-gray-800 text-gray-500 border border-gray-300 dark:border-gray-700";
    const recorrido = kmActual - ultimoCambio;
    const faltante = limite - recorrido;

    if (faltante < 0) return "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 animate-pulse border-2 border-red-500";
    if (faltante <= 5000) return "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-500";
    return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-500/30";
  };

  const filteredVehiculos = vehiculos.filter(v => v.patente.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Buscador de Patentes */}
      <div className="relative max-w-md mb-8">
         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
         </div>
         <input
            type="text"
            placeholder="Buscar por Patente..."
            className="w-full bg-white dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl pl-12 pr-4 py-3 text-emerald-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVehiculos.map(v => {
           const lastLog = v.registros?.[0];
           const kmActual = lastLog?.kmActual || 0;
           const daysVTV = getDaysDiff(v.vtvVencimiento);
           const daysSeguro = getDaysDiff(v.seguroVencimiento);
           const tireColor = getTireSemaphoreColor(kmActual, v.ultimoCambioCubiertasKm, v.kmParaCambioCubiertas);

           const hasInspeccionMensual = v.inspecciones && v.inspecciones.length > 0;
           const fotoVehiculo = v.inspecciones?.[0]?.fotoFrente;

           // Lógica de ticket pendiente
           let pendingTicket = false;
           if (lastLog) {
               const nivelesBajos = ["Vacio", "1/4", "Medio"];
               if (nivelesBajos.includes(lastLog.nivelCombustible) && !lastLog.fotoTicketCombustible) {
                  pendingTicket = true;
               }
           }

           return (
             <div key={v.id} className="bg-white/60 dark:bg-emerald-900/20 backdrop-blur-md rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800/50 shadow-xl shadow-emerald-900/5 transition-all hover:shadow-2xl hover:-translate-y-1 relative">
               
               {/* Alarma de Ticket Pendiente */}
               {pendingTicket && (
                 <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg shadow-red-500/40 animate-pulse border-2 border-white dark:border-gray-900 z-10 flex items-center gap-1">
                   ⚠️ TICKET PENDIENTE
                 </div>
               )}

               <div className="flex justify-between items-start mb-6 border-b border-emerald-100 dark:border-emerald-800/50 pb-4">
                  <div className="flex items-center gap-4">
                     {/* Foto del auto */}
                     <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-emerald-100 dark:border-emerald-900 shrink-0">
                       {fotoVehiculo ? (
                          <img src={fotoVehiculo} alt="Vehículo" className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🚐</div>
                       )}
                     </div>

                     <div>
                        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white font-mono font-bold px-3 py-1.5 rounded-lg border border-emerald-700 shadow-inner inline-block mb-1">
                          {v.patente}
                        </div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block ml-2 ${v.tipo === 'EXTERNO' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {v.tipo}
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Odómetro</p>
                    <p className="font-mono text-xl font-black text-emerald-900 dark:text-emerald-50">{kmActual.toLocaleString()} <span className="text-xs">km</span></p>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center ${getSemaphoreColor(daysVTV)}`}>
                     <span className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-70">VTV</span>
                     <span className="font-bold text-lg leading-none">{daysVTV !== null ? daysVTV : '-'}</span>
                     <span className="text-[9px] uppercase tracking-widest mt-1 opacity-70">Días</span>
                  </div>
                  <div className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center ${getSemaphoreColor(daysSeguro)}`}>
                     <span className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-70">Seguro</span>
                     <span className="font-bold text-lg leading-none">{daysSeguro !== null ? daysSeguro : '-'}</span>
                     <span className="text-[9px] uppercase tracking-widest mt-1 opacity-70">Días</span>
                  </div>
                  <div className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden ${tireColor}`}>
                     <span className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-70 relative z-10">Cubiertas</span>
                     {v.ultimoCambioCubiertasKm ? (
                       <>
                          <span className="font-bold text-sm leading-none relative z-10">
                             {v.kmParaCambioCubiertas - (kmActual - v.ultimoCambioCubiertasKm)}
                          </span>
                          <span className="text-[8px] uppercase tracking-widest mt-1 opacity-70 relative z-10">Km Restantes</span>
                       </>
                     ) : (
                       <span className="font-bold text-xs relative z-10">Sin Datos</span>
                     )}
                  </div>
               </div>

               <div className="flex gap-3">
                 <Link 
                    href={`/admin/maintenance/${v.id}`}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm text-center py-3 rounded-xl transition-colors shadow-lg shadow-emerald-600/20 tracking-wide"
                  >
                    Ficha Técnica
                 </Link>
                 {v.tipo === 'EXTERNO' && (
                   <Link 
                      href={`/admin/maintenance/${v.id}/inspection`}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm text-center py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/20 tracking-wide flex items-center justify-center gap-2"
                    >
                      {!hasInspeccionMensual && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                      Fotos Mensuales
                   </Link>
                 )}
               </div>

             </div>
           )
        })}
        {filteredVehiculos.length === 0 && (
           <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 font-bold">
              No se encontraron vehículos con esa patente.
           </div>
        )}
      </div>
    </div>
  );
}
