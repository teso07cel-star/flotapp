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
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Comando Central</h1>
          <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] opacity-80 mt-2">SISTEMA DE CONTROL CENTRAL V4.6</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
           
           <div className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500">Alertas de Mantenimiento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {vehiculos.map(v => {
                    const lastKm = v.registros?.[0]?.kmActual || 0;
                    const serviceDue = v.proximoServiceKm && (v.proximoServiceKm - lastKm < 1000);
                    const tiresDue = v.ultimoCambioCubiertasKm && (lastKm - v.ultimoCambioCubiertasKm > (v.kmParaCambioCubiertas || 60000));
                    const vtvDue = v.vtvVencimiento && (new Date(v.vtvVencimiento) - new Date() < 1000 * 60 * 60 * 24 * 30);
                    const seguroDue = v.seguroVencimiento && (new Date(v.seguroVencimiento) - new Date() < 1000 * 60 * 60 * 24 * 15);

                    if (!serviceDue && !tiresDue && !vtvDue && !seguroDue) return null;

                    return (
                       <div key={v.id} className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-4 animate-pulse">
                          <div className="bg-amber-500 p-2 rounded-lg text-[#050b18]">
                             <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          </div>
                          <div>
                             <p className="text-sm font-black text-white italic uppercase tracking-widest">{v.patente}</p>
                             <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-1">
                                {serviceDue && "SERVICE INMINENTE • "}
                                {tiresDue && "REVISAR CUBIERTAS • "}
                                {vtvDue && "VTV POR VENCER • "}
                                {seguroDue && "REVISAR SEGURO"}
                             </p>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>

           <div className="bg-[#0a1428]/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-white/5 text-[9px] font-black uppercase text-gray-500 border-b border-white/5">
                       <th className="p-6 pl-10">Matrícula</th>
                       <th className="p-6">Kilometraje</th>
                       <th className="p-6 text-right pr-10">Ficha</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {vehiculos.map(v => (
                      <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                         <td className="p-6 pl-10 font-black text-xl italic tracking-widest text-white leading-none">{v.patente}</td>
                         <td className="p-6 font-black text-lg text-gray-400">{v.registros?.[0]?.kmActual?.toLocaleString() || "---"} KM</td>
                         <td className="p-6 pr-10 text-right">
                            <Link href={`/admin/vehicles/${v.id}`} className="text-blue-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">Ver Detalles</Link>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (<Suspense><AdminDashboardContent /></Suspense>);
}
