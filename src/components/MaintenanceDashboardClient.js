"use client";
import Link from "next/link";

export default function MaintenanceDashboardClient({ vehiculos }) {

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {vehiculos.map(v => {
         const kmActual = v.registros?.[0]?.kmActual || 0;
         const daysVTV = getDaysDiff(v.vtvVencimiento);
         const daysSeguro = getDaysDiff(v.seguroVencimiento);
         const tireColor = getTireSemaphoreColor(kmActual, v.ultimoCambioCubiertasKm, v.kmParaCambioCubiertas);

         const hasInspeccionMensual = v.inspecciones && v.inspecciones.length > 0;

         return (
           <div key={v.id} className="bg-white/60 dark:bg-emerald-900/20 backdrop-blur-md rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800/50 shadow-xl shadow-emerald-900/5 transition-all hover:shadow-2xl hover:-translate-y-1">
             <div className="flex justify-between items-start mb-6 border-b border-emerald-100 dark:border-emerald-800/50 pb-4">
                <div className="flex items-center gap-3">
                   <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white font-mono font-bold px-3 py-1.5 rounded-lg border border-emerald-700 shadow-inner">
                     {v.patente}
                   </div>
                   <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${v.tipo === 'EXTERNO' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                     {v.tipo}
                   </span>
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
    </div>
  );
}
