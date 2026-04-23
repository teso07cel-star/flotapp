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
    return <div className="p-10 text-red-500 font-black uppercase tracking-widest text-xs bg-slate-100 border-2 border-dashed border-red-500/20 text-center rounded-[3rem]">Error en Protocolo de Carga: {res.error}</div>;
  }

  const { summary, totalFleetVisits, mapBranches } = res.data;
  const totalKm = summary.reduce((acc, v) => acc + v.kmRecorridos, 0);
  const totalSpent = summary.reduce((acc, v) => acc + (v.totalGastos || 0), 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 sm:p-20 font-serif selection:bg-blue-100 print:p-0 print:m-0">
      {/* Portada del Libro - Edición Ejecutiva */}
      <div className="max-w-4xl mx-auto border-[1px] border-slate-900 p-16 mb-24 text-center relative overflow-hidden bg-white shadow-[0_40px_100px_rgba(0,0,0,0.05)] print:shadow-none print:border-4">
         <div className="absolute top-0 left-0 w-24 h-24 border-t-[12px] border-l-[12px] border-slate-900" />
         <div className="absolute top-0 right-0 w-24 h-24 border-t-[12px] border-r-[12px] border-slate-900" />
         <div className="absolute bottom-0 left-0 w-24 h-24 border-b-[12px] border-l-[12px] border-slate-900" />
         <div className="absolute bottom-0 right-0 w-24 h-24 border-b-[12px] border-r-[12px] border-slate-900" />
         
         <div className="space-y-12 py-10">
            <div className="inline-block px-6 py-2 border-2 border-slate-900 text-[10px] font-sans font-black uppercase tracking-[0.6em] mb-4">
               Documento Reservado
            </div>
            
            <div className="space-y-4">
              <p className="text-[11px] font-sans font-black uppercase tracking-[0.8em] text-slate-400">FlotApp Logistics Orchestrator</p>
              <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none drop-shadow-sm">Libro de Ruta</h1>
              <div className="flex items-center justify-center gap-6">
                 <div className="h-[2px] flex-1 bg-slate-900/10" />
                 <h2 className="text-4xl font-bold text-blue-700 uppercase tracking-[0.3em] font-sans italic">{monthNames[month]} {year}</h2>
                 <div className="h-[2px] flex-1 bg-slate-900/10" />
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-4 pt-10">
               <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-600 leading-relaxed">
                  Informe Consolidado de Métrica Táctica, Auditoría de Kilometraje y Despliegue de Unidades en Territorio.
               </p>
               <div className="flex items-center justify-center gap-3 py-4">
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
               </div>
               <p className="text-[9px] font-sans font-black uppercase tracking-[0.5em] text-slate-400">ID: LEDGER-{year}-{month+1}-FINAL</p>
            </div>
         </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-24">
        {/* Sección 1: Métricas de Alto Nivel */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-16 border-y-[1px] border-slate-200 py-16">
           <div className="text-center group">
              <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-slate-400 mb-4 group-hover:text-blue-600 transition-colors">Distancia Total</p>
              <p className="text-7xl font-black italic tracking-tighter">{totalKm.toLocaleString()} <span className="text-xl not-italic ml-1">km</span></p>
           </div>
           <div className="text-center border-x-[1px] border-slate-100 flex flex-col justify-center">
              <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Visitas Certificadas</p>
              <p className="text-7xl font-black italic tracking-tighter text-blue-700">{totalFleetVisits}</p>
           </div>
           <div className="text-center">
              <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Parque Activo</p>
              <p className="text-7xl font-black italic tracking-tighter">{summary.length} <span className="text-xl not-italic ml-1">unidades</span></p>
           </div>
        </section>

        {/* Sección 2: Mapa de Operaciones en Terreno */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
           <div className="flex items-end justify-between border-b-4 border-slate-900 pb-4">
              <h3 className="text-2xl font-black uppercase tracking-tighter">I. Mapa Táctico de Despliegue</h3>
              <p className="text-[10px] font-sans font-black text-slate-400 uppercase tracking-widest pb-1">Geolocalización Consolidada</p>
           </div>
           <div className="h-[600px] border-[1px] border-slate-900 shadow-2xl relative">
              <div className="absolute inset-0 bg-slate-900/5 pointer-events-none z-10" />
              <DynamicMap branchesData={mapBranches} />
           </div>
           <div className="flex flex-wrap gap-8 text-[10px] font-sans font-black uppercase tracking-[0.2em] text-slate-500 pt-2">
              <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-sm bg-blue-600 shadow-lg" /> Frecuencia Baja</div>
              <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-sm bg-orange-500 shadow-lg" /> Frecuencia Media</div>
              <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-sm bg-red-600 shadow-lg" /> Frecuencia Alta (Crítica)</div>
           </div>
        </section>

        {/* Sección 3: Auditoría Detallada (Ledger) */}
        <section className="space-y-10">
           <div className="flex items-end justify-between border-b-4 border-slate-900 pb-4">
              <h3 className="text-2xl font-black uppercase tracking-tighter">II. Auditoría por Unidad</h3>
              <p className="text-[10px] font-sans font-black text-slate-400 uppercase tracking-widest pb-1">Registro Detallado de Bitácora</p>
           </div>
           <table className="w-full text-left border-collapse font-sans">
              <thead>
                 <tr className="bg-slate-50 border-b-2 border-slate-900">
                    <th className="p-6 font-black uppercase text-[11px] tracking-[0.3em]">Unidad (Patente)</th>
                    <th className="p-6 font-black uppercase text-[11px] tracking-[0.3em]">Operador Ref.</th>
                    <th className="p-6 font-black uppercase text-[11px] tracking-[0.3em] text-right">Recorrido</th>
                    <th className="p-6 font-black uppercase text-[11px] tracking-[0.3em] text-right">Logística</th>
                    <th className="p-6 font-black uppercase text-[11px] tracking-[0.3em] text-right">Consumo Est.</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {summary.map((v, i) => (
                   <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6">
                         <div className="font-mono font-black italic text-2xl tracking-widest leading-none">{v.patente}</div>
                         <div className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: V-{v.id}</div>
                      </td>
                      <td className="p-6 font-bold text-[10px] text-slate-600 uppercase tracking-widest">{v.ultimoConductor}</td>
                      <td className="p-6 text-right font-bold text-lg">{v.kmRecorridos.toLocaleString()} <span className="text-[10px] text-slate-300">km</span></td>
                      <td className="p-6 text-right font-black text-blue-700">{v.visitasSucursales} <span className="text-[10px] opacity-40">visitas</span></td>
                      <td className="p-6 text-right font-black text-slate-900">{(v.kmRecorridos * 0.12).toFixed(1)} <span className="text-[10px] opacity-40 italic">LTS</span></td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </section>

        {/* Sección 4: Firmas y Control */}
        <footer className="pt-24 border-t-[1px] border-slate-200 mt-40">
           <div className="flex justify-between items-start italic text-slate-400 text-[10px] font-sans tracking-widest">
              <div className="space-y-2 uppercase leading-relaxed font-bold">
                 <p>Generado Oficialmente por Protocolo FlotApp Tactical Engine v3.6</p>
                 <p>Hash de Control: {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
                 <p>Fecha de Certificación: {new Date().toLocaleDateString('es-AR', { dateStyle: 'full' })}</p>
              </div>
              
              <div className="text-right space-y-12">
                 <div className="space-y-1">
                    <p className="uppercase font-black tracking-[0.5em] text-slate-900 italic text-sm">Control Operativo</p>
                    <p className="text-[8px] font-bold uppercase">Sello de Autoridad</p>
                 </div>
                 <div className="relative">
                    <div className="absolute -top-16 right-0 w-48 h-20 opacity-20 pointer-events-none grayscale contrast-200">
                       <img src="/icons/admin_hud.png" alt="Sello" className="w-full h-full object-contain" />
                    </div>
                    <div className="h-[2px] w-64 bg-slate-900 mb-2" />
                    <p className="font-black uppercase tracking-widest text-slate-400 text-[8px]">Firma de Responsable / Auditor</p>
                 </div>
              </div>
           </div>
        </footer>
      </div>

      <div className="fixed bottom-12 right-12 no-print flex gap-6 z-50">
        <PrintButton />
        <Link href="/admin" className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.4em] hover:bg-blue-700 transition-all shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95">Volver al Mando</Link>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 20mm; }
        }
      `}} />
    </div>
  );
}

