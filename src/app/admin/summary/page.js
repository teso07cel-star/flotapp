export const dynamic = 'force-dynamic';
import { getMonthlySummary } from "@/lib/appActions";
import Link from "next/link";
import ShareReportButton from "@/components/ShareReportButton";
import DynamicMap from "@/components/DynamicMap";
import PrintButton from "@/components/PrintButton";

export default async function MonthlySummary({ searchParams }) {
  try {
    const params = await searchParams;
    const month = params.month ? parseInt(params.month) : new Date().getMonth();
    const year = params.year ? parseInt(params.year) : new Date().getFullYear();

    const res = await getMonthlySummary(month, year);
    const { summary, totalFleetVisits, mapBranches } = res && res.success ? res.data : { summary: [], totalFleetVisits: 0, mapBranches: [] };

    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const summaryList = Array.isArray(summary) ? summary : [];
    const totalFlotaGastos = summaryList.reduce((sum, v) => sum + (Number(v.totalGastos) || 0), 0);
    const totalFlotaKm = summaryList.reduce((sum, v) => sum + (Number(v.kmRecorridos) || 0), 0);

    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-blue-500/5 blur-[120px] pointer-events-none -z-10" />
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="h-1 w-12 bg-blue-500 rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/80">Inteligencia de Flota v2.0 Protocolo de Rescate</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter mb-2 uppercase italic text-white drop-shadow-2xl">
              Estado de <span className="text-blue-500">Flota</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Monitoreo Operativo y Financiero en Vivo
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <ShareReportButton 
              title="Resumen Mensual FlotApp"
              data={{ 
                summary: summaryList, 
                totalFleetVisits: totalFleetVisits || 0, 
                monthName: months[month] || "Mes",
                year: year || 2026 
              }}
              type="monthly"
            />
            
            <div className="flex items-center gap-2">
              <PrintButton />
            </div>

            <form className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-xl p-3 rounded-3xl border border-white/10 shadow-2xl">
              <select 
                name="month"
                defaultValue={month}
                className="bg-transparent text-xs font-black uppercase tracking-widest outline-none px-4 py-2 border-r border-white/5 text-white"
              >
                {months.map((m, i) => (
                  <option key={m} value={i} className="bg-slate-900 text-white">{m}</option>
                ))}
              </select>
              <input 
                name="year"
                type="number" 
                defaultValue={year}
                className="bg-transparent text-xs font-black w-20 outline-none px-4 text-white"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all transform active:scale-95 shadow-lg shadow-blue-500/20">
                Sincronizar
              </button>
            </form>
          </div>
        </div>

        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
           <div className="relative bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-4 border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 mb-4">
                 <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400">Cartografía Operacional - v2.0</h2>
                 <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Cobertura Total
                 </div>
              </div>
              <DynamicMap branchesData={mapBranches || []} />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[3.5rem] p-12 text-white shadow-3xl shadow-blue-500/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Actividad Métrica Total</p>
                <h2 className="text-6xl font-black tracking-tighter mb-2 tabular-nums">
                  {(totalFlotaKm || 0).toLocaleString()} <span className="text-xl opacity-50">KM</span>
                </h2>
                <p className="text-blue-100 font-bold text-[10px] tracking-widest opacity-80 uppercase bg-white/10 inline-block px-3 py-1 rounded-full">{months[month]} {year}</p>
              </div>
              <div className="absolute top-0 right-0 p-10 opacity-20 scale-150 transition-transform group-hover:rotate-12 duration-700">
                 <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
              </div>
           </div>

           <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Eficiencia Logística</p>
                <h2 className="text-6xl font-black tracking-tighter mb-2 text-white tabular-nums">{(totalFleetVisits || 0).toLocaleString()}</h2>
                <p className="text-blue-500 font-bold text-[10px] tracking-widest uppercase">Visitas a Sucursales</p>
              </div>
           </div>

           <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Caja Operativa</p>
                <h2 className="text-6xl font-black tracking-tighter mb-2 text-white tabular-nums">
                  <span className="text-2xl text-blue-500 mr-1">$</span>{(totalFlotaGastos || 0).toLocaleString()}
                </h2>
                <p className="text-blue-500 font-bold text-[10px] tracking-widest uppercase">Gastos Consolidados</p>
              </div>
           </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl">
          <div className="px-12 py-10 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tighter text-white">Desglose por Unidades Operativas</h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{summaryList.length} Vehículos Activos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  <th className="p-8 pl-12">Unidad / Patente</th>
                  <th className="p-8">Recorrido del Mes</th>
                  <th className="p-8">Inversión</th>
                  <th className="p-8">Estatus Actividad</th>
                  <th className="p-8 text-right pr-12">Expediente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {summaryList.length === 0 ? (
                  <tr><td colSpan="5" className="p-24 text-center text-slate-500 font-black uppercase tracking-[0.3em] italic">Sin registros para el ciclo actual.</td></tr>
                ) : summaryList.map((v) => (
                  <tr key={v.id} className="hover:bg-blue-500/5 transition-all duration-300 group">
                    <td className="p-8 pl-12">
                      <div className="font-mono font-black text-2xl tracking-tighter bg-slate-800/80 px-6 py-2 rounded-2xl inline-block border border-white/10 text-white shadow-xl group-hover:border-blue-500/50 group-hover:text-blue-400 transition-all">
                        {v.patente}
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="font-black text-3xl tracking-tighter text-white mb-1 tabular-nums">
                        {(Number(v.kmRecorridos) || 0).toLocaleString()}
                        <span className="text-[10px] text-slate-500 font-black uppercase ml-2 tracking-widest">km</span>
                      </div>
                      <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, ((Number(v.kmRecorridos) || 0) / 5000) * 100)}%` }} />
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="font-black text-2xl tracking-tighter text-blue-500 mb-1 tabular-nums">$ {(Number(v.totalGastos) || 0).toLocaleString()}</div>
                      <Link href={`/admin/vehicles/${v.id}/expenses`} className="text-[9px] font-black uppercase text-slate-500 hover:text-white transition-colors tracking-widest">Auditar Gastos &rarr;</Link>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col gap-2">
                         <span className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20 inline-block w-fit">
                           {v.visitasSucursales || 0} Visitas a Red
                         </span>
                         <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-2">CONDUCTOR: {v.ultimoConductor || "Sin Asignar"}</span>
                      </div>
                    </td>
                    <td className="p-8 pr-12 text-right">
                       <Link href={`/admin/vehicles/${v.id}`} className="inline-flex h-12 px-8 items-center bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl">
                         Ver Ficha
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex justify-center pt-8">
          <Link href="/admin" className="text-[10px] font-black text-slate-500 hover:text-blue-500 transition-all uppercase tracking-[0.5em] flex items-center gap-4 group">
            <div className="h-px w-12 bg-slate-800 group-hover:w-20 group-hover:bg-blue-500 transition-all" />
            Retorno al Centro de Mando
            <div className="h-px w-12 bg-slate-800 group-hover:w-20 group-hover:bg-blue-500 transition-all" />
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("CRASH FATAL EN RESUMEN MENSUAL:", error);
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="bg-red-950/20 border-2 border-dashed border-red-500/50 rounded-[3rem] p-16 max-w-2xl w-full text-center backdrop-blur-xl">
           <div className="w-20 h-20 bg-red-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/50 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
           </div>
           <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">¡ALERTA DE SISTEMA!</h2>
           <p className="text-red-400 font-bold uppercase text-[10px] tracking-widest mb-8">Señor X, hemos detectado una excepción crítica en el renderizado</p>
           <div className="bg-black/50 p-6 rounded-2xl text-left border border-white/5 mb-8">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-2">Mensaje Técnico:</p>
              <code className="text-red-500 font-mono text-xs break-all">{error.message || "Error desconocido en el servidor"}</code>
           </div>
           <Link href="/admin" className="inline-block bg-white text-black px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all">
             Volver al Cuartel General
           </Link>
        </div>
      </div>
    );
  }
}
