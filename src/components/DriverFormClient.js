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
  const [changingVehicle, setChangingVehicle] = useState(false);
  const [useSameVehicle, setUseSameVehicle] = useState(true);
  const [newPatente, setNewPatente] = useState("");
  
  // El kilometraje solo se edita inicialmente si se está CERRANDO el turno o en INICIO
  const [editKm, setEditKm] = useState(phase === "INICIO" || isFinishingShift);

  // GPS State Management
  const [gpsAttempt, setGpsAttempt] = useState(0);

  useEffect(() => {
    setEditKm(phase === "INICIO" || isFinishingShift);
  }, [isFinishingShift, phase]);

  useEffect(() => {
    const fetchGps = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            setGpsLocation(`${lat}, ${lng}`);
            setGpsLoading(false);
            console.log("📍 GPS Form ONLINE:", `${lat}, ${lng}`);
          },
          (err) => {
            console.error("⚠️ Error GPS:", err);
            setGpsLoading(false);
            // Reintentar si es fase crítica
            if (phase === "INICIO" || isFinishingShift) {
              setTimeout(() => setGpsAttempt(prev => prev + 1), 3000);
            }
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setGpsLoading(false);
      }
    };
    fetchGps();
  }, [gpsAttempt, phase, isFinishingShift]);

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
      tipoReporte: isFinishingShift ? "CIERRE" : (phase === "INICIO" ? "INICIO" : "PARADA"),
      newPatente: !useSameVehicle ? newPatente : null, 
      lugarGuarda: gpsLocation
    };

    if ((phase === "INICIO" || isFinishingShift) && !gpsLocation) {
      setError("PROTOCOLO BLOQUEADO: Se requiere señal GPS para esta operación.");
      setLoading(false);
      return;
    }

    if (editKm && !data.kmActual) {
      setError("El kilometraje es obligatorio para validar el reporte.");
      setLoading(false);
      return;
    }


    const res = await createRegistroDiario(data);

    if (res.success) {
      if (isFinishingShift) {
        document.cookie = "driver_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        localStorage.removeItem("flotapp_driver_name");
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-8 relative max-w-md mx-auto">
        
        {/* OVERLAY EXPLICATIVO */}
        <div className="bg-blue-600/10 border border-blue-500/30 backdrop-blur-md p-4 rounded-2xl mb-6 shadow-2xl">
          <h4 className="text-blue-400 font-black tracking-widest text-[10px] uppercase mb-1">
            {phase === "INICIO" ? "Protocolo: Inicio de Turno" : (isFinishingShift ? "Protocolo: Cierre de Turno" : "Protocolo: Transmisión Activa")}
          </h4>
          <p className="text-white text-[11px] font-medium leading-tight">
            {phase === "INICIO" ? "Validación de odómetro y unidad identificada para inicio de jornada." : 
            (isFinishingShift ? "Reporte final de kilometraje y niveles para cierre de transmisión." : 
            "Actualización táctica de posición y novedades operativas.")}
          </p>
        </div>

        {error && !showAuth && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-wider text-center animate-bounce">
            {error}
          </div>
        )}

        {!isFinishingShift && (
          <div className="space-y-6">
             {/* HEADER IDENTIDAD */}
             <div className="flex flex-col items-center gap-4 bg-[#0f172a] border border-blue-500/20 pt-8 pb-4 px-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="relative z-30 text-center">
                   <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[9px] mb-1">Operador Verificado</p>
                   <h3 className="text-white text-xl font-black tracking-tight uppercase">{identifiedDriver || "Conductor"}</h3>
                </div>

                {/* HUD GPS */}
                <div className={`p-1 rounded-2xl border ${gpsLocation ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'} w-full max-w-[240px] transition-all`}>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest px-3 py-2">
                     <span className="text-slate-500">Señal GPS</span>
                     <span className={gpsLocation ? "text-emerald-500" : "text-red-500 animate-pulse"}>
                       {gpsLocation ? "SINCROMIZADA" : "SOLICITANDO..."}
                     </span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full overflow-hidden mx-3 mb-2">
                     <div className={`h-full transition-all duration-1000 ${gpsLocation ? 'bg-emerald-500 w-full' : 'bg-red-500 w-1/3 animate-ping'}`} />
                  </div>
                </div>
             </div>

             {/* BLOQUE VEHÍCULO / KM */}
             <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
               {phase === "INICIO" ? (
                 <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-slate-500 text-[10px] uppercase tracking-[0.5em] font-black mb-2">Unidad Asignada</p>
                      <h2 className="text-5xl text-white font-black uppercase tracking-[0.3em] font-mono">{vehiculo.patente}</h2>
                    </div>
                    
                    <div className="pt-4 border-t border-white/5 mt-4">
                       {editKm ? (
                          <div className="space-y-3">
                            <label className="block text-[11px] font-black uppercase text-white tracking-[0.3em] text-center mb-4">Validar Odómetro Inicial</label>
                            <input
                              name="kmActual"
                              type="number"
                              required
                              defaultValue={lastLog?.kmActual || ""}
                              className="w-full bg-[#020617] text-center border-2 border-blue-500/20 rounded-2xl px-5 py-8 text-white focus:border-blue-500 outline-none transition-all font-black text-5xl"
                              placeholder="000"
                            />
                          </div>
                       ) : (
                          <div className="space-y-4">
                             <p className="text-[11px] font-black uppercase text-white tracking-[0.3em] text-center mb-4">Confirmación de Odómetro</p>
                             <div className="flex flex-col items-center bg-[#020617]/50 rounded-2xl p-4 border border-white/5">
                                <span className="text-3xl text-emerald-400 font-black mb-1">{lastLog?.kmActual || 0} km</span>
                             </div>
                             <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                <span className="text-emerald-400 text-xs font-black uppercase">Correcto</span>
                                <button type="button" onClick={() => setEditKm(true)} className="px-4 py-2 bg-slate-800 rounded-xl text-slate-400 text-[9px] font-black uppercase">Editar</button>
                             </div>
                             <input type="hidden" name="kmActual" value={lastLog?.kmActual || 0} />
                          </div>
                       )}
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6">
                    {!changingVehicle ? (
                      <div className="text-center space-y-4">
                        <h2 className="text-4xl text-white font-black uppercase tracking-[0.2em] font-mono">{vehiculo.patente}</h2>
                        <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
                           <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-3">¿Misma unidad?</p>
                           <div className="flex gap-2 justify-center">
                              <button type="button" onClick={() => setUseSameVehicle(true)} className="px-5 py-2 bg-emerald-600 rounded-lg text-white text-[9px] font-black uppercase">SÍ</button>
                              <button type="button" onClick={() => setChangingVehicle(true)} className="px-5 py-2 bg-slate-800 rounded-lg text-slate-400 text-[9px] font-black uppercase">NO</button>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                         <label className="block text-[10px] font-black uppercase text-amber-500 tracking-widest text-center">Nueva Patente</label>
                         <input
                           type="text"
                           autoFocus
                           value={newPatente}
                           onChange={(e) => setNewPatente(e.target.value.toUpperCase())}
                           className="w-full bg-[#020617] text-center border-2 border-amber-500/40 rounded-2xl px-5 py-6 text-white outline-none font-black text-4xl"
                           placeholder="X000XX"
                         />
                         <button type="button" onClick={() => { setChangingVehicle(false); setUseSameVehicle(true); }} className="w-full py-3 text-slate-500 text-[9px] font-black uppercase">Cancelar</button>
                      </div>
                    )}
                 </div>
               )}
             </div>

             {/* SUCURSALES */}
             {!changingVehicle && (
               <div className="space-y-4">
                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Nodos de Operativa</label>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                   {sucursales.map(s => (
                     <label key={s.id} className="flex items-center gap-4 p-5 rounded-[2rem] border border-white/5 bg-[#1e293b]/30 hover:bg-[#1e293b]/60 cursor-pointer transition-all">
                       <input type="checkbox" name="sucursalIds" value={s.id} className="w-5 h-5 rounded bg-slate-950 border-slate-700 text-blue-500" />
                       <div className="flex-1">
                         <div className="text-[10px] font-black text-slate-300 uppercase">{s.nombre}</div>
                         <div className="text-[8px] text-slate-600 uppercase">{s.direccion}</div>
                       </div>
                     </label>
                   ))}
                 </div>
               </div>
             )}
          </div>
        )}

        {/* CIERRE DE JORNADA */}
        {isFinishingShift && (
          <div className="space-y-6">
             <div className="p-6 bg-blue-900/10 border border-blue-500/20 rounded-[2.5rem]">
                <h3 className="text-white font-black text-2xl uppercase tracking-tighter">Cierre de Jornada</h3>
                <button type="button" onClick={() => setIsFinishingShift(false)} className="mt-2 text-slate-500 text-[9px] font-black uppercase tracking-widest">Cancelar</button>
             </div>

             <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] space-y-8">
                <div className="space-y-4">
                  <label className="block text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] text-center">Kilometraje Final</label>
                  <input
                    name="kmActual"
                    type="number"
                    required
                    className="w-full bg-[#020617] text-center border-2 border-blue-500/20 rounded-2xl p-8 text-white font-black text-5xl"
                    placeholder="000"
                  />
                </div>
                <div className="space-y-4 text-center">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em]">Nivel de Combustible</label>
                  <div className="grid grid-cols-5 gap-1">
                    {["LLENO", "3/4", "1/2", "1/4", "RESERVA"].map(val => (
                      <label key={val} className="cursor-pointer">
                        <input type="radio" name="nivelCombustible" value={val} className="peer sr-only" required />
                        <div className="py-4 rounded-xl font-black text-[8px] text-slate-600 bg-slate-900 border border-white/5 peer-checked:bg-blue-600 peer-checked:text-white transition-all">
                          {val}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* OBSERVACIONES */}
        {(!changingVehicle) && (
          <div className="space-y-3 bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Observaciones</label>
            <textarea
              name="novedades"
              rows={2}
              className="w-full bg-[#020617] border-2 border-white/5 rounded-2xl p-5 text-white outline-none text-sm font-medium resize-none"
              placeholder="Novedades aquí..."
            />
          </div>
        )}

        {/* BOTÓN PRINCIPAL */}
        <div className="pt-4">
           {phase === "RITMO" && !isFinishingShift && !changingVehicle ? (
              <div className="flex gap-3">
                 <button type="submit" disabled={loading} className="flex-[2] py-6 bg-blue-600 rounded-[2rem] text-white font-black uppercase tracking-[0.3em]">
                   {loading ? "..." : "Transmitir Parada"}
                 </button>
                 <button type="button" onClick={() => setIsFinishingShift(true)} className="flex-1 py-6 bg-slate-900 border border-slate-700 rounded-[2rem] text-slate-400 font-black uppercase text-[10px]">
                   Cierre
                 </button>
              </div>
           ) : (
             <button
               type="submit"
               disabled={loading || changingVehicle || ((phase === "INICIO" || isFinishingShift) && !gpsLocation)}
               className={`w-full py-7 rounded-[2.5rem] font-black uppercase tracking-[0.6em] transition-all ${
                 (phase === "INICIO" || isFinishingShift) && !gpsLocation 
                   ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                   : 'bg-blue-600 text-white'
               }`}
             >
               {loading ? "..." : (isFinishingShift ? "Confirmar Cierre" : "Confirmar Reporte")}
             </button>
           )}
        </div>
      </form>
    </div>
  );
}
