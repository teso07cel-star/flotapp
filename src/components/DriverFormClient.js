"use client";
import { useState, useEffect } from "react";
import { createRegistroDiario } from "@/lib/actions";

export default function DriverFormClient({ vehiculo, sucursales, lastLog, identifiedDriver, isFirstLog }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [isFinishingShift, setIsFinishingShift] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  
  // Nuevo estado para cambiar vehículo en medio del turno
  const [changingVehicle, setChangingVehicle] = useState(false);
  const [newPatente, setNewPatente] = useState("");

  useEffect(() => {
    if ("geolocation" in navigator) {
      setGpsLoading(true);
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
      sucursalIds: isFirstLog || isFinishingShift ? [] : formData.getAll("sucursalIds").map(id => parseInt(id)),
      authCode: authCode,
      tipoReporte: isFirstLog ? "INICIO" : (isFinishingShift ? "CIERRE" : "PARADA"),
      lugarGuarda: gpsLocation
    };

    if ((isFirstLog || isFinishingShift) && !data.kmActual) {
      setError("El kilometraje es obligatorio.");
      setLoading(false);
      return;
    }

    const res = await createRegistroDiario(data);

    if (res.success) {
      window.location.href = "/?success=true";
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
        <div className="bg-blue-600/20 border border-blue-500/50 backdrop-blur-md p-4 rounded-2xl mb-6 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <h4 className="text-blue-400 font-black tracking-widest text-xs uppercase mb-1">
            {isFirstLog ? "Tutorial 1/3: Inicio de Turno" : (isFinishingShift ? "Tutorial 3/3: Cierre de Turno" : "Tutorial 2/3: Flash Entry Premium")}
          </h4>
          <p className="text-white text-sm font-medium">
            {isFirstLog ? "Confirma el kilometraje, se detectó un inicio de turno o cambio de unidad." : 
            (isFinishingShift ? "Ingresá el kilometraje final y combustible para cerrar tu jornada." : 
            "Reconocimiento biométrico/visual. Confirma si sigues usando la misma unidad.")}
          </p>
        </div>

        {error && !showAuth && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-wider text-center animate-bounce">
            {error}
          </div>
        )}

        {/* 1. INICIO DE JORNADA / CAMBIO DE VEHICULO */}
        {isFirstLog && (
          <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
             
             {/* PREMIUM HEADER - Primer Log */}
             <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center text-blue-500 mx-auto shadow-inner shadow-blue-500/10 border-2 border-blue-500/30 relative">
                   <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
                   <span className="text-4xl font-black text-white relative z-10 drop-shadow-md">{driverInitial}</span>
                </div>
                <div className="space-y-1">
                   <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-[11px]">Operador Identificado</p>
                   <h3 className="text-white text-3xl font-black tracking-tight">{identifiedDriver || lastLog?.nombreConductor || "Invitado"}</h3>
                   <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Iniciando en Unidad {vehiculo.patente.toUpperCase()}</p>
                </div>
             </div>
            
             <div className="p-1 bg-gray-950/50 rounded-2xl border border-white/5 space-y-3 max-w-[200px] mx-auto">
                <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 py-2">
                   <span>Señal GPS</span>
                   <span className={gpsLocation ? "text-emerald-500" : "text-amber-500"}>{gpsLocation ? "Conectado" : "Buscando"}</span>
                </div>
                <div className="h-1 bg-gray-900 rounded-full overflow-hidden mx-3 mb-3">
                   <div className={`h-full bg-blue-500 transition-all duration-1000 ${gpsLocation ? 'w-full' : 'w-1/3 animate-pulse'}`} />
                </div>
             </div>

             <div className="space-y-4 bg-white/5 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-2 -translate-y-2">
                  <svg className="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
               </div>
               
               <div className="space-y-3 relative z-10">
                 <label className="block text-[11px] font-black uppercase text-white tracking-[0.2em] text-center">Confirmar Kilometraje</label>
                 <div className="relative group">
                   <input
                     name="kmActual"
                     type="number"
                     required
                     defaultValue={lastLog?.kmActual || ""}
                     className="w-full bg-gray-950 text-center border-2 border-blue-500/20 rounded-2xl px-5 py-6 text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-black text-4xl shadow-inner shadow-blue-500/10"
                     placeholder="000000"
                   />
                   <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-blue-500 font-black text-xs uppercase tracking-widest">km</div>
                 </div>
                 <p className="text-[9px] text-gray-500 font-bold text-center uppercase tracking-widest italic pt-2">Último registro de la unidad: {lastLog?.kmActual?.toLocaleString()} km</p>
                 <p className="text-[8px] text-orange-500/80 font-bold text-center uppercase tracking-widest italic">Aviso al supervisor automático en caso de cambio.</p>
               </div>
             </div>
          </div>
        )}

        {/* 2. JORNADA ACTIVA / RE-INGRESOS RÁPIDOS */}
        {!isFirstLog && !isFinishingShift && (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
             
             {/* PREMIUM HEADER - Segundo Log */}
             <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[2rem] shadow-xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full" />
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400 relative z-10">
                   <span className="text-2xl font-black text-white">{driverInitial}</span>
                </div>
                <div className="relative z-10">
                   <p className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[9px] mb-1">Conductor Verificado</p>
                   <h3 className="text-white text-xl font-black tracking-tight uppercase">{identifiedDriver || lastLog?.nombreConductor || "Valido"}</h3>
                </div>
             </div>

             {/* CONFIRMACION DE VEHICULO */}
             <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative overflow-hidden group">
               
               {!changingVehicle ? (
                 <div className="space-y-6">
                   <div className="text-center">
                     <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black mb-2">Unidad Actual</p>
                     <h2 className="text-4xl text-white font-black uppercase tracking-[0.3em] font-mono shadow-sm">{vehiculo.patente}</h2>
                     <p className="text-emerald-400 text-[11px] font-black uppercase tracking-widest mt-4">¿Seguís manejando este vehículo?</p>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <button type="button" onClick={() => setChangingVehicle(true)} className="py-4 rounded-xl border-2 border-gray-700 bg-gray-900 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:border-gray-500 focus:outline-none transition-all active:scale-95">
                       No, lo cambié
                     </button>
                     <div className="py-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-black uppercase tracking-widest text-[10px] text-center flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                       Sí, Continuar
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-4 animate-in fade-in duration-300">
                   <label className="block text-[10px] font-black uppercase text-blue-400 tracking-widest text-center">Ingresá la Nueva Patente</label>
                   <input
                     type="text"
                     autoFocus
                     value={newPatente}
                     onChange={(e) => setNewPatente(e.target.value)}
                     className="w-full bg-gray-950 text-center border-2 border-blue-500/40 rounded-2xl px-5 py-5 text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-black text-3xl uppercase tracking-widest"
                     placeholder="AB123CD"
                   />
                   <div className="flex gap-2">
                     <button type="button" onClick={() => setChangingVehicle(false)} className="flex-1 py-4 bg-gray-900 border border-white/5 rounded-xl text-gray-500 font-black uppercase tracking-widest text-[10px]">Cancelar</button>
                     <button type="button" onClick={handleChangeVehicleRedirect} disabled={!newPatente.trim()} className="flex-[2] py-4 bg-blue-600 rounded-xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 disabled:opacity-50">Cargar Vehículo</button>
                   </div>
                   <p className="text-[8px] text-gray-500 text-center uppercase tracking-widest mt-2 italic">Se te pedirán los kilómetros de la nueva unidad.</p>
                 </div>
               )}

             </div>

             {/* LISTA DE SUCURSALES (oculto temporalmente si está cambiando vehículo, para enfocar la vista) */}
             {!changingVehicle && (
               <div className="space-y-4 animate-in slide-in-from-bottom-4">
                 <div className="flex justify-between items-end px-2">
                   <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] font-sans">Sucursales Visitadas</label>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar p-1">
                   {sucursales.map(s => (
                     <label
                       key={s.id}
                       className="flex items-center gap-4 p-5 rounded-[1.8rem] border border-white/5 bg-gray-900/40 hover:bg-gray-800/60 hover:border-emerald-500/30 transition-all cursor-pointer group/item relative overflow-hidden"
                     >
                       <div className="relative flex items-center justify-center z-10">
                         <input 
                           type="checkbox" 
                           name="sucursalIds" 
                           value={s.id}
                           className="w-6 h-6 rounded-lg border-2 border-gray-700 bg-gray-950 text-emerald-500 focus:ring-offset-gray-900 focus:ring-emerald-500 transition-all"
                         />
                       </div>
                       <div className="flex-1 z-10">
                         <div className="text-[11px] font-black text-gray-300 group-hover/item:text-emerald-400 transition-colors uppercase tracking-tight leading-none mb-1">{s.nombre}</div>
                         <div className="text-[9px] text-gray-600 font-bold truncate uppercase tracking-tighter">{s.direccion}</div>
                       </div>
                     </label>
                   ))}
                 </div>
               </div>
             )}

          </div>
        )}

        {/* 3. FINALIZAR DÍA: Resumen de cierre */}
        {isFinishingShift && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <div className="p-6 bg-rose-600/10 border border-rose-600/20 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-3xl rounded-full" />
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <p className="text-rose-500 font-black uppercase tracking-[0.2em] text-[10px]">Cierre del Turno Diario</p>
                  <button type="button" onClick={() => setIsFinishingShift(false)} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all">Cancelar</button>
               </div>
               <h3 className="text-white font-black text-2xl leading-tight uppercase tracking-tight relative z-10">Unidad {vehiculo.patente}.</h3>
               <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1 relative z-10">Completá los datos finales de la jornada</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden space-y-8">
              <div className="space-y-3">
                <label className="block text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] text-center">Kilometraje Final</label>
                <div className="relative group max-w-xs mx-auto">
                  <input
                    name="kmActual"
                    type="number"
                    required
                    className="w-full bg-gray-950 text-center border-2 border-rose-500/20 rounded-2xl px-5 py-6 text-white focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-black text-4xl shadow-inner shadow-rose-500/5"
                    placeholder="000000"
                  />
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-rose-500 font-black text-xs uppercase tracking-widest">km</div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="block text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] text-center mb-4">Nivel Tanque Combustible</label>
                <div className="grid grid-cols-5 gap-2">
                  {["LLENO", "3/4", "1/2", "1/4", "RESERVA"].map((val, idx) => (
                    <label key={val} className="cursor-pointer relative flex flex-col items-center group">
                      <input type="radio" name="nivelCombustible" value={val} defaultChecked={idx===0} className="peer sr-only" required />
                      <div className="w-full text-center py-6 rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-tighter text-gray-600 bg-gray-950 border border-white/5 peer-checked:bg-rose-600 peer-checked:text-white peer-checked:border-rose-500 peer-checked:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all">
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
          <div className="space-y-4 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-md">
            <div className="text-center">
               <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
               </div>
              <label className="text-[12px] font-black text-amber-500 uppercase tracking-[0.2em]">Autorización Requerida</label>
            </div>
            <input
              type="text"
              required
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="w-full bg-gray-950 border-2 border-amber-500/40 rounded-2xl px-5 py-5 text-white font-mono text-4xl tracking-[0.5em] text-center focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder:text-gray-900"
              placeholder="0000"
              maxLength={4}
            />
          </div>
        )}

        {(isFirstLog || isFinishingShift) && (
          <div className="space-y-3 animate-in fade-in duration-700 bg-white/5 p-5 rounded-[2rem] border border-white/5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Notas Adicionales (Opcional)</label>
            <textarea
              name="novedades"
              rows={2}
              disabled={loading}
              className="w-full bg-gray-950 border-2 border-white/5 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-800 text-sm font-medium"
              placeholder="Algún aviso o falla a registrar..."
            />
          </div>
        )}

        {/* BOTONES DE ACCIÓN */}
        <div className="pt-4 fixed bottom-6 left-6 right-6 sm:relative sm:inset-0 sm:pt-4 z-50">
          {!isFirstLog && !isFinishingShift && !changingVehicle ? (
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-6 px-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-[0_15px_30px_rgba(16,185,129,0.3)] shadow-emerald-500/20 active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {loading ? <div className="h-5 w-5 border-4 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" /> : "Registrar Paradas"}
              </button>
              <button
                 type="button"
                 onClick={() => setIsFinishingShift(true)}
                 className="flex-1 py-6 px-4 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white shadow-xl active:scale-95 flex flex-col justify-center items-center gap-1 leading-none border-2 border-transparent hover:border-rose-400"
               >
                 <svg className="w-4 h-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                 Cerrar Turno
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading || changingVehicle}
              className={`w-full py-6 px-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] transition-all flex justify-center items-center gap-4 active:scale-[0.97] disabled:opacity-50 
                ${isFinishingShift ? 'bg-gradient-to-r from-rose-600 to-pink-600 shadow-[0_15px_30px_rgba(225,29,72,0.3)]' : 
                  'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_15px_30px_rgba(37,99,235,0.3)]'} 
                text-white hover:brightness-110`}
            >
              {loading ? (
                <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">
                    {isFirstLog ? "Confirmar Ingreso" : (isFinishingShift ? "Finalizar Transmisión" : "Confirmar")}
                  </span>
                  <svg className="h-5 w-5 transition-transform translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Padding space for the fixed bottom button on mobile */}
        <div className="h-24 sm:hidden"></div>
      </form>
    </div>
  );
}
