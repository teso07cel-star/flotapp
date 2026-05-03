import { getMonthlySummary } from "@/lib/actions";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function MonthlySummary({ searchParams }) {
  const params = await searchParams;
  const month = params.month ? parseInt(params.month) : new Date().getMonth();
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();

  const res = await getMonthlySummary(month, year);
  const summary = res.success ? res.data : [];

  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="min-h-screen bg-[#050b18] text-white p-4 md:p-8 space-y-12 animate-in fade-in duration-500 selection:bg-blue-500/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Estado de Flota</h1>
          <p className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] opacity-80 mt-2">INTELIGENCIA OPERATIVA</p>
        </div>
        
        <form className="flex items-center gap-2 bg-[#0a1428] p-1.5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
          <select name="month" defaultValue={month} className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none px-4 py-3 border-r border-white/5 appearance-none cursor-pointer hover:text-blue-400 transition-colors">
            {months.map((m, i) => (<option key={m} value={i} className="bg-[#0a1428]">{m}</option>))}
          </select>
          <input name="year" type="number" defaultValue={year} className="bg-transparent text-[10px] font-black w-16 outline-none px-4 py-3 tracking-widest" />
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-lg active:scale-95">Sincronizar</button>
        </form>
      </div>

      <div className="bg-[#0a1428]/40 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] font-black uppercase text-gray-500 border-b border-white/5">
              <th className="p-10 pl-14">Unidad</th>
              <th className="p-10">Kilometraje</th>
              <th className="p-10">Inversión</th>
              <th className="p-10 text-right pr-14">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {summary.map((v) => (
              <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-10 pl-14 font-black text-3xl italic tracking-widest text-white leading-none group-hover:text-blue-400 transition-colors">{v.patente}</td>
                <td className="p-10 font-black text-2xl tracking-tighter text-gray-300">{v.kmRecorridos.toLocaleString()} KM</td>
                <td className="p-10 font-black text-2xl tracking-tighter text-blue-500">$ {v.totalGastos.toLocaleString()}</td>
                <td className="p-10 pr-14 text-right">
                   <Link href={`/admin/vehicles/${v.id}`} className="inline-flex h-12 px-8 items-center bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl">Ver Ficha</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
