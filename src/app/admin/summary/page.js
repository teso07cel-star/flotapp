import { getMonthlySummary } from "@/lib/actions";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";

export default async function MonthlySummary({ searchParams }) {
  const params = await searchParams;
  const month = params.month ? parseInt(params.month) : new Date().getMonth();
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();

  const res = await getMonthlySummary(month, year);
  const { summary, totalFleetVisits, totalFleetKm, unitsUsed, pricingNote } = res.success 
    ? res.data 
    : { summary: [], totalFleetVisits: 0, totalFleetKm: 0, unitsUsed: 0, pricingNote: "" };

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const totalFlotaGastos = summary.reduce((sum, v) => sum + v.totalGastos, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 dark">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase italic text-blue-400">Inteligencia Logística</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest uppercase">Reporte Operativo Mensual</p>
        </div>
        
        <div className="flex items-center gap-4 no-print">
          <PrintButton />
        </div>
      </div>

      <div className="no-print space-y-4">
        <div className="flex items-center justify-between">
           <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Seleccionar Período</label>
           <form className="flex items-center gap-2">
              <input 
                name="year"
                type="number" 
                defaultValue={year}
                className="bg-gray-900 border border-gray-800 rounded-lg text-xs font-bold w-20 outline-none p-2 text-white text-center"
              />
              <button type="submit" className="bg-gray-800 text-gray-400 px-3 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest hover:text-white transition-all">Actualizar Año</button>
           </form>
        </div>
        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
          {months.map((m, i) => (
            <Link 
              key={m} 
              href={`/admin/summary?month=${i}&year=${year}`}
              className={`flex-none px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border ${
                month === i 
                  ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20" 
                  : "bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300"
              }`}
            >
              {m}
            </Link>
          ))}
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-3">Recorrido Total</p>
              <h2 className="text-4xl font-black tracking-tighter mb-1">{(totalFleetKm || 0).toLocaleString()} <span className="text-sm">KM</span></h2>
              <p className="text-blue-200 font-bold text-[10px] tracking-tight opacity-80 uppercase">{months[month]} {year}</p>
            </div>
            <div className="absolute top-0 right-0 p-6 opacity-10 scale-150"><svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
         </div>

         <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Visitas Logísticas</p>
              <h2 className="text-4xl font-black tracking-tighter mb-1 text-blue-400">{(totalFleetVisits || 0).toLocaleString()}</h2>
              <p className="text-gray-500 font-bold text-[10px] tracking-tight opacity-80 uppercase">Sucursales Alcanzadas</p>
            </div>
         </div>

         <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Unidades Activas</p>
              <h2 className="text-4xl font-black tracking-tighter mb-1 text-emerald-400">{unitsUsed || 0}</h2>
              <p className="text-gray-500 font-bold text-[10px] tracking-tight opacity-80 uppercase">Flota en Servicio</p>
            </div>
         </div>

         <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Inversión Total</p>
              <h2 className="text-4xl font-black tracking-tighter mb-1 text-blue-400">$ {(totalFlotaGastos || 0).toLocaleString()}</h2>
              <p className="text-gray-500 font-bold text-[10px] tracking-tight opacity-80 uppercase">Gastos de Operación</p>
            </div>
         </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-800">
                <th className="p-8 pl-12">Unidad</th>
                <th className="p-8">Recorrido</th>
                <th className="p-8">Egresos</th>
                <th className="p-8">Actividad</th>
                <th className="p-8 text-right pr-12">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-sans">
              {summary.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center text-gray-500 font-black uppercase tracking-widest">No hay datos para este período.</td></tr>
              ) : summary.map((v) => (
                <tr key={v.id} className="hover:bg-gray-800/50 transition-colors group">
                  <td className="p-8 pl-12">
                    <div className="font-mono font-black text-xl tracking-tighter bg-gray-800 px-4 py-1.5 rounded-xl inline-block border border-gray-700 text-white">{v.patente}</div>
                  </td>
                  <td className="p-8">
                    <div className="font-black text-xl tracking-tight leading-none text-white">{v.kmRecorridos.toLocaleString()} <span className="text-[10px] text-gray-500 font-black uppercase ml-1">km</span></div>
                  </td>
                  <td className="p-8">
                    <div className="font-black text-xl tracking-tight text-blue-400 leading-none">$ {v.totalGastos.toLocaleString()}</div>
                    <div className="mt-2">
                       <Link href={`/admin/vehicles/${v.id}/expenses`} className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-400 transition-colors tracking-widest">Ver Desglose &rarr;</Link>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="bg-blue-500/10 text-blue-300 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                      {v.visitasSucursales} Visitas a Suc.
                    </span>
                  </td>
                  <td className="p-8 pr-12 text-right">
                     <Link href={`/admin/vehicles/${v.id}`} className="inline-flex h-10 px-6 items-center bg-gray-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg border border-gray-700">
                       Ver Ficha
                     </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-blue-900/10 border border-blue-500/20 p-8 rounded-[2rem] text-center">
        <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">Próxima Actualización de Sistema</p>
        <p className="text-gray-400 text-[11px] font-medium max-w-2xl mx-auto italic">
          {pricingNote || "Aprox. 70 USD/mes (sujeto a variaciones de proveedores de IA y capacidad)"}
        </p>
      </div>

      <div className="flex justify-center">
        <Link href="/admin" className="text-xs font-black text-gray-500 hover:text-blue-400 transition-colors uppercase tracking-[0.3em] flex items-center gap-3 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-2"><path d="m15 18-6-6 6-6"/></svg>
          REGRESAR AL PANEL PRINCIPAL
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body, .dark { background: #000 !important; color: #fff !important; }
          .bg-gray-900 { background: #000 !important; }
          .border-gray-800 { border-color: #333 !important; }
          .text-blue-400 { color: #3b82f6 !important; }
        }
      `}} />
    </div>
  );
}

