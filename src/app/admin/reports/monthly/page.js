import { getMonthlySummary } from "@/lib/actions";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import DriverAnalyticsClient from "@/components/DriverAnalyticsClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MonthlyReport({ searchParams }) {
  const params = await searchParams;
  const now = new Date();
  // Forzamos Abril (3) si no se elige otro mes
  const month = params.month ? parseInt(params.month) : 3;
  const year = params.year ? parseInt(params.year) : 2026;

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const res = await getMonthlySummary(month, year);
  
  if (!res.success) {
    return <div className="p-10 text-red-500 font-black uppercase text-center">Error: {res.error}</div>;
  }

  const { summary, driverStats } = res.data;

  return (
    <div className="max-w-5xl mx-auto p-12 bg-white min-h-screen">
      <header className="text-center mb-20 border-b-4 border-slate-900 pb-10">
        <h1 className="text-7xl font-black italic uppercase tracking-tighter">Libro de Ruta</h1>
        <h2 className="text-2xl font-bold uppercase tracking-widest text-blue-600 mt-4">
          {monthNames[month]} {year}
        </h2>
        <p className="text-xs font-bold text-slate-400 mt-6 uppercase tracking-widest">Auditoría Operativa por Brian Ezequiel López</p>
      </header>

      <section className="mb-20">
        <h3 className="text-2xl font-black uppercase italic mb-10 border-l-8 border-slate-900 pl-4">I. Resumen de Flota</h3>
        <div className="border-4 border-slate-900 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white text-[10px] uppercase font-black">
              <tr>
                <th className="p-6">Unidad</th>
                <th className="p-6 text-center">KM Recorridos</th>
                <th className="p-6 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {summary.map((v, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-6 font-black text-3xl italic">{v.patente}</td>
                  <td className="p-6 text-center font-black text-2xl">{v.kmRecorridos.toLocaleString()}</td>
                  <td className="p-6 text-center font-bold text-emerald-600 uppercase">Óptimo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-black uppercase italic mb-10 border-l-8 border-blue-600 pl-4">II. Inteligencia por Conductor</h3>
        <div className="bg-slate-50 p-10 border-2 border-slate-200 rounded-[3rem]">
           <DriverAnalyticsClient driverStats={driverStats} />
        </div>
      </section>

      <div className="fixed bottom-10 right-10 flex gap-4 no-print">
        <PrintButton />
        <Link href="/admin" className="bg-slate-900 text-white px-8 py-4 rounded-full font-black uppercase text-xs">Volver</Link>
      </div>
    </div>
  );
}
