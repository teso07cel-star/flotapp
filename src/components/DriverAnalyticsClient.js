"use client";

import { useState } from "react";
import DynamicMap from "./DynamicMap";

export default function DriverAnalyticsClient({ driverStats = [] }) {
  const [selectedDriver, setSelectedDriver] = useState(driverStats[0] || null);

  if (driverStats.length === 0) {
    return (
      <div className="p-20 text-center bg-slate-100 italic text-slate-400 font-sans">
        No hay datos de operaciones por conductor disponibles en este periodo.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-auto min-h-[600px] bg-white">
      {/* SIDEBAR DE CONDUCTORES */}
      <div className="w-full md:w-80 border-r-2 border-slate-900/5 bg-slate-50/50 p-6 space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Personal Certificado</h4>
        <div className="space-y-3">
          {driverStats.map((driver, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDriver(driver)}
              className={`w-full text-left p-6 rounded-2xl transition-all duration-300 border-2 ${
                selectedDriver?.nombre === driver.nombre
                  ? "bg-slate-950 border-slate-950 text-white shadow-xl translate-x-1"
                  : "bg-white border-transparent text-slate-600 hover:border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div>
                  <p className={`font-black text-xs uppercase italic tracking-tighter ${
                    selectedDriver?.nombre === driver.nombre ? "text-blue-400" : "text-slate-900"
                  }`}>
                    {driver.nombre}
                  </p>
                  <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest mt-1">Operador Logístico</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black ${
                    selectedDriver?.nombre === driver.nombre ? "bg-blue-500/20 text-blue-400" : "bg-slate-100 text-slate-400"
                }`}>
                  {driver.totalVisitas} HITS
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ÁREA DE VISUALIZACIÓN */}
      <div className="flex-1 p-10 flex flex-col space-y-10">
        {selectedDriver ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-100 pb-10">
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-600">Protocolo de Visualización</p>
                <h3 className="text-5xl font-black italic tracking-tighter uppercase text-slate-900">
                  Despliegue de {selectedDriver.nombre}
                </h3>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Frecuencia Mensual</p>
                  <p className="text-3xl font-black italic tracking-tighter text-slate-900">
                    {selectedDriver.totalVisitas} <span className="text-xs not-italic opacity-30">PARADAS</span>
                  </p>
                </div>
              </div>
            </div>

            {/* MAPA Y DESGLOSE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <div className="relative group">
                   <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
                      <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-slate-200 flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                         <p className="text-[8px] font-black uppercase tracking-widest">Punto Único</p>
                      </div>
                      <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-slate-200 flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                         <p className="text-[8px] font-black uppercase tracking-widest">Recurrencia (2)</p>
                      </div>
                      <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-slate-200 flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-red-600"></div>
                         <p className="text-[8px] font-black uppercase tracking-widest">Alta Recurrencia (3+)</p>
                      </div>
                   </div>
                   <DynamicMap branchesData={selectedDriver.paradas.map(p => ({ ...p, visitas: p.count }))} />
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Desglose Detallado</h4>
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {selectedDriver.paradas.sort((a,b) => b.count - a.count).map((parada, pIdx) => (
                    <div key={pIdx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between group hover:bg-slate-100 transition-colors">
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">{parada.nombre}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Geo: {parada.lat.toFixed(4)}, {parada.lng.toFixed(4)}</p>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        parada.count >= 3 ? "bg-red-600 text-white" : 
                        parada.count === 2 ? "bg-orange-500 text-white" : 
                        "bg-blue-100 text-blue-600"
                      }`}>
                        {parada.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-30 grayscale scale-90">
             <img src="/icons/admin_hud.png" className="w-32 h-32 brightness-0" />
             <p className="text-xs font-black uppercase tracking-[0.5em]">Seleccione un Operador para Iniciar Análisis</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #0f172a;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
