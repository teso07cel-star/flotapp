"use client";
import { useState, useMemo } from "react";
import JourneyMap from "./JourneyMap";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function DriverStatusClient({ initialTraces = {} }) {
  const [selectedDriver, setSelectedDriver] = useState(Object.keys(initialTraces)[0] || "");
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);

  const drivers = Object.keys(initialTraces).sort();
  const currentTrace = initialTraces[selectedDriver] || [];

  // Adapt trace points for JourneyMap
  const mapData = useMemo(() => {
    return currentTrace.map((p, idx) => ({
      id: `${p.time}-${idx}`,
      lugarGuarda: `${p.lat}, ${p.lng}`,
      fecha: p.time,
      tipoReporte: p.type,
      vehiculo: { patente: p.patente }
    }));
  }, [currentTrace]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px] animate-in fade-in duration-700">
      {/* Sidebar de Selección */}
      <div className="w-full lg:w-80 bg-slate-900/40 border border-slate-700 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-700 bg-slate-900/60">
           <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Filtro Temporal</p>
           <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-4 italic">Estado Chofer</h2>
           <input 
              type="date" 
              value={dateStr}
              onChange={(e) => {
                 setDateStr(e.target.value);
                 window.location.href = `/admin/drivers/status?date=${e.target.value}`;
              }}
              className="w-full bg-[#020617] border-2 border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all uppercase"
           />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-black/20">
           {drivers.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
               <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
               <p className="text-[10px] font-black uppercase tracking-widest px-6">Sin señales activas en este período</p>
             </div>
           ) : (
             drivers.map(name => (
               <button 
                  key={name}
                  onClick={() => setSelectedDriver(name)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border-2 flex flex-col gap-1 group
                    ${selectedDriver === name 
                      ? 'bg-blue-600 border-blue-400 shadow-[0_10px_30px_rgba(37,99,235,0.2)]' 
                      : 'bg-slate-800/10 border-white/5 hover:border-slate-600 text-slate-400'}
                  `}
               >
                  <div className="flex items-center justify-between">
                     <span className={`text-xs font-black uppercase tracking-widest ${selectedDriver === name ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{name}</span>
                     {selectedDriver === name && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                  </div>
                  <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest">{initialTraces[name].length} Coordenadas</span>
               </button>
             ))
           )}
        </div>
      </div>

      {/* Visor de Mapa */}
      <div className="flex-1 bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden relative shadow-2xl">
         <div className="absolute top-6 left-6 z-10 p-5 bg-[#020617]/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl min-w-[200px]">
            <div className="flex items-center gap-3 mb-1">
               <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Trasmisión de Rastro</p>
            </div>
            <h3 className="text-white text-xl font-black uppercase italic tracking-tighter">{selectedDriver || "Seleccionar Unidad"}</h3>
            {currentTrace.length > 0 && (
               <p className="text-[9px] text-slate-500 font-bold uppercase mt-2 border-t border-white/5 pt-2">
                 Última Señal: {format(new Date(currentTrace[currentTrace.length-1].time), "HH:mm 'hs'", {locale: es})}
               </p>
            )}
         </div>

         <div className="w-full h-full min-h-[500px] z-0">
            <JourneyMap registros={mapData} />
         </div>
         
         <div className="absolute bottom-6 right-6 z-10 px-6 py-3 bg-black/80 backdrop-blur-sm rounded-full border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
            TACTICA Satellite Hub v4.0
         </div>
      </div>
    </div>
  );
}
