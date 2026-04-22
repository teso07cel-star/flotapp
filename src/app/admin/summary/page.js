export const dynamic = 'force-dynamic';
import { getMonthlyReport } from "@/lib/appActions";
import PrintButton from "@/components/PrintButton";
import ShareReportButton from "@/components/ShareReportButton";
import Link from "next/link";
import { MASTER_VEHICULOS } from "@/lib/constants";

export default async function MonthlySummary({ searchParams }) {
  const params = await searchParams;
  const month = params.month || new Date().getMonth() + 1;
  const year = params.year || new Date().getFullYear();

  let data = null;
  let errorStatus = null;

  try {
    const res = await getMonthlyReport(month, year);
    if (res.success) {
      data = res.data;
    } else {
      console.warn("Fallback en Reporte Mensual");
      data = { vehicles: MASTER_VEHICULOS.map(v => ({ ...v, totalKm: 0, totalTrips: 0 })), totalKm: 0, totalTrips: 0 };
      errorStatus = "FALLBACK";
    }
  } catch (error) {
    console.error("Error en Reporte Mensual:", error);
    data = { vehicles: MASTER_VEHICULOS.map(v => ({ ...v, totalKm: 0, totalTrips: 0 })), totalKm: 0, totalTrips: 0 };
    errorStatus = "CRITICAL";
  }

  const getVehicleIcon = (category) => {
    const cat = (category || "").toUpperCase();
    if (cat.includes("MOTO")) return "/icons/moto_tactic.png";
    if (cat.includes("PICKUP") || cat.includes("CAMIONETA")) return "/icons/pickup_tactic.png";
    return "/icons/etios_tactic_v2.png";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 md:p-12 animate-in fade-in duration-700 font-sans print:bg-white print:text-black">
      {/* HUD Header */}
      <div className="max-w-6xl mx-auto space-y-12">
        
        {errorStatus && (
           <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-3xl text-center">
              <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.3em] animate-pulse">
                Modo Auditoría de Respaldo Activo (Off-Grid)
              </p>
           </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-10 print:hidden">
          <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="h-0.5 w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-400">Métrica Auditoría v8.4.2</span>
             </div>
             <h1 className="text-7xl font-black italic tracking-tighter uppercase text-white drop-shadow-2xl">
               El <span className="text-blue-500">Libro</span>
             </h1>
             <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.5em] pl-1 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Consolidado Mensual de Operaciones
             </p>
          </div>

          <div className="flex flex-wrap gap-4">
             <ShareReportButton month={month} year={year} />
             <PrintButton />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-blue-600 rounded-[3rem] p-10 shadow-3xl shadow-blue-500/20 relative group overflow-hidden">
             <div className="relative z-10 space-y-2">
                <p className="text-blue-200/60 text-[9px] font-black uppercase tracking-widest italic">Recorrido Total Flota</p>
                <div className="flex items-end gap-3">
                  <h2 className="text-7xl font-black tracking-tighter leading-none">{data.totalKm.toLocaleString()}</h2>
                  <span className="text-xl font-bold bg-white/20 px-3 py-1 rounded-xl mb-1">KM</span>
                </div>
                <p className="text-blue-100/40 text-[8px] font-black uppercase mt-4">Consolidado de todas las unidades</p>
             </div>
             <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
             </div>
           </div>

           <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 group hover:border-blue-500/30 transition-all duration-500">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Visitas a Red Cumplidas</p>
              <h2 className="text-7xl font-black tracking-tighter text-white">{data.totalTrips}</h2>
              <p className="text-blue-500 font-bold text-[9px] uppercase mt-4 tracking-tighter">Puntos de control operados</p>
           </div>

           <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 group hover:border-blue-500/30 transition-all duration-500">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Caja Operativa Mensual</p>
              <div className="flex items-end gap-2 text-white">
                <span className="text-4xl font-bold text-blue-500 mb-2">$</span>
                <h2 className="text-7xl font-black tracking-tighter">0</h2>
              </div>
              <p className="text-amber-500 font-bold text-[9px] uppercase mt-4 tracking-tighter italic">Mantenimiento y combustible</p>
           </div>
        </div>

        {/* Detailed Table Section */}
        <div className="space-y-8 pt-8">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black uppercase tracking-[0.4em] text-white italic">Desglose Detallado por Unidad</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase">Estado de unidades activas: {data.vehicles?.length || 0}</p>
           </div>

           <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] overflow-hidden backdrop-blur-2xl">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-white/[0.02] text-blue-400 text-[10px] tracking-[0.4em] uppercase font-black border-b border-white/5">
                          <th className="p-10">Unidad</th>
                          <th className="p-10">Ocupación / Cat.</th>
                          <th className="p-10">Recorrido Mensual</th>
                          <th className="p-10">Inversión Auditada</th>
                          <th className="p-10">Rendimiento</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white">
                       {data.vehicles.length === 0 ? (
                          <tr>
                             <td colSpan="5" className="p-32 text-center text-slate-600 font-black uppercase tracking-[0.5em] text-[10px] italic">
                                Sin registros consolidados para el período.
                             </td>
                          </tr>
                       ) : data.vehicles.map((v) => (
                          <tr key={v.patente} className="group hover:bg-blue-600/5 transition-all print:text-black">
                             <td className="p-10">
                                <div className="flex items-center gap-8">
                                   <div className="hidden sm:block w-20 print:w-16 grayscale group-hover:grayscale-0 transition-all duration-500">
                                      <img src={getVehicleIcon(v.categoria)} alt={v.categoria} className="w-full object-contain" />
                                   </div>
                                   <div>
                                      <div className="font-mono font-black text-2xl tracking-widest text-white group-hover:text-blue-400 transition-colors">{v.patente}</div>
                                      <div className="text-[9px] font-black uppercase text-slate-500 mt-1 tracking-widest">{v.modelo || "S/D"}</div>
                                   </div>
                                </div>
                             </td>
                             <td className="p-10">
                                <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all">
                                   {v.categoria}
                                </span>
                             </td>
                             <td className="p-10">
                                <div className="space-y-1">
                                   <div className="text-2xl font-black">{(v.totalKm || 0).toLocaleString()} <span className="text-xs text-slate-600">KM</span></div>
                                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-500" style={{ width: `${Math.min((v.totalKm/1000)*100, 100)}%` }}></div>
                                   </div>
                                </div>
                             </td>
                             <td className="p-10">
                                <div className="text-2xl font-black text-slate-400">$ 0.00</div>
                             </td>
                             <td className="p-10">
                                <div className="text-[10px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-4 py-2 rounded-xl inline-block border border-emerald-500/20">ÓPTIMO</div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="py-20 text-center space-y-10 border-t border-white/5 print:hidden">
           <p className="text-[8px] font-black uppercase tracking-[1em] text-slate-600 opacity-50">
              Reporte Generado por Sistema FlotApp Tactical Division
           </p>
           <Link href="/admin" className="inline-block px-12 py-5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 hover:text-white hover:border-blue-500 transition-all">
              Retorno al Cuartel General
           </Link>
        </div>
      </div>
    </div>
  );
}
