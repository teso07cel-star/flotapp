import { getMonthlySummary } from "@/lib/actions";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function MonthlySummary({ searchParams }) {
  const params = await searchParams;
  const month = params.month ? parseInt(params.month) : new Date().getMonth();
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();

  const res = await getMonthlySummary(month, year);
  const summary = res.success ? res.data : [];

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const totalFlotaGastos = summary.reduce((sum, v) => sum + v.totalGastos, 0);
  const totalFlotaKm = summary.reduce((sum, v) => sum + v.kmRecorridos, 0);

  return (
    <div className="min-h-screen bg-[#050b18] text-white p-4 md:p-8 space-y-12 animate-in fade-in duration-500 pb-20 selection:bg-blue-500/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 uppercase italic text-white leading-none">Estado de Flota</h1>
          <p className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] opacity-80 mt-2">INTELIGENCIA OPERATIVA Y FINANCIERA</p>
        </div>
        
        <form className="flex items-center gap-2 bg-[#0a1428] p-1.5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
          <select 
            name="month"
            defaultValue={month}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none px-4 py-3 border-r border-white/5 appearance-none cursor-pointer hover:text-blue-400 transition-colors"
          >
            {months.map((m, i) => (
              <option key={m} value={i} className="bg-[#0a1428]">{m}</option>
            ))}
          </select>
          <input 
            name="year"
            type="number" 
            defaultValue={year}
            className="bg-transparent text-[10px] font-black w-16 outline-none px-4 py-3 tracking-widest"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95">Sincronizar</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Kilometraje Total de Flota</p>
              <h2 className="text-7xl font-black tracking-tighter mb-4 italic leading-none">{totalFlotaKm.toLocaleString()} <span className="text-lg opacity-50 not-italic ml-2">KM</span></h2>
              <div className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{months[month]} {year}</span>
              </div>
            </div>
         </div>

         <div className="bg-[#0a1428]/40 border-2 border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group backdrop-blur-sm">
            <div className="relative z-10">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Inversión Mensual Consolidada</p>
              <h2 className="text-7xl font-black tracking-tighter mb-4 text-blue-500 italic leading-none">$ {totalFlotaGastos.toLocaleString()}</h2>
            </div>
         </div>
      </div>

      <div className="bg-[#0a1428]/40 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase text-gray-500 border-b border-white/5">
                <th className="p-10 pl-14">Unidad / Matrícula</th>
                <th className="p-10">Recorrido Total</th>
                <th className="p-10">Egresos</th>
                <th className="p-10">Actividad</th>
                <th className="p-10 text-right pr-14">Protocolo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {summary.map((v) => (
                <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-10 pl-14">
                    <div className="font-black text-3xl italic tracking-widest text-white leading-none group-hover:text-blue-400 transition-colors">{v.patente}</div>
                  </td>
                  <td className="p-10">
                    <div className="font-black text-2xl tracking-tighter leading-none text-gray-300">{v.kmRecorridos.toLocaleString()} <span className="text-[10px] text-gray-600 font-black uppercase ml-1">km</span></div>
                  </td>
                  <td className="p-10">
                    <div className="font-black text-2xl tracking-tighter text-blue-500 leading-none">$ {v.totalGastos.toLocaleString()}</div>
                  </td>
                  <td className="p-10 pr-14 text-right">
                     <Link href={`/admin/vehicles/${v.id}`} className="inline-flex h-12 px-8 items-center bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95">
                       Ficha Táctica
                     </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
