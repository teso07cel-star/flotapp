const fs = require('fs');

const path = 'c:/Users/USUARIO/.gemini/antigravity/scratch/flota-app/src/components/DriverFormClient.js';
let content = fs.readFileSync(path, 'utf8');

// The file has a structured pattern. I'll replace everything from 
// {/* 1. INICIO DE JORNADA / CAMBIO DE VEHICULO */} 
// down to 
// {/* 3. FINALIZAR DÍA: Resumen de cierre */}

const startMarker = "{/* 1. INICIO DE JORNADA / CAMBIO DE VEHICULO */}";
const endMarker = "{/* 3. FINALIZAR DÍA: Resumen de cierre */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const replacement = `        {/* 1. Y 2. FLUJO OPERATIVO UNIFICADO (PRIMER Y SEGUNDO VIAJE) */}
        {!isFinishingShift && (
          <div className="space-y-6 animate-in fade-in duration-500">
             
             {/* PREMIUM HEADER - Dinámico */}
             <div className="flex flex-col items-center gap-4 bg-[#0f172a] border border-blue-500/20 pt-8 pb-4 px-6 rounded-[2rem] shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden group">
                <div className="absolute -top-10 inset-x-0 h-48 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />
                <img 
                    src={vehiculo.categoria === "MOTO" ? "/icons/moto.png" : (vehiculo.categoria === "PICKUP" || vehiculo.categoria === "CAMIONETA") ? "/icons/pickup.png" : "/icons/admin_hud.png"} 
                    alt="Vehiculo Activo" 
                    className="h-28 max-w-[200px] object-contain mix-blend-screen saturate-0 relative z-20 group-hover:scale-105 transition-transform duration-700" 
                 />
                <div className="relative z-30 text-center">
                   <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[9px] mb-1">Operador Verificado</p>
                   <h3 className="text-white text-xl font-black tracking-tight uppercase">{identifiedDriver || lastLog?.nombreConductor || "Valido"}</h3>
                </div>
             </div>

             {/* SEÑAL GPS */}
             <div className="p-1 bg-[#020617]/40 rounded-2xl border border-white/5 space-y-3 max-w-[200px] mx-auto mt-2 mb-2">
                <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">
                   <span>Señal GPS</span>
                   <span className={gpsLocation ? "text-blue-500" : "text-amber-500"}>{gpsLocation ? "Conectado" : "Buscando"}</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden mx-3 mb-3">
                   <div className={\`h-full bg-blue-500 transition-all duration-1000 \${gpsLocation ? 'w-full shadow-[0_0_8px_#3b82f6]' : 'w-1/3 animate-pulse'}\`} />
                </div>
             </div>

             {/* BLOQUE DE IDENTIDAD DE UNIDAD Y ODÓMETRO */}
             <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative overflow-hidden group">
               {!changingVehicle ? (
                 <div className="space-y-6">
                   <div className="text-center">
                     <p className="text-slate-500 text-[10px] uppercase tracking-[0.5em] font-black mb-2">Unidad Activa</p>
                     <h2 className="text-5xl text-white font-black uppercase tracking-[0.3em] font-mono shadow-sm">{vehiculo.patente}</h2>
                     <button type="button" onClick={() => setChangingVehicle(true)} className="mt-4 py-2 px-6 rounded-2xl border border-slate-700 bg-slate-900/50 text-slate-500 font-black uppercase tracking-widest text-[9px] hover:text-white transition-all">
                       Cambiar de Unidad
                     </button>
                   </div>
                   
                   {/* SOLO EN PRIMER VIAJE PIDE ODÓMETRO */}
                   {isFirstLog ? (
                      <div className="pt-4 border-t border-white/5 mt-4">
                         {editKm ? (
                            <div className="space-y-3 relative z-10 animate-in fade-in duration-500">
                              <label className="block text-[11px] font-black uppercase text-white tracking-[0.3em] text-center mb-4">Validar Odómetro Inicial</label>
                              <div className="relative group overflow-hidden rounded-x3l">
                                <input
                                  name="kmActual"
                                  type="number"
                                  required
                                  defaultValue={lastLog?.kmActual || ""}
                                  className="w-full bg-[#020617] text-center border-2 border-blue-500/20 rounded-2xl px-5 py-8 text-white focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-black text-5xl shadow-2xl"
                                  placeholder="000"
                                />
                                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-blue-500 font-black text-xs uppercase tracking-widest opacity-50">km</div>
                              </div>
                            </div>
                         ) : (
                            <div className="space-y-4 relative z-10 animate-in fade-in duration-500">
                               <p className="text-[11px] font-black uppercase text-white tracking-[0.3em] text-center mb-4">Confirmación de Odómetro</p>
                               <div className="flex flex-col items-center bg-[#020617]/50 rounded-2xl p-4 border border-white/5 mb-4">
                                  <span className="text-3xl text-emerald-400 font-black mb-1 opacity-90">{lastLog?.kmActual || 0} km</span>
                                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.4em]">Lectura Sugerida</p>
                               </div>
                               <div className="flex items-center justify-between px-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 hover:bg-emerald-500/20 transition-all">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[#020617]">
                                        <svg className="w-5 h-5 font-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                     </div>
                                     <div>
                                        <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">Correcto</p>
                                        <p className="text-emerald-500/60 text-[8px] font-bold uppercase tracking-[0.2em]">Odómetro Confirmado</p>
                                     </div>
                                  </div>
                                  <div onClick={() => setEditKm(true)} className="px-4 py-2 border border-slate-700 bg-[#020617] rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-all font-black text-[9px] uppercase tracking-widest cursor-pointer whitespace-nowrap">
                                     Editar (No)
                                  </div>
                               </div>
                               <input type="hidden" name="kmActual" value={lastLog?.kmActual || 0} />
                            </div>
                         )}
                      </div>
                   ) : (
                      <div className="pt-2 animate-in fade-in zoom-in-95 duration-500">
                         <div className="text-center">
                            <p className="text-blue-500/60 text-[8px] font-black uppercase tracking-[0.3em] mb-1">Odómetro interno mantenido por sistema</p>
                            <input type="hidden" name="kmActual" value={lastLog?.kmActual || 0} />
                         </div>
                      </div>
                   )}
                 </div>
               ) : (
                 <div className="space-y-4 animate-in fade-in duration-300">
                   <label className="block text-[10px] font-black uppercase text-blue-400 tracking-widest text-center">Nueva Patente</label>
                   <input
                     type="text"
                     autoFocus
                     value={newPatente}
                     onChange={(e) => setNewPatente(e.target.value.toUpperCase())}
                     className="w-full bg-[#020617] text-center border-2 border-blue-500/40 rounded-2xl px-5 py-6 text-white focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-black text-4xl tracking-widest"
                     placeholder="X000XX"
                   />
                   <div className="flex gap-3">
                     <button type="button" onClick={() => setChangingVehicle(false)} className="flex-1 py-5 bg-slate-900 border border-white/5 rounded-2xl text-slate-500 font-black uppercase tracking-widest text-[10px]">Cancelar</button>
                     <button type="button" onClick={handleChangeVehicleRedirect} disabled={!newPatente.trim()} className="flex-[2] py-5 bg-blue-600 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-500/20 disabled:opacity-50">Buscar Unidad</button>
                   </div>
                 </div>
               )}
             </div>

          </div>
        )}

        {/* LISTA DE SUCURSALES (COMÚN PARA PRIMER Y SEGUNDO VIAJE) */}
        {!isFinishingShift && !changingVehicle && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end px-2 mt-4">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Nodos de Operativa</label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar p-1">
              {sucursales.map(s => (
                <label
                  key={s.id}
                  className="flex items-center gap-4 p-5 rounded-[2rem] border border-white/5 bg-[#1e293b]/30 hover:bg-[#1e293b]/60 hover:border-blue-500/30 transition-all cursor-pointer group/item relative overflow-hidden"
                >
                  <div className="relative flex items-center justify-center z-10">
                    <input 
                      type="checkbox" 
                      name="sucursalIds" 
                      value={s.id}
                      className="w-6 h-6 rounded-lg border-2 border-slate-700 bg-slate-950 text-blue-500 focus:ring-offset-slate-950 focus:ring-blue-500 transition-all cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 z-10">
                    <div className="text-[11px] font-black text-slate-300 group-hover/item:text-blue-400 transition-colors uppercase tracking-tight leading-none mb-1">{s.nombre}</div>
                    <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{s.direccion}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        `;

const finalContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(path, finalContent);
console.log("Replaced successfully!");
