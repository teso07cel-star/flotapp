"use client";

import { Suspense, useState, useEffect } from "react";
export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { getDailyReport } from "@/lib/actions";
import Link from "next/link";

function DailyReportContent() {
  const searchParams = useSearchParams();
  const [dateStr, setDateStr] = useState(searchParams.get("date") || new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);

  useEffect(() => {
    getDailyReport(dateStr).then(res => {
      if (res.success) setData(res.data);
    });
  }, [dateStr]);

  if (!data) return <div className="min-h-screen bg-[#050b18] flex items-center justify-center text-blue-500 font-black uppercase tracking-widest">Iniciando Protocolo...</div>;

  const { registros, stats } = data;

  return (
    <div className="min-h-screen bg-[#050b18] text-white flex flex-col items-center p-4 md:p-12 selection:bg-blue-500/30 font-sans overflow-x-hidden">
      
      <div className="w-full max-w-5xl space-y-10">

        <div className="flex flex-col items-center justify-center mb-10 w-full animate-in fade-in zoom-in duration-500">
           <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-2">Seleccionar Día Operativo</label>
           <input 
              type="date" 
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="bg-[#0a1428] border-2 border-blue-500/30 text-white font-black text-xl rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-all text-center"
           />
        </div>
        
         <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-full bg-[#0a1428]/80 border-2 border-blue-500/20 backdrop-blur-xl text-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
               <h1 className="text-7xl font-black tracking-tighter uppercase mb-4 italic">LIBRO DE RUTA</h1>
               <div className="flex items-center justify-center gap-6">
                  <div className="h-[2px] w-16 bg-blue-600/50" />
                  <span className="text-2xl font-black uppercase tracking-[0.4em] text-blue-500 italic">MAYO 2026</span>
                  <div className="h-[2px] w-16 bg-blue-600/50" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mt-10">SISTEMA DE INTELIGENCIA OPERATIVA V4.6 PRO</p>
            </div>
         </div>

        <div className="space-y-10">
           <div className="flex items-center gap-4">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">I. RESUMEN OPERATIVO DE FLOTA</h2>
              <div className="h-[1px] flex-1 bg-gray-800" />
           </div>

           <div className="bg-[#0a1428]/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-sm">
              <table className="w-full text-center border-collapse">
                 <thead>
                    <tr className="bg-white/5 text-[9px] font-black uppercase text-gray-500 border-b border-white/5">
                       <th className="p-8">Unidades / Matrícula</th>
                       <th className="p-8">Estado Operativo</th>
                       <th className="p-8">Rendimiento Mensual</th>
                       <th className="p-8">Mantenimiento</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {registros.map((row) => (
                      <tr key={row.id} className="group hover:bg-white/5 transition-colors">
                         <td className="p-10 font-black text-2xl tracking-widest italic">{row.vehiculo.patente}</td>
                         <td className="p-10">
                            <span className="text-5xl font-black text-white leading-none">1</span>
                            <div className="text-[8px] font-black uppercase text-blue-500 mt-1">Status</div>
                         </td>
                         <td className="p-10">
                            <span className="text-5xl font-black text-white leading-none">{row.kmActual}</span>
                            <div className="text-[8px] font-black uppercase text-blue-500 mt-1">KM_MTH</div>
                         </td>
                         <td className="p-10">
                            <div className="inline-block px-4 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-black text-[10px] tracking-widest">
                               ÓPTIMO
                            </div>
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

export default function DailyReport() {
  return (
    <Suspense>
      <DailyReportContent />
    </Suspense>
  );
}
