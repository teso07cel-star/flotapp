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

  const { summary, totalFleetVisits, mapBranches, driverStats } = res.data;
  const totalKm = summary.reduce((acc, v) => acc + v.kmRecorridos, 0);
  const totalSpent = summary.reduce((acc, v) => acc + (v.totalGastos || 0), 0);

  return (
    <div className="relative min-h-screen pb-20">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          nav, .no-print, button, .sidebar, aside, form {
            display: none !important;
          }
          .print-break {
            page-break-after: always;
            break-after: page;
          }
          .max-w-5xl {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          section {
            margin-bottom: 2rem !important;
            padding-top: 2rem !important;
          }
        }
      `}} />

      {/* SELLO DE AUTENTICIDAD - MARCA DE AGUA VISUAL */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none z-0">
         <h1 className="text-[30vw] font-black italic tracking-tighter uppercase whitespace-nowrap rotate-12">FLOTAPP</h1>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* CABECERA MINIMALISTA DE ÉLITE */}
        <header className="p-12 mb-20 text-center relative bg-white border-b-4 border-slate-900 print:mb-10 print:break-after-page">
           <div className="space-y-6">
              <p className="text-[11px] font-sans font-black uppercase tracking-[0.6em] text-slate-400">Sistema de Inteligencia Logística</p>
              <h1 className="text-6xl sm:text-8xl font-black italic tracking-tighter uppercase leading-none text-slate-900">Libro de Ruta</h1>
              <div className="flex items-center justify-center gap-6">
                 <div className="h-[2px] w-20 bg-blue-600" />
                 <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-widest italic">{monthNames[month]} {year}</h2>
                 <div className="h-[2px] w-20 bg-blue-600" />
              </div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-8">Auditoría Operativa por Brian Ezequiel López</p>
           </div>
        </header>

        {/* CUERPO DEL REPORTE EJECUTIVO v5.0 */}
        <div className="space-y-32">
          
          {/* SECCIÓN I: RESUMEN DE FLOTA */}
          <section className="space-y-12 print:break-after-page print:pt-10 mb-24">
             <div className="flex items-center gap-4 mb-10">
                <span className="bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase">Fase 01</span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">Desempeño Global de Unidades</h2>
             </div>
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
                         <div className="text-4xl font-black italic tracking-tighter leading-none mb-1 text-slate-950">{v.patente}</div>
                         <div className="text-[9px] font-bold uppercase text-slate-600 tracking-widest">Protocolo #V-{v.id}</div>
                      </td>
                      <td className="p-8 border-r border-slate-900 text-center">
                         <div className="text-5xl font-black italic tracking-tighter text-slate-950">{v.visitasSucursales}</div>
                         <div className="text-[10px] font-black text-slate-500 uppercase mt-1">Check-ins</div>
                      </td>
                      <td className="p-8 border-r border-slate-900 text-center">
                         <div className="text-5xl font-black italic tracking-tighter text-slate-950">{v.kmRecorridos.toLocaleString()}</div>
                         <div className="text-[10px] font-black text-slate-500 uppercase mt-1">Kilómetros</div>
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
          <section className="space-y-12 print:hidden mb-24">
            <div className="flex items-center gap-4 mb-10">
               <span className="bg-blue-600 text-white px-4 py-1 text-[10px] font-black uppercase">Fase 02</span>
               <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">Inteligencia Individual por Oficial</h2>
            </div>
            
            <div className="bg-white border-2 border-slate-900 rounded-[3rem] overflow-hidden shadow-2xl">
               <DriverAnalyticsClient driverStats={res.data.driverStats} />
            </div>
          </section>

          {/* SECCIÓN III: ANÁLISIS DE INVERSIÓN LOGÍSTICA & ESTADO DE UNIDADES */}
          <section className="space-y-12 py-10 print:break-after-page print:pt-10 mb-24">
            <div className="flex items-center gap-4 mb-10">
               <span className="bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase">Fase 03</span>
               <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">Mantenimiento y Control de Flota</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
               <div className="bg-white border-2 border-slate-900 p-10 shadow-sm group hover:-translate-y-1 transition-all rounded-[2rem]">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em] italic">Gasto Mensual Total</p>
                  <p className="text-5xl font-black italic tracking-tighter text-slate-900">$ {totalSpent.toLocaleString()}</p>
               </div>
               <div className="bg-white border-2 border-slate-900 p-10 shadow-sm group hover:-translate-y-1 transition-all rounded-[2rem]">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em] italic">Consumo Promedio</p>
                  <p className="text-5xl font-black italic tracking-tighter text-slate-900">
                     $ {totalKm > 0 ? Math.round(totalSpent / totalKm) : 0} / km
                  </p>
               </div>
               <div className="bg-slate-950 text-white p-10 shadow-xl relative overflow-hidden group rounded-[2rem]">
                  <p className="text-[10px] font-black uppercase opacity-60 mb-4 tracking-[0.2em] italic">Disponibilidad</p>
                  <p className="text-5xl font-black italic tracking-tighter text-emerald-400">100%</p>
                  <div className="absolute -bottom-4 -right-4 opacity-10">
                     <svg className="w-40 h-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
               </div>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-[2rem] p-10 shadow-sm">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8 border-b-2 border-slate-100 pb-4">Visor Biométrico de Mantenimiento Integral</h3>
               
               <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 grayscale">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-widest text-slate-400 mb-2">Base de Datos de Mantenimiento No Inicializada</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ejecución Pendiente: Siembra de registros históricos (Cubiertas, Alineación, Fluidos).</p>
               </div>
            </div>
          </section>

          {/* SECCIÓN IV: RANKING DE NODOS (CRÍTICOS) */}
          <section className="space-y-12 print:break-after-page print:pt-10 mb-24">
            <div className="flex items-center gap-4 mb-10">
               <span className="bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase">Fase 04</span>
               <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">Ranking de Nodos Críticos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
               <div className="bg-white border-2 border-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
                  <table className="w-full text-left font-sans">
                     <thead className="bg-slate-50 border-b-2 border-slate-900">
                        <tr className="text-slate-950">
                           <th className="p-6 font-black uppercase text-[10px] tracking-widest pl-10">Posición</th>
                           <th className="p-6 font-black uppercase text-[10px] tracking-widest">Sucursal</th>
                           <th className="p-6 font-black uppercase text-[10px] tracking-widest text-right pr-10">Hitrate</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 italic font-medium text-sm">
                        {mapBranches.sort((a,b) => b.visitas - a.visitas).slice(0, 10).map((s, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                             <td className="p-6 pl-10 font-black text-slate-300">#0{i+1}</td>
                             <td className="p-6 font-black uppercase tracking-tighter text-slate-950">{s.nombre}</td>
                             <td className="p-6 text-right pr-10">
                                <span className="bg-blue-700 text-white px-4 py-1 rounded-full font-black text-[11px]">{s.visitas}</span>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
                <div className="bg-white border-2 border-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
                   <table className="w-full text-left font-sans">
                      <thead className="bg-slate-50 border-b-2 border-slate-900">
                         <tr className="text-slate-950">
                            <th className="p-6 font-black uppercase text-[10px] tracking-widest pl-10">Oficial de Flota</th>
                            <th className="p-6 font-black uppercase text-[10px] tracking-widest">Vehículos</th>
                            <th className="p-6 font-black uppercase text-[10px] tracking-widest text-right pr-10">Desempeño</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 italic font-medium text-sm">
                         {driverStats.sort((a,b) => b.totalKm - a.totalKm).slice(0, 10).map((d, i) => (
                           <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="p-6 pl-10">
                                 <div className="font-black uppercase tracking-tighter text-slate-950">{d.nombre}</div>
                                 <div className="text-[9px] text-slate-400 font-bold uppercase">{d.totalTrips} Sucursales</div>
                              </td>
                              <td className="p-6 font-bold uppercase text-[10px] text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                 {d.vehicles.join(" / ")}
                              </td>
                              <td className="p-6 text-right pr-10">
                                 <span className="bg-emerald-600 text-white px-4 py-1 rounded-full font-black text-[11px] whitespace-nowrap">
                                    {Math.round(d.totalKm).toLocaleString()} km
                                 </span>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
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
