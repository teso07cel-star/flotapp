"use client";
import { useState } from "react";
import DynamicMap from "./DynamicMap";

export default function DriverAnalyticsClient({ driverStats }) {
  const [selectedDriver, setSelectedDriver] = useState(null);

  return (
    <div className="flex flex-col">
      {/* Lista de Conductores */}
      <div className="grid grid-cols-1 last:border-b-0">
        {driverStats.map((d, i) => (
          <div key={i} className="border-b border-slate-200 last:border-0 overflow-hidden">
            <button 
              onClick={() => setSelectedDriver(selectedDriver === d.nombre ? null : d.nombre)}
              className={`w-full flex items-center justify-between p-8 transition-all hover:bg-slate-100 ${selectedDriver === d.nombre ? "bg-blue-50" : "bg-white"}`}
            >
              <div className="flex items-center gap-6">
                 <div className={`w-3 h-3 rounded-full ${selectedDriver === d.nombre ? "bg-blue-600 animate-pulse" : "bg-slate-300"}`} />
                 <span className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">{d.nombre}</span>
              </div>
              <div className="flex items-center gap-8">
                 <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Recorrido</p>
                    <p className="font-black italic text-xl">{d.totalKm.toLocaleString()} KM</p>
                 </div>
                 <div className={`transition-transform duration-300 ${selectedDriver === d.nombre ? "rotate-180" : ""}`}>
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                 </div>
              </div>
            </button>

            {/* Desglose Táctico al Expandir */}
            {selectedDriver === d.nombre && (
              <div className="p-10 bg-white space-y-10 border-t border-blue-100 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   {/* Info Detallada */}
                   <div className="space-y-8">
                      <div className="flex items-center gap-4">
                         <h4 className="text-lg font-black uppercase italic tracking-tighter text-blue-800">Hoja de Ruta Personal</h4>
                         <div className="h-[1px] flex-1 bg-blue-100" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 font-sans">
                         <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Unidades Operadas</p>
                            <p className="text-sm font-black italic text-slate-900">{d.vehicles.join(" / ")}</p>
                         </div>
                         <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Visitas</p>
                            <p className="text-sm font-black italic text-slate-900">{d.totalTrips} Sucursales</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nodos Impactados (Frecuencia):</p>
                         <div className="flex flex-wrap gap-2">
                            {d.branchesVisited.map((b, idx) => (
                              <span key={idx} className="bg-slate-950 text-white text-[9px] font-black uppercase px-4 py-2 rounded-lg italic tracking-[0.1em] flex items-center gap-2">
                                 <span>{b.nombre}</span>
                                 <span className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[7px] not-italic">{b.visitas}</span>
                              </span>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Mapa Táctico Individual */}
                   <div className="h-[350px] border-2 border-slate-900 rounded-[2rem] overflow-hidden shadow-sm relative">
                      <DynamicMap branchesData={d.branchDetails} />
                      <div className="absolute top-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest z-[1000] shadow-xl">
                         Auditoría: {d.branchDetails.length} Puntos
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
