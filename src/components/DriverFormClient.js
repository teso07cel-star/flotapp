"use client";
import { useState, useEffect } from "react";
import { createRegistroDiario } from "@/lib/actions";


export default function DriverFormClient({ vehiculo, sucursales, lastLog, identifiedDriver, isFirstLog, seIngresoKmHoy, phase }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [isFinishingShift, setIsFinishingShift] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("");
  const [gpsLoading, setGpsLoading] = useState(true);
  
  // Nuevo estado para cambiar vehículo en medio del turno
  const [changingVehicle, setChangingVehicle] = useState(vehiculo?.id === 0);
  const [newPatente, setNewPatente] = useState("");
  
  // El kilometraje solo se edita inicialmente si se está CERRANDO el turno (o si en isFirstLog se marca 'No')
  const [editKm, setEditKm] = useState(isFinishingShift);

  useEffect(() => {
    setEditKm(isFinishingShift);
  }, [isFinishingShift]);


  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setGpsLocation(`${lat}, ${lng}`);
          setGpsLoading(false);
        },
        (err) => {
          console.error("Error GPS:", err);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleChangeVehicleRedirect = () => {
    if (newPatente.trim()) {
      window.location.href = `/driver/form?patente=${newPatente.trim().toUpperCase()}`;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.target;
    const formData = new FormData(form);
    
    const inputKm = formData.get("kmActual");
    const suggestedKm = lastLog?.kmActual;
    const kmModificado = inputKm && suggestedKm && parseInt(inputKm) !== parseInt(suggestedKm);

    const data = {
      vehiculoId: vehiculo.id,
      nombreConductor: identifiedDriver || lastLog?.nombreConductor || "Conductor",
      kmActual: inputKm,
      kmModificado: kmModificado,
      nivelCombustible: formData.get("nivelCombustible"),
      motivoUso: formData.get("motivoUso"),
      novedades: formData.get("novedades"),
      sucursalIds: isFinishingShift ? [] : formData.getAll("sucursalIds").map(id => parseInt(id)),
      authCode: authCode,
      tipoReporte: isFirstLog ? "INICIO" : (isFinishingShift ? "CIERRE" : "PARADA"),
      phase: phase, // Reportar fase para trazabilidad
      lugarGuarda: gpsLocation
    };

    if (editKm && !data.kmActual) {
      setError("El kilometraje es obligatorio para validar el reporte.");
      setLoading(false);
      return;
    }


    const res = await createRegistroDiario(data);

    if (res.success) {
      if (isFinishingShift) {
        document.cookie = "driver_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/driver/entry";
      } else {
        window.location.href = "/?success=true";
      }
    } else {
      if (res.error === "MILEAGE_AUTH_REQUIRED") {
        setShowAuth(true);
        setError("El kilometraje ingresado requiere autorización administrativa.");
      } else {
        setError("Error: " + res.error);
      }
      setLoading(false);
    }
  };

  const driverInitial = (identifiedDriver || lastLog?.nombreConductor || "C").charAt(0).toUpperCase();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-8 relative max-w-md mx-auto">
        
        {/* OVERLAY EXPLICATIVO PARA EL VIDEO */}
        <div className="bg-blue-600/10 border border-blue-500/30 backdrop-blur-md p-4 rounded-2xl mb-6 shadow-2xl">
          <h4 className="text-blue-400 font-black tracking-widest text-[10px] uppercase mb-1">
            {isFirstLog ? "Protocolo: Inicio de Turno" : (isFinishingShift ? "Protocolo: Cierre de Turno" : "Protocolo: Transmisión Activa")}
          </h4>
          <p className="text-white text-[11px] font-medium leading-tight">
            {isFirstLog ? "Validación de odómetro y unidad identificada para inicio de jornada." : 
            (isFinishingShift ? "Reporte final de kilometraje y niveles para cierre de transmisión." : 
            "Actualización táctica de posición y novedades operativas.")}
          </p>
        </div>

        {error && !showAuth && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-wider text-center animate-bounce">
            {error}
          </div>
        )}

                {/* 1. Y 2. FLUJO OPERATIVO UNIFICADO (PRIMER Y SEGUNDO VIAJE) */}
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
                   <div className={`h-full bg-blue-500 transition-all duration-1000 ${gpsLocation ? 'w-full shadow-[0_0_8px_#3b82f6]' : 'w-1/3 animate-pulse'}`} />
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

        {/* 3. FINALIZAR DÍA: Resumen de cierre */}
        {isFinishingShift && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <div className="p-6 bg-blue-900/10 border border-blue-500/20 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden">

                <div className="flex justify-between items-start mb-4 relative z-10">
                   <p className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px]">Cierre de Transmisión</p>
                   <button type="button" onClick={() => setIsFinishingShift(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all">Cancelar</button>
                </div>
                <h3 className="text-white font-black text-2xl uppercase tracking-tighter relative z-10">Final de Jornada - {vehiculo.patente}.</h3>
             </div>

             <div className="p-1 bg-[#020617]/40 rounded-2xl border border-white/5 space-y-3 max-w-[200px] mx-auto mb-4">
                <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">
                   <span>Señal GPS</span>
                   <span className={gpsLocation ? "text-blue-500" : "text-amber-500"}>{gpsLocation ? "Conectado" : "Buscando"}</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden mx-3 mb-3">
                   <div className={`h-full bg-blue-500 transition-all duration-1000 ${gpsLocation ? 'w-full shadow-[0_0_8px_#3b82f6]' : 'w-1/3 animate-pulse'}`} />
                </div>
             </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-[3rem] shadow-2xl relative overflow-hidden space-y-10">
              <div className="space-y-4">
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] text-center">Kilometraje Final</label>
                <div className="relative group max-w-xs mx-auto">
                  <input
                    name="kmActual"
                    type="number"
                    required
                    className="w-full bg-[#020617] text-center border-2 border-blue-500/20 rounded-2xl px-5 py-8 text-white focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-black text-5xl shadow-2xl"
                    placeholder="000"
                  />
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5 text-center">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] mb-6 inline-block">Nivel de Combustible</label>
                <div className="grid grid-cols-5 gap-2">
                  {["LLENO", "3/4", "1/2", "1/4", "RESERVA"].map((val, idx) => (
                    <label key={val} className="cursor-pointer relative flex flex-col items-center group">
                      <input type="radio" name="nivelCombustible" value={val} defaultChecked={idx===0} className="peer sr-only" required />
                      <div className="w-full text-center py-5 rounded-xl font-black text-[9px] uppercase text-slate-600 bg-slate-900/50 border border-white/5 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-400 transition-all">
                        {val}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUTH MODAL & NOVEDADES */}
        {showAuth && (
          <div className="space-y-4 p-8 bg-amber-500/10 border border-amber-500/30 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-md">
            <div className="text-center">
               <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
               </div>
              <label className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em]">Autorización Maestra</label>
            </div>
            <input
              type="text"
              required
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="w-full bg-slate-950 border-2 border-amber-500/40 rounded-2xl px-5 py-6 text-white font-mono text-5xl tracking-[0.6em] text-center focus:ring-8 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder:text-slate-900"
              placeholder="0000"
              maxLength={4}
            />
          </div>
        )}

        {(!isFinishingShift && !changingVehicle || isFinishingShift) && (
          <div className="space-y-3 animate-in fade-in duration-700 bg-white/5 p-6 rounded-[2.5rem] border border-white/5 mt-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] pl-1">Observaciones</label>
            <textarea
              name="novedades"
              rows={2}
              disabled={loading}
              className="w-full bg-[#020617] border-2 border-white/5 rounded-2xl px-5 py-5 text-white focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-800 text-sm font-medium"
              placeholder="Escribe novedades aquí..."
            />
          </div>
        )}

        {/* BOTONES DE ACCIÓN */}
        <div className="pt-4 fixed bottom-6 left-6 right-6 sm:relative sm:inset-0 sm:pt-4 z-50">
          {!isFirstLog && !isFinishingShift && !changingVehicle ? (
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-6 px-4 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] bg-blue-600 hover:bg-blue-500 text-white shadow-2xl active:scale-[0.98] flex justify-center items-center gap-3 transition-all"
              >
                {loading ? <div className="h-5 w-5 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : "Transmitir Parada"}
              </button>
              <button
                type="button"
                onClick={() => setIsFinishingShift(true)}
                className="flex-1 py-6 px-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest bg-slate-900 border border-slate-700 text-slate-400 hover:border-blue-500 hover:text-white active:scale-95 flex flex-col justify-center items-center gap-1 transition-all"
              >
                Cerrar Turno
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading || changingVehicle}
              className="w-full py-7 px-6 rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.6em] bg-blue-600 shadow-2xl text-white hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <span className="relative z-10">
                  {isFinishingShift ? "Confirmar Cierre" : "Confirmar Reporte"}
                </span>
              )}
            </button>
          )}
        </div>
        
        <div className="h-24 sm:hidden"></div>
      </form>
      
      <style jsx global>{`
        .glow-blue {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.2), inset 0 0 20px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}
