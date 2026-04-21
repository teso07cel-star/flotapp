import { getMonthlySummary } from "@/lib/appActions";
import Link from "next/link";
import DynamicMap from "@/components/DynamicMap";
import PrintButton from "@/components/PrintButton";

export default async function MonthlyReport({ searchParams }) {
  const params = await searchParams;
  const now = new Date();
  const month = params.month ? parseInt(params.month) : now.getMonth();
  const year = params.year ? parseInt(params.year) : now.getFullYear();

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const res = await getMonthlySummary(month, year);
  
  if (!res.success) {
    return <div className="p-10 text-red-500">Error cargando el reporte: {res.error}</div>;
  }

  const { summary, totalFleetVisits, mapBranches } = res.data;
  const totalKm = summary.reduce((acc, v) => acc + v.kmRecorridos, 0);
  const totalSpent = summary.reduce((acc, v) => acc + v.totalSpent, 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 sm:p-12 font-serif selection:bg-blue-100 print:p-0">
      {/* Portada del Libro */}
      <div className="max-w-4xl mx-auto border-4 border-slate-900 p-12 mb-20 text-center relative overflow-hidden bg-slate-50 shadow-2xl">
         <div className="absolute top-0 left-0 w-20 h-20 border-t-8 border-l-8 border-slate-900" />
         <div className="absolute bottom-0 right-0 w-20 h-20 border-b-8 border-r-8 border-slate-900" />
         
         <p className="text-[10px] font-sans font-black uppercase tracking-[0.8em] text-slate-500 mb-8">Confidencial . Protocolo de Flota</p>
         <h1 className="text-7xl font-black italic tracking-tighter uppercase mb-2">Libro de Ruta</h1>
         <h2 className="text-3xl font-bold text-blue-700 uppercase tracking-widest">{monthNames[month]} {year}</h2>
         <div className="h-2 w-40 bg-slate-900 mx-auto my-10" />
         <p className="text-sm font-bold uppercase tracking-widest text-slate-600">Balance Consolidado de Operaciones y Métrica Táctica</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-20">
        {/* Sección 1: Métricas Globales */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-y-2 border-slate-200 py-12">
           <div className="text-center">
              <p className="text-[10px] font-sans font-black uppercase tracking-widest text-slate-400 mb-2">KM Totales</p>
              <p className="text-5xl font-black italic tracking-tighter">{totalKm.toLocaleString()}</p>
           </div>
           <div className="text-center border-x-2 border-slate-100">
              <p className="text-[10px] font-sans font-black uppercase tracking-widest text-slate-400 mb-2">Visitas Cumplidas</p>
              <p className="text-5xl font-black italic tracking-tighter text-blue-700">{totalFleetVisits}</p>
           </div>
           <div className="text-center">
              <p className="text-[10px] font-sans font-black uppercase tracking-widest text-slate-400 mb-2">Unidades Activas</p>
              <p className="text-5xl font-black italic tracking-tighter">{summary.length}</p>
           </div>
        </section>

        {/* Sección 2: Mapa Táctico de Calor */}
        <section className="space-y-6">
           <h3 className="text-xl font-black uppercase tracking-widest border-l-8 border-slate-900 pl-4">Intel de Territorio (Mapa Térmico)</h3>
           <div className="h-[500px] border-2 border-slate-900 shadow-xl opacity-90 grayscale-[0.3]">
              <DynamicMap branchesData={mapBranches} />
           </div>
           <div className="flex gap-6 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" /> Visita Regular</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500" /> Frecuencia Media</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600" /> Operación Crítica</div>
           </div>
        </section>

        {/* Sección 3: Auditoría por Unidad */}
        <section className="space-y-8">
           <h3 className="text-xl font-black uppercase tracking-widest border-l-8 border-slate-900 pl-4">Detalle de Flota y Auditoría</h3>
           <table className="w-full text-left border-collapse font-sans">
              <thead>
                 <tr className="border-b-4 border-slate-900">
                    <th className="py-4 font-black uppercase text-xs tracking-widest">Patente</th>
                    <th className="py-4 font-black uppercase text-xs tracking-widest">Conductor Ref.</th>
                    <th className="py-4 font-black uppercase text-xs tracking-widest text-right">KM</th>
                    <th className="py-4 font-black uppercase text-xs tracking-widest text-right">Visitas</th>
                    <th className="py-4 font-black uppercase text-xs tracking-widest text-right">Consumo Est.</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {summary.map((v, i) => (
                   <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-black italic text-lg">{v.patente}</td>
                      <td className="py-4 font-bold text-xs text-slate-500 uppercase">{v.ultimoConductor}</td>
                      <td className="py-4 text-right font-bold">{v.kmRecorridos.toLocaleString()} km</td>
                      <td className="py-4 text-right font-bold">{v.visitasSucursales}</td>
                      <td className="py-4 text-right font-black text-blue-600">{(v.kmRecorridos * 0.12).toFixed(1)} Lts</td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </section>

        {/* Footer Ledger */}
        <footer className="pt-20 border-t-2 border-slate-200 flex justify-between items-end italic text-slate-400 text-xs">
           <div>
              <p>Generado oficialmente por FlotApp v3.3</p>
              <p>Fecha de Impresión: {new Date().toLocaleDateString()}</p>
           </div>
           <div className="text-right uppercase font-black tracking-widest text-slate-900">
              <p>Firma de Control Operativo</p>
              <div className="h-[1px] w-48 bg-slate-900 mt-8" />
           </div>
        </footer>
      </div>

      <div className="fixed bottom-8 right-8 no-print flex gap-4">
        <PrintButton />
        <Link href="/admin" className="bg-slate-900 text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-2xl">Volver al Mando</Link>
      </div>
    </div>
  );
}
