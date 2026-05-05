"use client";

import { Suspense, useState, useEffect } from "react";
export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { getDailyReport, deleteRegistro } from "@/lib/actions";
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
  const dateObj = new Date(dateStr + "T00:00:00-03:00");
  const monthName = dateObj.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
  const year = dateObj.getFullYear();

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
                  <span className="text-2xl font-black uppercase tracking-[0.4em] text-blue-500 italic">{monthName} {year}</span>
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
                       <th className="p-6">Hora</th>
<th className="p-6">Operador</th>
<th className="p-6">Unidad</th>
<th className="p-6">Ruta / Nodos</th>
<th className="p-6">Odómetro</th>
                       
                       
                       
                    </tr>
                 </thead>
                 
                 <tbody className="divide-y divide-white/5">
                    {registros.map((row) => (
                      <tr key={row.id} className="group hover:bg-white/5 transition-colors text-center">
                         <td className="p-6 font-black text-blue-400">
                            {new Date(row.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                         </td>
                         <td className="p-6 font-black uppercase text-xs">{row.nombreConductor || 'Desconocido'}</td>
                         <td className="p-6 font-black italic text-xl">{row.vehiculo?.patente || "S/D"}</td>
                         <td className="p-6">
                            <div className="flex flex-wrap justify-center gap-2">
                               {row.sucursales?.length > 0 ? row.sucursales.map(s => (
                                  <span key={s.id} className="bg-blue-900/40 text-blue-300 text-[9px] px-2 py-1 rounded-md border border-blue-500/20">{s.nombre}</span>
                               )) : <span className="text-gray-600 text-[9px]">SIN NODOS</span>}
                            </div>
                         </td>
                         <td className="p-6 font-mono text-white text-lg">{row.kmActual}</td>

                         <td className="p-6 text-center">
                            <button 
                               onClick={async () => {
                                  if(confirm("¿Seguro de borrar este registro?")) {
                                     const delRes = await deleteRegistro(row.id); if(delRes.success) { alert("Registro eliminado"); window.location.reload(); } if(!delRes.success) alert("Error: " + delRes.error);
                                     window.location.reload();
                                  }
                               }}
                               className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                         </td>
                      </tr>
                    ))}
                    {registros.length === 0 && (
                       <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-black uppercase tracking-widest">Sin operaciones registradas para este día</td></tr>
                    )}
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
