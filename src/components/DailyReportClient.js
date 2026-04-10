"use client";

import { useState, useEffect } from "react";
import MapWrapper from "@/components/MapWrapper";

export default function DailyReportClient({ initialDate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/reports/daily?date=${selectedDate}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Error de conexión con el servidor de mapas.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedDate]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">Reporte Operativo Diario</h1>
          <p className="text-slate-500 font-medium">Análisis de trazabilidad y rendimiento de flota.</p>
        </div>
        
        <div className="bg-slate-900/60 p-4 rounded-[1.5rem] border border-white/5 shadow-xl flex items-center gap-4">
           <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Selector Temporal:</span>
           <input 
             type="date" 
             value={selectedDate}
             onChange={(e) => setSelectedDate(e.target.value)}
             className="bg-[#020617] border border-blue-500/30 rounded-xl px-4 py-2 text-white text-sm focus:border-blue-500 outline-none transition-all"
           />
        </div>
      </div>

      {loading ? (
        <div className="h-[600px] bg-slate-900/40 rounded-[2.5rem] flex flex-col items-center justify-center border border-dashed border-slate-800 animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Sincronizando coordenadas tácticas...</p>
        </div>
      ) : error ? (
        <div className="p-10 bg-red-500/5 border border-red-500/20 rounded-[2.5rem]">
           <h3 className="text-red-500 font-black uppercase mb-2">Falla de Enlace de Datos</h3>
           <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#020617] p-6 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Kilometraje Flota</p>
              <p className="text-3xl font-black text-white">{data.stats.totalKm} <span className="text-xs text-blue-500">KM</span></p>
            </div>
            <div className="bg-[#020617] p-6 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unidades Activas</p>
              <p className="text-3xl font-black text-white">{data.stats.uniqueVehicles}</p>
            </div>
            <div className="bg-[#020617] p-6 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Visitas Logísticas</p>
              <p className="text-3xl font-black text-white">{data.stats.totalVisits}</p>
            </div>
          </div>

          <MapWrapper registros={data.registros} />
          
          {/* TABLA DE DETALLE */}
          <div className="bg-[#020617]/40 rounded-[2.5rem] p-8 border border-white/5 overflow-hidden">
             <h3 className="text-xl font-black uppercase mb-6 tracking-tight">Detalle de Operaciones</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-4 text-[10px] uppercase font-black text-slate-500 tracking-widest">Operador</th>
                      <th className="pb-4 text-[10px] uppercase font-black text-slate-500 tracking-widest">Unidad</th>
                      <th className="pb-4 text-[10px] uppercase font-black text-slate-500 tracking-widest">KM Actual</th>
                      <th className="pb-4 text-[10px] uppercase font-black text-slate-500 tracking-widest">Ruta (Teórica)</th>
                      <th className="pb-4 text-[10px] uppercase font-black text-slate-500 tracking-widest">Desviación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(data.registros || []).map((r, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4">
                          <p className="text-xs font-black text-white uppercase">{r.nombreConductor}</p>
                          <p className="text-[9px] text-slate-500">{new Date(r.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} HS</p>
                        </td>
                        <td className="py-4 text-xs font-bold text-slate-300">
                          {r.vehiculo.patente}
                        </td>
                        <td className="py-4 text-xs font-bold text-white">
                          {r.kmActual} KM
                        </td>
                        <td className="py-4 text-xs font-bold text-blue-400">
                          {r.kmTeoricos} KM
                        </td>
                        <td className="py-4">
                           <span className={`text-[10px] font-black ${Math.abs(r.kmActual - (r.kmActual - r.kmTeoricos)) > 10 ? 'text-amber-500' : 'text-slate-400'}`}>
                              {Math.abs(r.kmActual - (r.kmActual - r.kmTeoricos)).toFixed(1)} KM
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
