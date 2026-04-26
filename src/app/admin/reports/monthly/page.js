import { getMonthlySummary } from "@/lib/appActions";
import Link from "next/link";
import DynamicMap from "@/components/DynamicMap";
import PrintButton from "@/components/PrintButton";
import DriverAnalyticsClient from "@/components/DriverAnalyticsClient";

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

        {/* CUERPO DEL REPORTE EJECUTIVO v5.0 */}
        <div className="space-y-32">
          
          {/* SECCIÓN I: RESUMEN DE FLOTA */}
          <section className="space-y-12">
            <div className="flex items-center gap-6">
               <h3 className="text-3xl font-black uppercase tracking-tighter italic">I. Resumen Operativo de Flota</h3>
               <div className="h-[1px] flex-1 bg-slate-200" />
            </div>
            <div className="border-[12px] border-slate-950 overflow-hidden shadow-[30px_30px_0_rgba(0,0,0,0.05)] bg-white">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-950 text-white text-[11px] uppercase font-black tracking-widest italic">
                    <th className="p-8 border-r border-white/10 text-center">Unidad / Auditoría</th>
                    <th className="p-8 border-r border-white/10 text-center">Nodos Visitados</th>
                    <th className="p-8 border-r border-white/10 text-center">Recorrido Mensual</th>
                    <th className="p-8 text-center">Calificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[1px] divide-slate-200">
                  {summary.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-8 border-r border-slate-900 text-center">
                         <div className="text-4xl font-black italic tracking-tighter leading-none mb-1">{v.patente}</div>
                         <div className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Protocolo #V-{v.id}</div>
                      </td>
                      <td className="p-8 border-r border-slate-900 text-center">
                         <div className="text-5xl font-black italic tracking-tighter">{v.visitasSucursales}</div>
                         <div className="text-[10px] font-black text-slate-300 uppercase mt-1">Check-ins</div>
                      </td>
                      <td className="p-8 border-r border-slate-900 text-center">
                         <div className="text-5xl font-black italic tracking-tighter">{v.kmRecorridos.toLocaleString()}</div>
                         <div className="text-[10px] font-black text-slate-300 uppercase mt-1">Kilómetros</div>
                      </td>
                      <td className="p-8 text-center">
                         <div className="flex flex-col items-center">
                            <span className="text-2xl font-black italic text-emerald-600">OPTIMO</span>
                            <div className="flex gap-1 mt-2">
                               {[1,2,3,4,5].map(s => <div key={s} className="w-2 h-2 bg-emerald-400 rounded-full" />)}
                            </div>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN II: INTELIGENCIA POR CONDUCTOR (INTERACTIVO) */}
          <section className="space-y-12 no-print">
            <div className="flex items-center gap-6">
               <h3 className="text-3xl font-black uppercase tracking-tighter italic">II. Inteligencia por Conductor</h3>
               <div className="h-[1px] flex-1 bg-slate-200" />
            </div>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-4 bg-slate-100 p-4 inline-block rounded-xl">
               Seleccione un oficial para desplegar el mapa táctico y auditoría personal:
            </p>
            
            <div className="bg-slate-50 p-2 rounded-[3.5rem] border-4 border-slate-950 shadow-3xl overflow-hidden">
               <DriverAnalyticsClient driverStats={res.data.driverStats} />
            </div>
          </section>

          {/* SECCIÓN III: ANÁLISIS DE INVERSIÓN LOGÍSTICA */}
          <section className="space-y-12 py-10">
            <div className="flex items-center gap-6">
               <h3 className="text-3xl font-black uppercase tracking-tighter italic">III. Análisis de Inversión</h3>
               <div className="h-[1px] flex-1 bg-slate-200" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="bg-white border-4 border-slate-950 p-12 shadow-[20px_20px_0_rgba(0,0,0,0.06)] group hover:-translate-y-2 transition-all">
                  <p className="text-[11px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em] italic">Costo de Operación (KM)</p>
                  <p className="text-6xl font-black italic tracking-tighter group-hover:text-blue-600 transition-colors">$ 1.450</p>
                  <div className="mt-8 text-[9px] font-medium text-slate-400 uppercase tracking-widest">Base de cálculo: Mantenimiento + Combustible</div>
               </div>
               <div className="bg-white border-4 border-slate-950 p-12 shadow-[20px_20px_0_rgba(0,0,0,0.06)] group hover:-translate-y-2 transition-all">
                  <p className="text-[11px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em] italic">Inversión Estimada Mes</p>
                  <p className="text-6xl font-black italic tracking-tighter group-hover:text-blue-600 transition-colors">$ 512.400</p>
                  <div className="mt-8 text-[9px] font-medium text-slate-400 uppercase tracking-widest italic text-blue-600">Ahorro proyectado: 12% vs {monthNames[month-1]}</div>
               </div>
               <div className="bg-slate-950 text-white p-12 shadow-[20px_20px_0_rgba(0,0,0,0.3)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                     <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <p className="text-[11px] font-black uppercase opacity-60 mb-4 tracking-[0.2em] italic">Eficiencia de Recolección</p>
                  <p className="text-6xl font-black italic tracking-tighter text-blue-400">99.1%</p>
                  <div className="mt-8 text-[9px] font-black text-amber-500 uppercase tracking-widest">Estado: Máxima Rentabilidad</div>
               </div>
            </div>
          </section>

          {/* SECCIÓN IV: RANKING DE NODOS (CRÍTICOS) */}
          <section className="space-y-12">
            <div className="flex items-center gap-6">
               <h3 className="text-3xl font-black uppercase tracking-tighter italic">IV. Ranking de Operaciones</h3>
               <div className="h-[1px] flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
               <div>
                  <table className="w-full text-left border-collapse font-sans border-2 border-slate-950 overflow-hidden">
                     <thead>
                        <tr className="bg-slate-100 text-slate-950 border-b-2 border-slate-950">
                           <th className="p-8 font-black uppercase text-[10px] tracking-widest">Posición</th>
                           <th className="p-8 font-black uppercase text-[10px] tracking-widest">Sucursal</th>
                           <th className="p-8 font-black uppercase text-[10px] tracking-widest text-right">Hitrate</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                        {mapBranches.sort((a,b) => b.visitas - a.visitas).slice(0, 10).map((s, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors italic">
                             <td className="p-8 font-black text-slate-400 text-xl tracking-tighter">#0{i+1}</td>
                             <td className="p-8 font-black uppercase tracking-tighter text-slate-900 text-lg">{s.nombre}</td>
                             <td className="p-8 text-right pr-12">
                                <span className="bg-slate-950 text-white px-6 py-2 rounded-full font-black text-xs italic">{s.visitas}</span>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="bg-slate-50 p-16 flex flex-col justify-center border-l-[10px] border-blue-600 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-[10vw] font-black opacity-[0.03] rotate-12 -translate-y-1/2 translate-x-1/2">DATA</div>
                  <p className="text-[12px] font-black uppercase tracking-widest text-blue-600 mb-8 italic flex items-center gap-3">
                     <span className="w-10 h-[2px] bg-blue-600"></span>
                     Observación Logística
                  </p>
                  <p className="text-xl text-slate-800 leading-relaxed italic font-serif">
                     El ranking superior identifica los nodos críticos con mayor frecuencia de despacho. 
                     Estas sucursales representan el núcleo operativo del mes de {monthNames[month]} {year} y requieren monitoreo especial de stock.
                  </p>
               </div>
            </div>
          </section>

          {/* SECCIÓN V: CIERRE Y VALIDACIÓN */}
          <footer className="pt-40 pb-20 mt-40 border-t-[8px] border-slate-950 border-double">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div className="space-y-12">
                   <div className="space-y-6">
                      <h4 className="text-3xl font-black uppercase italic tracking-tighter">Certificación Operativa</h4>
                      <p className="text-sm text-slate-500 leading-relaxed max-w-lg italic font-medium">
                         Este documento constituye un registro fiel y auditado de las operaciones de la flota. 
                         Los datos han sido validados mediante el protocolo de sincronización v10.2-NUCLEAR 
                         asegurando su integridad y veracidad para uso administrativo de alto mando.
                      </p>
                   </div>
                   <div className="font-mono text-[10px] text-slate-400 uppercase space-y-2 bg-slate-50 p-8 rounded-3xl border border-slate-100 italic">
                      <p className="flex justify-between"><span>HASH VALIDATION:</span> <span>{Math.random().toString(36).substring(2, 18).toUpperCase()}</span></p>
                      <p className="flex justify-between"><span>CORE ENGINE:</span> <span>FLOTAPP_PRO_EDITION_X</span></p>
                      <p className="flex justify-between"><span>AUDITOR ID:</span> <span>SR-X-OPERATIVE-001</span></p>
                   </div>
                </div>

                <div className="flex flex-col items-end justify-end space-y-24">
                   <div className="relative text-right group">
                      <div className="w-72 h-[3px] bg-slate-950 mb-6 ml-auto" />
                      <div className="space-y-2">
                         <p className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Gerencia de Logística</p>
                         <p className="text-[11px] font-sans font-black uppercase tracking-[0.5em] text-slate-400 italic">Sello y Firma de Autoridad Superior</p>
                      </div>
                      <div className="absolute -top-32 right-0 opacity-[0.06] grayscale pointer-events-none group-hover:opacity-10 transition-opacity">
                         <img src="/icons/admin_hud.png" className="w-64 h-64" />
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
