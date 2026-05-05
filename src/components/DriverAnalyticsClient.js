"use client";
import { useState } from "react";
import DynamicMap from "./DynamicMap";

export default function DriverAnalyticsClient({ driverStats = [] }) {
  const [selectedDriver, setSelectedDriver] = useState(null);

  return (
    <div className="flex flex-col">
      {/* Lista de Conductores */}
      <div className="grid grid-cols-1 last:border-b-0">
        {driverStats?.map((d, i) => (
          <div key={i} className="border-b border-white/5 last:border-0 overflow-hidden">
            <button 
              onClick={() => setSelectedDriver(selectedDriver === d.nombre ? null : d.nombre)}
              className={`w-full flex items-center justify-between p-8 transition-all hover:bg-[#0a1428] ${selectedDriver === d.nombre ? "bg-blue-900/30" : "bg-transparent"}`}
            >
              <div className="flex items-center gap-6">
                 <div className={`w-3 h-3 rounded-full ${selectedDriver === d.nombre ? "bg-blue-600 animate-pulse" : "bg-slate-300"}`} />
                 <span className="text-2xl font-black uppercase italic tracking-tighter text-white">{d.nombre}</span>
              </div>
              <div className="flex items-center gap-8">
                 <div className="text-right bg-blue-600 px-6 py-3 rounded-2xl shadow-lg border border-blue-500 hover:scale-105 transition-transform">
                    <p className="text-[9px] font-black uppercase text-blue-200 tracking-widest">Recorrido Total</p>
                    <p className="font-black italic text-3xl text-white">{d.totalKm.toLocaleString()} <span className="text-lg">KM</span></p>
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
              <div className="p-10 bg-transparent space-y-10 border-t border-blue-100 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   {/* Info Detallada */}
                   <div className="space-y-8">
                      <div className="flex items-center gap-4">
                         <h4 className="text-lg font-black uppercase italic tracking-tighter text-blue-800">Hoja de Ruta Personal</h4>
                         <div className="h-[1px] flex-1 bg-blue-100" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 font-sans">
                         <div className="p-6 bg-[#0a1428] rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Unidades Operadas</p>
                            <p className="text-sm font-black italic text-white">{(Array.isArray(d.vehicles) ? d.vehicles : []).join(" / ")}</p>
                         </div>
                         <div className="p-6 bg-[#0a1428] rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Visitas</p>
                            <p className="text-sm font-black italic text-white">{d.totalTrips} Sucursales</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nodos Impactados (Frecuencia):</p>
                         <div className="flex flex-wrap gap-2">
                            {d.branchDetails?.map((b, idx) => (
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
      
      {/* Rankings Globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16 border-t border-white/10 pt-10">
        <div className="bg-[#0a1428] rounded-3xl p-8 border border-white/5">
           <h4 className="text-lg font-black uppercase tracking-widest text-blue-500 mb-6 text-center">Top Sucursales</h4>
           <div className="space-y-4">
              {Object.entries(
                driverStats.reduce((acc, d) => {
                  d.branchDetails?.forEach(b => {
                    acc[b.nombre] = (acc[b.nombre] || 0) + b.visitas;
                  });
                  return acc;
                }, {})
              ).sort((a,b) => b[1] - a[1]).slice(0,15).map(([nombre, visitas], idx) => (
                <div key={idx} className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                  <span className="text-xs font-black uppercase text-white">{idx+1}. {nombre}</span>
                  <span className="text-xs font-black text-blue-400">{visitas} V</span>
                </div>
              ))}
           </div>
        </div>
        <div className="bg-[#0a1428] rounded-3xl p-8 border border-white/5">
           <h4 className="text-lg font-black uppercase tracking-widest text-blue-500 mb-6 text-center">Top Choferes</h4>
           <div className="space-y-4">
              {[...driverStats].sort((a,b) => b.totalTrips - a.totalTrips).map((d, idx) => (
                <div key={idx} className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                  <span className="text-xs font-black uppercase text-white">{idx+1}. {d.nombre}</span>
                  <span className="text-xs font-black text-blue-400">{d.totalTrips} VIAJES</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    
</div>
    </div>
  );
}
