export const dynamic = 'force-dynamic';
import { getMonthlySummary } from "@/lib/appActions";
import Link from "next/link";
import ShareReportButton from "@/components/ShareReportButton";
import DynamicMap from "@/components/DynamicMap";

export default async function MonthlySummary({ searchParams }) {
  const params = await searchParams;
  const month = params.month ? parseInt(params.month) : new Date().getMonth();
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();

   const res = await getMonthlySummary(month, year);
   const { summary, totalFleetVisits, mapBranches } = res.success ? res.data : { summary: [], totalFleetVisits: 0, mapBranches: [] };

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const totalFlotaGastos = summary.reduce((sum, v) => sum + v.totalGastos, 0);
  const totalFlotaKm = summary.reduce((sum, v) => sum + v.kmRecorridos, 0);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-blue-500/5 blur-[120px] pointer-events-none -z-10" />
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="h-1 w-12 bg-blue-500 rounded-full" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/80">Inteligencia de Flota v8.3 Protocolo Táctico</span>
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
              summary, 
              totalFleetVisits, 
              monthName: months[month],
              year 
            }}
            type="monthly"
          />
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="bg-white text-slate-900 px-5 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              Exportar PDF
            </button>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`Resumen de Flota v8.3 - ${months[month]} ${year}\nKilometraje Total: ${totalFlotaKm} KM\nGastos: $${totalFlotaGastos}`)}`}
              target="_blank"
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-xl flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              WhatsApp
            </a>
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
               <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400">Cartografía Operacional - B8.3</h2>
               <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Cobertura Total
               </div>
            </div>
            <DynamicMap branchesData={mapBranches} />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[3.5rem] p-12 text-white shadow-3xl shadow-blue-500/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Actividad Métrica Total</p>
              <h2 className="text-6xl font-black tracking-tighter mb-2 tabular-nums">
                {totalFlotaKm.toLocaleString()} <span className="text-xl opacity-50">KM</span>
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
              <h2 className="text-6xl font-black tracking-tighter mb-2 text-white tabular-nums">{totalFleetVisits.toLocaleString()}</h2>
              <p className="text-blue-500 font-bold text-[10px] tracking-widest uppercase">Visitas a Sucursales</p>
            </div>
         </div>

         <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Caja Operativa</p>
              <h2 className="text-6xl font-black tracking-tighter mb-2 text-white tabular-nums">
                <span className="text-2xl text-blue-500 mr-1">$</span>{totalFlotaGastos.toLocaleString()}
              </h2>
              <p className="text-blue-500 font-bold text-[10px] tracking-widest uppercase">Gastos Consolidados</p>
            </div>
         </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl">
        <div className="px-12 py-10 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tighter text-white">Desglose por Unidades Operativas</h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{summary.length} Vehículos Activos</span>
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
              {summary.length === 0 ? (
                <tr><td colSpan="5" className="p-24 text-center text-slate-500 font-black uppercase tracking-[0.3em] italic">Sin registros para el ciclo actual.</td></tr>
              ) : summary.map((v) => (
                <tr key={v.id} className="hover:bg-blue-500/5 transition-all duration-300 group">
                  <td className="p-8 pl-12">
                    <div className="font-mono font-black text-2xl tracking-tighter bg-slate-800/80 px-6 py-2 rounded-2xl inline-block border border-white/10 text-white shadow-xl group-hover:border-blue-500/50 group-hover:text-blue-400 transition-all">
                      {v.patente}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="font-black text-3xl tracking-tighter text-white mb-1 tabular-nums">
                      {v.kmRecorridos.toLocaleString()}
                      <span className="text-[10px] text-slate-500 font-black uppercase ml-2 tracking-widest">km</span>
                    </div>
                    <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (v.kmRecorridos / 5000) * 100)}%` }} />
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="font-black text-2xl tracking-tighter text-blue-500 mb-1 tabular-nums">$ {v.totalGastos.toLocaleString()}</div>
                    <Link href={`/admin/vehicles/${v.id}/expenses`} className="text-[9px] font-black uppercase text-slate-500 hover:text-white transition-colors tracking-widest">Auditar Gastos &rarr;</Link>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-2">
                       <span className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20 inline-block w-fit">
                         {v.visitasSucursales} Visitas a Red
                       </span>
                       <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-2">CONDUCTOR: {v.ultimoConductor}</span>
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
}
