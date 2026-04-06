export const dynamic = 'force-dynamic';
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import prisma from "@/lib/prisma";

export default async function DriversDailyReport({ searchParams }) {
  const params = await searchParams;
  const dateStr = params.date || new Date().toISOString().split('T')[0];
  
  // Date range for the query
  const startDate = new Date(`${dateStr}T00:00:00`);
  const endDate = new Date(`${dateStr}T23:59:59.999`);

  // Fetch all logs within the date
  const logs = await prisma.registroDiario.findMany({
    where: {
      fecha: { gte: startDate, lte: endDate },
      // Optional: Solo consideramos logs operativos si tienen chofer u operaron unidades
    },
    include: {
      vehiculo: true,
      sucursales: true
    },
    orderBy: { fecha: 'asc' }
  });

  // Group by Driver Name
  const driversMap = {};
  logs.forEach(log => {
      const driver = log.nombreConductor || "CONDUCTOR EXTERNO";
      if (!driversMap[driver]) {
          driversMap[driver] = {
              name: driver,
              inicio: null,
              paradas: [],
              cierre: null,
          };
      }
      
      const groupInfo = driversMap[driver];

      if (log.tipoReporte === "INICIO" || (!groupInfo.inicio && log.kmActual)) {
          // Si no había inicio asignado, el primer log actúa como inicio
          if (!groupInfo.inicio) groupInfo.inicio = log;
          else groupInfo.paradas.push(log);
      } else if (log.tipoReporte === "CIERRE") {
          groupInfo.cierre = log;
      } else {
          groupInfo.paradas.push(log);
      }
  });

  const driversList = Object.values(driversMap);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase italic text-blue-600 dark:text-blue-400">Jornada Operativa</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Informes individuales por Conductor Estratégico</p>
        </div>

        <form className="flex items-center gap-3 bg-slate-900/40 bg-[#0f172a] p-2 rounded-2xl border border-slate-700 shadow-xl shadow-black/5">
          <label className="pl-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Día de Reporte:</label>
          <input 
            name="date"
            type="date" 
            defaultValue={dateStr}
            className="bg-transparent text-sm font-bold outline-none p-2 border-r border-slate-800/50 text-white"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all">Filtrar</button>
        </form>
      </div>

      {driversList.length === 0 ? (
          <div className="p-20 border-2 border-dashed border-slate-700 rounded-[3rem] text-center bg-slate-900/20">
              <h2 className="text-slate-500 font-black uppercase tracking-widest">Sin Operativa Registrada</h2>
              <p className="text-xs text-slate-600 mt-2">Ningún conductor operó la flota el {format(startDate, "dd 'de' MMMM", {locale: es})}.</p>
          </div>
      ) : (
          <div className="space-y-8">
              {driversList.map((d, index) => (
                  <div key={index} className="bg-gradient-to-br from-[#0f172a] to-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 mix-blend-screen opacity-10 pointer-events-none">
                          <img src="/icons/admin_hud.png" className="w-48 contrast-150 grayscale" alt="HUD" />
                      </div>
                      
                      <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                          <div>
                              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-blue-500 mb-1">Conductor Táctico</p>
                              <h2 className="text-3xl font-black uppercase tracking-tighter text-white">{d.name}</h2>
                          </div>
                      </div>

                      <div className="relative pl-8 space-y-12 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-blue-600 before:via-blue-600/20 before:to-transparent">
                          
                          {/* INICIO */}
                          {d.inicio && (
                              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                  {/* Icon */}
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-blue-600 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_15px_#2563eb] absolute -left-12 z-20">
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="w-full bg-slate-900/60 border border-blue-500/20 rounded-2xl p-5 shadow-lg relative z-10">
                                      <div className="flex justify-between items-center mb-3">
                                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Inicio de Turno</p>
                                          <span className="text-white font-mono font-bold">{format(new Date(d.inicio.fecha), "HH:mm")}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                          <div>
                                              <p className="text-[9px] text-slate-500 uppercase font-black">Vehículo</p>
                                              <p className="font-mono text-white text-sm font-bold tracking-widest bg-white/5 border border-white/10 rounded px-2 py-1 inline-block mt-1">{d.inicio.vehiculo.patente}</p>
                                          </div>
                                          <div className="text-right">
                                              <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Señal GPS</p>
                                              {d.inicio.lugarGuarda ? (
                                                 <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.inicio.lugarGuarda)}`} target="_blank" className="text-[9px] font-black uppercase text-blue-400 border border-blue-500/30 px-2 py-1 rounded hover:bg-blue-500/10 transition-colors">Ver Mapa</a>
                                              ) : <span className="text-[9px] text-red-500">Sin Datos</span>}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* PARADAS */}
                          {d.paradas.map((parada, idx) => (
                              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                  {/* Icon */}
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-slate-900 bg-slate-700 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-11 z-20">
                                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="w-full bg-slate-800/20 border border-slate-700/50 rounded-2xl p-5 shadow-lg relative z-10 transition-colors hover:border-slate-500/50">
                                      <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                                          <div>
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{parada.sucursales?.length > 0 ? "Visita" : "Bitácora"}</p>
                                          </div>
                                          <span className="text-gray-400 font-mono text-sm">{format(new Date(parada.fecha), "HH:mm")}</span>
                                      </div>
                                      
                                      <div className="flex flex-wrap gap-2 mt-3">
                                          {parada.sucursales?.map(s => (
                                              <span key={s.id} className="text-[9px] px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-300 uppercase font-black tracking-widest">{s.nombre}</span>
                                          ))}
                                          {(!parada.sucursales || parada.sucursales.length === 0) && <span className="text-[9px] italic text-slate-600">Registro Estándar</span>}
                                      </div>
                                      {parada.kmActual && (
                                          <div className="mt-3 text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                                              Odómetro Verificado: <span className="font-mono text-sm">{parada.kmActual}</span> KM
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}

                          {/* CIERRE */}
                          {d.cierre && (
                              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                  {/* Icon */}
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-red-600 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_15px_#dc2626] absolute -left-12 z-20">
                                      <div className="w-3 h-3 bg-white"></div>
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="w-full bg-red-950/20 border border-red-500/20 rounded-2xl p-5 shadow-lg relative z-10">
                                      <div className="flex justify-between items-center mb-3">
                                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Cierre de Jornada</p>
                                          <span className="text-red-300 font-mono font-bold">{format(new Date(d.cierre.fecha), "HH:mm")}</span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2">
                                          <div>
                                              <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Odómetro</p>
                                              <p className="font-mono text-white text-xs font-bold tracking-widest bg-white/5 border border-white/10 rounded px-2 py-1 inline-block">{d.cierre.kmActual ?? "N/A"}</p>
                                          </div>
                                          <div>
                                              <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Combustible</p>
                                              <p className="font-mono text-white text-xs font-bold tracking-widest bg-white/5 border border-white/10 rounded px-2 py-1 inline-block uppercase text-amber-500">{d.cierre.nivelCombustible ?? "N/A"}</p>
                                          </div>
                                          <div className="text-right">
                                              <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Señal GPS Final</p>
                                              {d.cierre.lugarGuarda ? (
                                                 <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.cierre.lugarGuarda)}`} target="_blank" className="text-[8px] font-black uppercase text-red-400 border border-red-500/30 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">Mapa</a>
                                              ) : <span className="text-[8px] text-red-500">Sin Datos</span>}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}
                          {!d.cierre && (
                              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                  {/* Icon */}
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-12 z-20">
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="w-full bg-slate-900/30 border border-slate-700 border-dashed rounded-2xl p-5 relative z-10 text-center">
                                      <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] italic">Turno en Curso (Sin cierre registrado)</p>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}
