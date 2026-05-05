"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { getAllVehiculos, getUltimosRegistros } from "@/lib/actions";

export const dynamic = "force-dynamic";

function AdminDashboardContent() {
  const [vehiculos, setVehiculos] = useState([]);
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    Promise.all([getAllVehiculos(), getUltimosRegistros(5)]).then(([vRes, rRes]) => {
      if (vRes.success) setVehiculos(vRes.data);
      if (rRes.success) setRegistros(rRes.data);
    });
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Panel de Inteligencia</h1>
          <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] opacity-80 mt-1">SISTEMA DE CONTROL CENTRAL V4.6</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
           
           <div className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                 Semáforo de Mantenimiento
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {vehiculos.map(v => {
                    const lastKm = v.registros?.[0]?.kmActual || 0;
                    
                    // Lógica del Semáforo
                    
                    // SERVICE: Avisa faltando 500km
                    let serviceStatus = "GREEN"; // GREEN, YELLOW, RED
                    let serviceText = "Al día";
                    if (v.proximoServiceKm) {
                       const diffService = v.proximoServiceKm - lastKm;
                       if (diffService <= 0) {
                          serviceStatus = "RED";
                          serviceText = `VENCIDO (Se pasó ${Math.abs(diffService)} km)`;
                       } else if (diffService <= 500) {
                          serviceStatus = "YELLOW";
                          serviceText = `PRÓXIMO (${diffService} km faltan)`;
                       } else {
                          serviceText = `Faltan ${diffService} km`;
                       }
                    } else {
                       serviceText = "No configurado";
                    }

                    // CUBIERTAS: Dice cuánto falta
                    let tiresStatus = "GREEN";
                    let tiresText = "Al día";
                    if (v.proximoCambioCubiertasKm) {
                       const diffTires = v.proximoCambioCubiertasKm - lastKm;
                       if (diffTires <= 0) {
                          tiresStatus = "RED";
                          tiresText = `URGENTE (Se pasó ${Math.abs(diffTires)} km)`;
                       } else if (diffTires <= 1000) {
                          tiresStatus = "YELLOW";
                          tiresText = `PRÓXIMO (${diffTires} km faltan)`;
                       } else {
                          tiresText = `Faltan ${diffTires} km`;
                       }
                    } else {
                       tiresText = "No configurado";
                    }

                    // VTV: Avisa faltando 30 días
                    let vtvStatus = "GREEN";
                    let vtvText = "Al día";
                    if (v.vtvVencimiento) {
                       const diffDaysVtv = Math.ceil((new Date(v.vtvVencimiento) - new Date()) / (1000 * 60 * 60 * 24));
                       if (diffDaysVtv <= 0) {
                          vtvStatus = "RED";
                          vtvText = `VENCIDA (Hace ${Math.abs(diffDaysVtv)} días)`;
                       } else if (diffDaysVtv <= 30) {
                          vtvStatus = "YELLOW";
                          vtvText = `VENCE EN ${diffDaysVtv} DÍAS`;
                       } else {
                          vtvText = `Vence en ${diffDaysVtv} días`;
                       }
                    } else {
                       vtvText = "No configurado";
                    }

                    // SEGURO: Avisa faltando 15 días
                    let seguroStatus = "GREEN";
                    let seguroText = "Al día";
                    if (v.seguroVencimiento) {
                       const diffDaysSeguro = Math.ceil((new Date(v.seguroVencimiento) - new Date()) / (1000 * 60 * 60 * 24));
                       if (diffDaysSeguro <= 0) {
                          seguroStatus = "RED";
                          seguroText = `VENCIDO (Hace ${Math.abs(diffDaysSeguro)} días)`;
                       } else if (diffDaysSeguro <= 15) {
                          seguroStatus = "YELLOW";
                          seguroText = `VENCE EN ${diffDaysSeguro} DÍAS`;
                       } else {
                          seguroText = `Vence en ${diffDaysSeguro} días`;
                       }
                    } else {
                       seguroText = "No configurado";
                    }

                    const getStatusColor = (status) => {
                       if (status === "RED") return "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]";
                       if (status === "YELLOW") return "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]";
                       return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
                    };

                    const isDanger = [serviceStatus, tiresStatus, vtvStatus, seguroStatus].includes("RED") || 
                                     [serviceStatus, tiresStatus, vtvStatus, seguroStatus].includes("YELLOW");

                    return (
                       <div key={v.id} className={`bg-[#0f172a] border ${isDanger ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10'} rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:border-blue-500/30 group`}>
                          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-blue-500/50"></div>
                          <Link href={`/admin/vehicles/${v.id}`} className="block">
                             <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                                <div>
                                   <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Móvil</p>
                                   <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{v.patente}</h3>
                                </div>
                                <div className="text-right">
                                   <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Kilometraje Actual</p>
                                   <p className="text-xl font-bold text-blue-400 font-mono">{lastKm.toLocaleString()} KM</p>
                                </div>
                             </div>

                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-3 h-3 rounded-full ${getStatusColor(serviceStatus)} transition-colors duration-500`}></div>
                                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Service</span>
                                   </div>
                                   <span className={`text-[10px] font-bold uppercase tracking-widest ${serviceStatus === 'RED' ? 'text-red-400' : serviceStatus === 'YELLOW' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                      {serviceText}
                                   </span>
                                </div>

                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-3 h-3 rounded-full ${getStatusColor(tiresStatus)} transition-colors duration-500`}></div>
                                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Cubiertas</span>
                                   </div>
                                   <span className={`text-[10px] font-bold uppercase tracking-widest ${tiresStatus === 'RED' ? 'text-red-400' : tiresStatus === 'YELLOW' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                      {tiresText}
                                   </span>
                                </div>

                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-3 h-3 rounded-full ${getStatusColor(vtvStatus)} transition-colors duration-500`}></div>
                                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest">VTV</span>
                                   </div>
                                   <span className={`text-[10px] font-bold uppercase tracking-widest ${vtvStatus === 'RED' ? 'text-red-400' : vtvStatus === 'YELLOW' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                      {vtvText}
                                   </span>
                                </div>

                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-3 h-3 rounded-full ${getStatusColor(seguroStatus)} transition-colors duration-500`}></div>
                                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Seguro</span>
                                   </div>
                                   <span className={`text-[10px] font-bold uppercase tracking-widest ${seguroStatus === 'RED' ? 'text-red-400' : seguroStatus === 'YELLOW' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                      {seguroText}
                                   </span>
                                </div>
                             </div>
                          </Link>
                       </div>
                    );
                 })}
              </div>
           </div>
           
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense><AdminDashboardContent /></Suspense>
  );
}
