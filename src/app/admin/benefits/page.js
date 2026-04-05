"use client";
import Link from "next/link";

export default function BenefitsPage() {
  const kpis = [
    { 
      label: "Tiempo de Reporte", 
      before: "5-10 min", 
      after: "< 30 seg", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      ),
      color: "blue"
    },
    { 
      label: "Control de KM", 
      before: "Manual / Estimado", 
      after: "Validado x Sistema", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"/></svg>
      ),
      color: "emerald"
    },
    { 
      label: "Trazabilidad", 
      before: "De confianza", 
      after: "Geolocalización GPS", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      ),
      color: "rose"
    }
  ];

  const pilares = [
    {
      titulo: "Mantenimiento Preventivo",
      desc: "Detección automática de services y vencimientos de documentación (VTV, Seguro). Reduce costos de reparaciones correctivas.",
      icon: "🛠️"
    },
    {
      titulo: "Eficiencia Operativa",
      desc: "Flujo de 'Entrada Flash' y biometría para conductores internos. Reportes en segundos para optimizar rutas.",
      icon: "⚡"
    },
    {
      titulo: "Digitalización Total",
      desc: "Eliminación de papel y planillas manuales. Información centralizada en Supabase accesible en tiempo real.",
      icon: "📄"
    },
    {
      titulo: "Auditoría Visual",
      desc: "Inspección mensual fotográfica obligatoria. Registro histórico de estados de las unidades propias y externas.",
      icon: "📸"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 sm:p-12 selection:bg-blue-500/30 font-sans">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
             <Link href="/admin" className="text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Volver al Panel
             </Link>
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                Impacto <span className="text-blue-500">ROI</span><br />
                FlotApp <span className="text-gray-600">v1.2</span>
             </h1>
             <p className="text-gray-400 font-medium max-w-md">Resumen ejecutivo del valor operativo y económico del sistema de gestión de flota.</p>
          </div>
          <div className="bg-slate-900/40/5 border border-white/10 px-6 py-4 rounded-3xl backdrop-blur-xl">
             <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Estado de Implementación</div>
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-sm">Producción Activa</span>
             </div>
          </div>
        </div>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-slate-900/40/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md relative overflow-hidden group hover:border-blue-500/30 transition-all">
                <div className={`absolute top-0 right-0 p-4 opacity-10 text-${kpi.color}-500 transform group-hover:scale-125 transition-transform duration-700`}>
                   {kpi.icon}
                </div>
                <div className="space-y-4 relative z-10">
                   <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest">{kpi.label}</p>
                   <div className="flex flex-col gap-1">
                      <div className="text-xs font-bold text-gray-600 line-through decoration-red-500/50">Antes: {kpi.before}</div>
                      <div className={`text-3xl font-black text-${kpi.color}-500 tracking-tight`}>{kpi.after}</div>
                   </div>
                </div>
            </div>
          ))}
        </section>

        {/* Pilares */}
        <section className="space-y-8">
           <h2 className="text-2xl font-black uppercase tracking-tight text-center md:text-left">Pilares del Valor Agregado</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pilares.map((p, idx) => (
                <div key={idx} className="bg-gray-900/50 border border-white/5 p-6 rounded-3xl hover:bg-gray-900 transition-colors">
                   <div className="text-3xl mb-4">{p.icon}</div>
                   <h3 className="font-black text-xs uppercase tracking-widest mb-2 text-blue-400">{p.titulo}</h3>
                   <p className="text-gray-500 text-xs leading-relaxed font-medium">{p.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Comparison Table */}
        <section className="bg-slate-900/40/5 border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
           <div className="p-8 border-b border-white/10">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Comparativa Operativa (Matriz ROI)</h2>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-900/40/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                       <th className="p-6">Área de Mejora</th>
                       <th className="p-6">Proceso Manual (Anterior)</th>
                       <th className="p-6 text-blue-400">Con FlotApp (Actual)</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    <tr>
                       <td className="p-6 font-bold text-xs uppercase text-gray-400">Control de Gastos</td>
                       <td className="p-6 text-sm text-gray-600">Planillas Excel / Boletas físicas</td>
                       <td className="p-6 text-sm font-bold text-emerald-400">Carga vía App + Foto de Ticket inmediata</td>
                    </tr>
                    <tr>
                       <td className="p-6 font-bold text-xs uppercase text-gray-400">Vencimientos</td>
                       <td className="p-6 text-sm text-gray-600">Revisión de carpetas física</td>
                       <td className="p-6 text-sm font-bold text-emerald-400">Alertas Automáticas (Dashboard/Email)</td>
                    </tr>
                    <tr>
                       <td className="p-6 font-bold text-xs uppercase text-gray-400">Auditoría GPS</td>
                       <td className="p-6 text-sm text-gray-600">Basada en reportes de palabra</td>
                       <td className="p-6 text-sm font-bold text-emerald-400">Validado mediante coordenadas reales</td>
                    </tr>
                    <tr>
                       <td className="p-6 font-bold text-xs uppercase text-gray-400">Mantenimiento</td>
                       <td className="p-6 text-sm text-gray-600">Correctivo (cuando algo se rompe)</td>
                       <td className="p-6 text-sm font-bold text-emerald-400">Preventivo (anticipación por KM)</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </section>

        {/* Conclusion Footer */}
        <footer className="bg-gradient-to-tr from-blue-600 to-indigo-700 p-1 rounded-[2.5rem] shadow-2xl shadow-blue-500/20">
           <div className="bg-gray-950 p-10 rounded-[2.2rem] flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
              <div className="space-y-4 max-w-xl text-center md:text-left">
                 <h2 className="text-2xl font-black uppercase tracking-tighter italic">Visión Estratégica</h2>
                 <p className="text-gray-400 text-sm leading-relaxed font-medium italic">
                    &quot;Implementar FlotApp no solo moderniza la imagen de la empresa, sino que proporciona una herramienta de control directo sobre uno de los activos más críticos de la operación logística.&quot;
                 </p>
              </div>
              <Link href="/admin/summary" className="bg-slate-900/40 text-black px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-transform">
                 Ver Reporte Detallado
              </Link>
           </div>
        </footer>

      </div>

      {/* Tailwind classes that might be missing if not used elsewhere */}
      <style jsx global>{`
        .text-emerald-500 { color: #10b981; }
        .text-rose-500 { color: #f43f5e; }
        .decoration-red-500\\/50 { text-decoration-color: rgba(239, 68, 68, 0.5); }
      `}</style>
    </div>
  );
}
