"use client";
import { useState } from "react";
import Link from "next/link";
import VehicleIcon from "@/components/VehicleIcon";

export default function ControlMantenimientoClient({ vehiculos }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = vehiculos.filter(v => 
    v.patente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const internos = filtered.filter(v => v.tipo !== "EXTERNO");
  const externos = filtered.filter(v => v.tipo === "EXTERNO");

  const renderVehiculoCard = (vehiculo) => {
      // Color Logic for VTV 
      let vtvColor = "bg-gray-100 dark:bg-gray-800 text-gray-500";
      if (vehiculo.vtvDias !== null) {
         if (vehiculo.vtvDias < 0) vtvColor = "bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-900/30 text-red-600";
         else if (vehiculo.vtvDias <= 15) vtvColor = "bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-900/30 text-amber-600";
         else vtvColor = "bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900/20 text-emerald-600";
      }

      // Color Logic for Seguro
      let seguroColor = "bg-gray-100 dark:bg-gray-800 text-gray-500";
      if (vehiculo.seguroDias !== null) {
         if (vehiculo.seguroDias < 0) seguroColor = "bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-900/30 text-red-600";
         else if (vehiculo.seguroDias <= 15) seguroColor = "bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-900/30 text-amber-600";
         else seguroColor = "bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900/20 text-emerald-600";
      }

      return (
        <div key={vehiculo.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-5 shadow-xl shadow-black/5 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all group flex flex-col h-full">
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl text-gray-500">
                <VehicleIcon categoria={vehiculo.categoria} />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-xl uppercase tracking-tighter text-gray-900 dark:text-gray-100 bg-emerald-900 px-3 text-white rounded-xl py-0.5">{vehiculo.patente}</h2>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${vehiculo.tipo === "EXTERNO" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                  {vehiculo.tipo}
                </span>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Odómetro</p>
               <p className="text-sm font-black text-gray-800 dark:text-gray-200">{vehiculo.odometro.toLocaleString()} <span className="text-[10px]">km</span></p>
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

             <div className="bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
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
      <div className="relative max-w-md">
        <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder="Buscar por Patente..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
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
