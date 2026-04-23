"use client";
import { useState } from "react";

/**
 * DriverStatusClient - Muestra el estado operativo de cada conductor en tiempo real.
 * Permite ver sus trazas del día seleccionado, sucursales visitadas y estado del turno.
 */
export default function DriverStatusClient({ choferes, dateString }) {
  const [search, setSearch] = useState("");

  const filtrados = choferes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (estado) => {
    if (estado === "ACTIVO") return "text-emerald-400 bg-emerald-900/30 border-emerald-800/40";
    if (estado === "CERRADO") return "text-slate-400 bg-slate-800/30 border-slate-700/40";
    return "text-amber-400 bg-amber-900/30 border-amber-800/40";
  };

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar conductor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all text-white"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest">
          No se encontraron conductores.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(chofer => (
            <div
              key={chofer.id}
              className="bg-slate-900/40 border border-slate-700 rounded-[2rem] p-5 shadow-lg hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-black text-white text-base uppercase tracking-tight">{chofer.nombre}</h3>
                  {chofer.patenteAsignada && (
                    <span className="text-[9px] font-black text-blue-400 uppercase bg-blue-900/30 px-2 py-0.5 rounded-lg mt-1 inline-block">
                      {chofer.patenteAsignada}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${getStatusColor(chofer.estadoHoy)}`}>
                  {chofer.estadoHoy || "S/D"}
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span className="font-bold uppercase tracking-wide">Registros hoy</span>
                  <span className="font-black text-white">{chofer.registrosHoy || 0}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-bold uppercase tracking-wide">Sucursales visitadas</span>
                  <span className="font-black text-white">{chofer.visitasHoy || 0}</span>
                </div>
                {chofer.ultimaUbicacion && (
                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Última ubicación:</p>
                    <p className="text-[10px] text-emerald-400 font-mono">{chofer.ultimaUbicacion}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
