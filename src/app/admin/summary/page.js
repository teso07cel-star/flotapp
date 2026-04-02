export const dynamic = 'force-dynamic';
import { getMonthlySummary } from "@/lib/actions";
import Link from "next/link";
import ShareReportButton from "@/components/ShareReportButton";

export default async function MonthlySummary({ searchParams }) {
  const params = await searchParams;
  const month = params.month ? parseInt(params.month) : new Date().getMonth();
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();

   const res = await getMonthlySummary(month, year);
   const { summary, totalFleetVisits } = res.success ? res.data : { summary: [], totalFleetVisits: 0 };

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const totalFlotaGastos = summary.reduce((sum, v) => sum + v.totalGastos, 0);
  const totalFlotaKm = summary.reduce((sum, v) => sum + v.kmRecorridos, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase italic text-blue-600 dark:text-blue-400">Estado de Flota</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">Rendimiento Operativo y Financiero</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
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
        </div>
        
        <form className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/5">
          <select 
            name="month"
            defaultValue={month}
            className="bg-transparent text-sm font-bold uppercase tracking-wider outline-none p-2 border-r border-gray-100 dark:border-gray-800"
          >
            {months.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <input 
            name="year"
            type="number" 
            defaultValue={year}
            className="bg-transparent text-sm font-bold w-16 outline-none p-2"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all">Filtrar</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-blue-100 text-xs font-black uppercase tracking-[0.2em] mb-4">Uso de Flota (Total)</p>
              <h2 className="text-5xl font-black tracking-tighter mb-2">{totalFlotaKm.toLocaleString()} <span className="text-lg">KM</span></h2>
              <p className="text-blue-200 font-bold text-sm tracking-tight opacity-80 uppercase">{months[month]} {year}</p>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10 scale-150"><svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
         </div>

         <div className="bg-white dark:bg-gray-900 border-2 border-blue-600/10 rounded-[3rem] p-10 shadow-2xl shadow-black/5 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Visitas Generales</p>
              <h2 className="text-5xl font-black tracking-tighter mb-2 text-blue-600 dark:text-blue-400">{totalFleetVisits.toLocaleString()}</h2>
              <p className="text-gray-400 font-bold text-sm tracking-tight opacity-80 uppercase">Logística Mensual</p>
            </div>
         </div>

         <div className="bg-white dark:bg-gray-900 border-2 border-blue-600/10 rounded-[3rem] p-10 shadow-2xl shadow-black/5 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Inversión Operativa</p>
              <h2 className="text-5xl font-black tracking-tighter mb-2 text-blue-600 dark:text-blue-400">$ {totalFlotaGastos.toLocaleString()}</h2>
              <p className="text-gray-400 font-bold text-sm tracking-tight opacity-80 uppercase">Gasto Consolidado</p>
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <th className="p-8 pl-12">Unidad</th>
                <th className="p-8">Recorrido</th>
                <th className="p-8">Egresos</th>
                <th className="p-8">Actividad</th>
                <th className="p-8 text-right pr-12">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-sans">
              {summary.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-black uppercase tracking-widest">No hay datos para este período.</td></tr>
              ) : summary.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                  <td className="p-8 pl-12">
                    <div className="font-mono font-black text-xl tracking-tighter bg-gray-100 dark:bg-gray-800 px-4 py-1.5 rounded-xl inline-block border border-gray-200 dark:border-gray-700">{v.patente}</div>
                  </td>
                  <td className="p-8">
                    <div className="font-black text-xl tracking-tight leading-none">{v.kmRecorridos.toLocaleString()} <span className="text-[10px] text-gray-400 font-black uppercase ml-1">km</span></div>
                  </td>
                  <td className="p-8">
                    <div className="font-black text-xl tracking-tight text-blue-600 dark:text-blue-400 leading-none">$ {v.totalGastos.toLocaleString()}</div>
                    <div className="mt-1">
                       <Link href={`/admin/vehicles/${v.id}/expenses`} className="text-[9px] font-black uppercase text-blue-500 hover:underline tracking-widest">Ver Desglose &rarr;</Link>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-200/50 dark:border-blue-500/20">
                      {v.visitasSucursales} Visitas a Suc.
                    </span>
                  </td>
                  <td className="p-8 pr-12 text-right">
                     <Link href={`/admin/vehicles/${v.id}`} className="inline-flex h-10 px-6 items-center bg-gray-900 dark:bg-gray-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-black/20">
                       Ver Ficha
                     </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Link href="/admin" className="text-xs font-black text-gray-400 hover:text-blue-500 transition-colors uppercase tracking-[0.3em] flex items-center gap-3 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-2"><path d="m15 18-6-6 6-6"/></svg>
          REGRESAR AL PANEL PRINCIPAL
        </Link>
      </div>
    </div>
  );
}
