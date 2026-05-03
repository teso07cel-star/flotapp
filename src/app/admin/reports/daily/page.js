"use client";

import { Suspense, useState, useEffect } from "react";
export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { getDailyReport } from "@/lib/actions";
import Link from "next/link";

function DailyReportContent() {
  const searchParams = useSearchParams();
  const dateStr = searchParams.get("date") || new Date().toISOString().split('T')[0];
  const [data, setData] = useState(null);

  useEffect(() => {
    getDailyReport(dateStr).then(res => {
      if (res.success) setData(res.data);
    });
  }, [dateStr]);

  if (!data) return <div className="min-h-screen bg-[#050b18] flex items-center justify-center text-blue-500 font-black uppercase tracking-widest text-xs">Iniciando Protocolo...</div>;

  const { registros } = data;

  return (
    <div className="min-h-screen bg-[#050b18] text-white flex flex-col items-center p-4 md:p-12 selection:bg-blue-500/30 font-sans overflow-x-hidden">
      
      <div className="w-full max-w-5xl space-y-20">
        
         <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-full bg-[#0a1428]/80 border-2 border-blue-500/20 backdrop-blur-xl text-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
               <h1 className="text-7xl font-black tracking-tighter uppercase mb-4 italic">LIBRO DE RUTA</h1>
               <div className="flex items-center justify-center gap-6">
                  <div className="h-[2px] w-16 bg-blue-600/50" />
                  <span className="text-2xl font-black uppercase tracking-[0.4em] text-blue-500 italic">REPORTE DIARIO</span>
                  <div className="h-[2px] w-16 bg-blue-600/50" />
               </div>
            </div>
         </div>

        <div className="space-y-10">
           <div className="bg-[#0a1428]/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-sm">
              <table className="w-full text-center border-collapse">
                 <thead>
                    <tr className="bg-white/5 text-[9px] font-black uppercase text-gray-500 border-b border-white/5">
                       <th className="p-8 text-left pl-14">Matrícula</th>
                       <th className="p-8">Kilometraje</th>
                       <th className="p-8 text-right pr-14">Operador</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {registros.map((row) => (
                      <tr key={row.id} className="group hover:bg-white/5 transition-colors">
                         <td className="p-10 pl-14 text-left font-black text-3xl italic tracking-widest text-white leading-none group-hover:text-blue-400 transition-colors">{row.vehiculo.patente}</td>
                         <td className="p-10 font-black text-2xl tracking-tighter text-blue-400">{row.kmActual.toLocaleString()} KM</td>
                         <td className="p-10 pr-14 text-right font-black uppercase text-xs text-gray-500">{row.nombreConductor}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        <div className="w-full max-w-sm mx-auto">
           <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-10 text-center">
                 <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Valor Proyectado</span>
                    <div className="text-4xl font-black">USD 70</div>
                 </div>
                 <div className="bg-[#050b18] p-4 rounded-2xl">
                    <span className="text-blue-500 font-black text-xl">+ 250%</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function DailyReport() {
  return (
    <Suspense><DailyReportContent /></Suspense>
  );
}
