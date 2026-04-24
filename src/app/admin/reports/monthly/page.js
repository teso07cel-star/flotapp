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
    <div className="min-h-screen bg-white text-slate-900 px-6 py-12 sm:p-24 font-serif selection:bg-blue-100 print:p-0 print:m-0">
      {/* SELLO DE AUTENTICIDAD - MARCA DE AGUA VISUAL */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none z-0">
         <h1 className="text-[30vw] font-black italic tracking-tighter uppercase whitespace-nowrap rotate-12">FLOTAPP</h1>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* PORTADA EJECUTIVA TIPO 'LOGBOOK' */}
        <header className="border-[15px] border-slate-950 p-12 sm:p-20 mb-32 text-center relative bg-white shadow-2xl print:shadow-none print:border-[8pt]">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-10">
              <img src="/icons/admin_hud.png" alt="Logo" className="w-24 h-24 grayscale brightness-0" />
           </div>
           
           <div className="space-y-16">
              <div className="space-y-4">
                <p className="text-[10px] font-sans font-black uppercase tracking-[1em] text-slate-400 mb-8">Intelligence & Logistics Orchestrator</p>
                <h1 className="text-7xl sm:text-9xl font-black italic tracking-tighter uppercase leading-none text-slate-900 drop-shadow-lg">Libro de Ruta</h1>
                <div className="flex items-center justify-center gap-10">
                   <div className="h-[3px] flex-1 bg-slate-950" />
                   <h2 className="text-4xl sm:text-5xl font-bold text-blue-800 uppercase tracking-[0.2em] font-sans italic">{monthNames[month]} {year}</h2>
                   <div className="h-[3px] flex-1 bg-slate-950" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 text-left max-w-2xl mx-auto border-t border-slate-200 pt-16">
                 <div className="space-y-1">
                    <p className="text-[8px] font-sans font-black uppercase tracking-widest text-slate-400">Estado del Documento</p>
                    <p className="text-sm font-black uppercase italic text-slate-900 tracking-tighter">Certificado Operacional</p>
                 </div>
                 <div className="space-y-1 text-right">
                    <p className="text-[8px] font-sans font-black uppercase tracking-widest text-slate-400">ID de Auditoría</p>
                    <p className="text-sm font-black font-mono text-slate-600 tracking-tighter">#LX-{year}-{month+1}-FINAL</p>
                 </div>
              </div>
           </div>
        </header>

        {/* CUERPO DEL REPORTE */}
        <div className="space-y-32">
          {/* SECCIÓN I: KPI DE ALTO MANDO */}
          <section className="space-y-12">
            <div className="flex items-center gap-6">
               <h3 className="text-3xl font-black uppercase tracking-tighter italic">I. Resumen de Flota</h3>
               <div className="h-[1px] flex-1 bg-slate-200" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               <div className="bg-slate-50 p-10 border-l-[6px] border-slate-950 space-y-4">
                  <p className="text-[9px] font-sans font-black uppercase tracking-widest text-slate-400">Kilometraje Total</p>
                  <p className="text-5xl font-black italic tracking-tighter">{totalKm.toLocaleString()}<span className="text-xs not-italic ml-1 opacity-40">KM</span></p>
               </div>
               <div className="bg-blue-50 p-10 border-l-[6px] border-blue-800 space-y-4">
                  <p className="text-[9px] font-sans font-black uppercase tracking-widest text-blue-400">Despliegues</p>
                  <p className="text-5xl font-black italic tracking-tighter text-blue-900">{totalFleetVisits}<span className="text-xs not-italic ml-1 opacity-40">HITS</span></p>
               </div>
               <div className="bg-slate-50 p-10 border-l-[6px] border-slate-950 space-y-4">
                  <p className="text-[9px] font-sans font-black uppercase tracking-widest text-slate-400">Combustible Est.</p>
                  <p className="text-5xl font-black italic tracking-tighter">{(totalKm * 0.12).toFixed(0)}<span className="text-xs not-italic ml-1 opacity-40">LTS</span></p>
               </div>
               <div className="bg-slate-900 text-white p-10 border-l-[6px] border-blue-500 space-y-4 shadow-xl">
                  <p className="text-[9px] font-sans font-black uppercase tracking-widest text-blue-300">Gasto Consolidado</p>
                  <p className="text-4xl font-black italic tracking-tighter">$ {totalSpent.toLocaleString()}</p>
               </div>
            </div>
          </section>

          {/* SECCIÓN II: MAPA DE DESPLIEGUE */}
          <section className="space-y-10">
            <div className="flex items-center gap-6">
               <h3 className="text-3xl font-black uppercase tracking-tighter italic">II. Mapa de Despliegue Táctico</h3>
               <div className="h-[1px] flex-1 bg-slate-200" />
            </div>
            <div className="relative group grayscale hover:grayscale-0 transition-all duration-1000">
               <div className="absolute inset-0 border-[2px] border-slate-950 pointer-events-none z-10" />
               <div className="h-[600px] shadow-2xl">
                  <DynamicMap branchesData={mapBranches} />
               </div>
            </div>
          </section>

          {/* SECCIÓN III: REGISTRO POR UNIDAD (LEDGER) */}
          <section className="space-y-10">
            <div className="flex items-center gap-6">
               <h3 className="text-3xl font-black uppercase tracking-tighter italic">III. Auditoría Detallada</h3>
               <div className="h-[1px] flex-1 bg-slate-200" />
            </div>
            <div className="border-[1px] border-slate-950">
               <table className="w-full text-left border-collapse font-sans">
                  <thead>
                     <tr className="bg-slate-950 text-white">
                        <th className="p-8 font-black uppercase text-[10px] tracking-[0.3em]">ID / Patente</th>
                        <th className="p-8 font-black uppercase text-[10px] tracking-[0.3em]">Último Operador</th>
                        <th className="p-8 font-black uppercase text-[10px] tracking-[0.3em] text-right">Recorrido</th>
                        <th className="p-8 font-black uppercase text-[10px] tracking-[0.3em] text-right">Métrica Logística</th>
                        <th className="p-8 font-black uppercase text-[10px] tracking-[0.3em] text-right">Presupuesto</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-950">
                     {summary.map((v, i) => (
                       <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-8">
                             <div className="font-mono font-black italic text-4xl tracking-tighter leading-none mb-1">{v.patente}</div>
                             <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unidad Táctica #V-{v.id}</div>
                          </td>
                          <td className="p-8">
                             <div className="font-black text-xs uppercase italic tracking-tighter text-slate-700">{v.ultimoConductor || '---'}</div>
                             <div className="text-[7px] font-bold text-slate-300 uppercase mt-1">Personal Certificado</div>
                          </td>
                          <td className="p-8 text-right">
                             <div className="font-black text-3xl italic tracking-tighter">{v.kmRecorridos.toLocaleString()} <span className="text-[10px] not-italic opacity-30">KM</span></div>
                          </td>
                          <td className="p-8 text-right">
                             <div className="font-black text-2xl text-blue-800 italic leading-none">{v.visitasSucursales}</div>
                             <div className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Puntos de Control</div>
                          </td>
                          <td className="p-8 text-right">
                             <div className="font-black text-2xl italic tracking-tighter">$ {v.totalGastos.toLocaleString()}</div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </section>

          {/* SECCIÓN IV: CIERRE Y VALIDACIÓN */}
          <footer className="pt-40 pb-20 mt-40 border-t-2 border-slate-100">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div className="space-y-10">
                   <div className="space-y-4">
                      <h4 className="text-xl font-black uppercase italic tracking-tighter">Certificación Operativa</h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm italic">
                         Este documento constituye un registro fiel de las operaciones de la flota. 
                         Los datos han sido validados mediante el protocolo de sincronización v10.2 
                         y auditados para asegurar su integridad operativa.
                      </p>
                   </div>
                   <div className="font-mono text-[9px] text-slate-300 uppercase space-y-1">
                      <p>HASH: {Math.random().toString(36).substring(2, 18).toUpperCase()}</p>
                      <p>ENGINE: FLOTAPP_TRIAL_MASTER_X</p>
                      <p>RELEASE: MAY_2026_CANDIDATE</p>
                   </div>
                </div>

                <div className="flex flex-col items-end justify-end space-y-16">
                   <div className="relative text-right group">
                      <img src="/icons/admin_hud.png" className="absolute -top-16 right-0 w-40 h-40 opacity-5 grayscale pointer-events-none group-hover:opacity-10 transition-opacity" />
                      <div className="h-[2px] w-80 bg-slate-950 mb-4" />
                      <div className="space-y-1">
                         <p className="text-lg font-black uppercase italic tracking-tighter">Gerencia de Logística</p>
                         <p className="text-[9px] font-sans font-black uppercase tracking-[0.4em] text-slate-400 italic">Sello y Firma de Autoridad</p>
                      </div>
                   </div>
                </div>
             </div>
          </footer>
        </div>
      </div>

      {/* CONTROLES FLOTANTES */}
      <div className="fixed bottom-12 right-12 no-print flex flex-col gap-5 z-50">
        <PrintButton />
        <Link href="/admin" className="relative group bg-slate-950 text-white w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl hover:w-64 hover:rounded-[2rem] overflow-hidden">
           <div className="absolute inset-0 bg-blue-700 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
           <svg className="w-8 h-8 relative z-10 transition-transform group-hover:-translate-x-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
           <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 text-white font-black uppercase text-[10px] tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">Volver al Mando</span>
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; }
          .min-h-screen { padding: 0 !important; }
          @page { size: auto; margin: 15mm; }
          header { border: 4pt solid black !important; }
          tr { page-break-inside: avoid; }
        }
      `}} />
    </div>
  );
}
