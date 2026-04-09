"use client";
import { useState, useEffect } from "react";
import { createRegistroDiario } from "@/lib/actions";

export default function DriverFormClient({ vehiculo, sucursales, lastLog, identifiedDriver, isFirstLog, operationalStatus, proposedKm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState(0); // 0: Splash, 1: KM Validation, 2: Routine, 3: Finish
  const [authCode, setAuthCode] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("");
  const [success, setSuccess] = useState(false);
  
  // States for the form
  const [currentKm, setCurrentKm] = useState(proposedKm || "");
  const [novedades, setNovedades] = useState("");
  const [changingVehicle, setChangingVehicle] = useState(false);
  const [newPatente, setNewPatente] = useState("");

  // 1. Stage 0 -> 1 Automated transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setStage(1);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // 2. GPS Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
        null,
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handlePlateChange = () => {
    if (newPatente.trim()) {
      window.location.href = `/driver/form?patente=${newPatente.trim().toUpperCase()}`;
    }
  };

  const handleSubmit = async (e, type = "PARADA") => {
    if (e) e.preventDefault();
    if (loading) return; // Prevent double submission
    
    setLoading(true);
    setError(null);

    const formData = e ? new FormData(e.target) : new FormData();
    const sucursalIds = e ? formData.getAll("sucursalIds").map(id => parseInt(id)) : [];
    
    const payload = {
      vehiculoId: vehiculo.id,
      nombreConductor: identifiedDriver,
      kmActual: parseInt(currentKm),
      nivelCombustible: formData.get("nivelCombustible"),
      novedades: novedades,
      sucursalIds: sucursalIds,
      tipoReporte: type,
      lugarGuarda: gpsLocation,
      authCode
    };

    try {
      const res = await createRegistroDiario(payload);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
            if (type === "CIERRE") {
                document.cookie = "driver_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                window.location.href = "/";
            } else {
                // Si la parada fue "OTROS", podríamos querer forzar algo, pero por ahora seguimos el flujo estándar de redirect
                window.location.href = "/?success=true";
            }
        }, 1500);
      } else {
        if (res.error === "MILEAGE_AUTH_REQUIRED") {
          setShowAuth(true);
          setError("El kilometraje requiere autorización maestra.");
        } else {
          setError(res.error);
        }
        setLoading(false);
      }
    } catch (err) {
      setError("Falla de conexión al transmitir.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-widest text-center">Transmisión Exitosa</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Sincronizando con Centro de Mando...</p>
      </div>
    );
  }

  if (stage === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
         <div className="relative w-24 h-24 mb-10">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
            <div className="absolute inset-2 bg-blue-500/10 rounded-full animate-pulse border border-blue-500/30" />
            <div className="absolute inset-0 flex items-center justify-center">
               <img src="/icons/admin_hud.png" className="w-12 h-12 mix-blend-screen opacity-80" alt="HUD" />
            </div>
         </div>
         <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-3">TACTICA <span className="text-blue-500">b4.0</span></h2>
         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] animate-pulse">Iniciando Protocolo Operativo...</p>
         <div className="mt-8 w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_forwards]" />
         </div>
         <style jsx>{`
            @keyframes loading {
              0% { width: 0%; }
              100% { width: 100%; }
            }
         `}</style>
      </div>
    );
  }

  if (stage === 1) {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
         <div className="text-center">
            <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2">{isFirstLog ? "Validación de Inicio" : "Continuidad Bitácora"}</p>
            <h3 className="text-white text-3xl font-black tracking-tight uppercase">{vehiculo.patente}</h3>
         </div>

         <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] text-center mb-6">Kilometraje en Tablero</label>
            
            <div className="relative max-w-xs mx-auto mb-6">
               <input 
                  type="number"
                  value={currentKm}
                  onChange={(e) => { setCurrentKm(e.target.value); setError(null); }}
                  className="w-full bg-[#020617] text-center border-2 border-blue-500/20 rounded-2xl px-5 py-8 text-white focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-black text-5xl shadow-2xl"
               />
               <span className="absolute bottom-4 right-6 text-blue-500 font-black text-xs uppercase opacity-40">KM</span>
            </div>

            <div className="text-center space-y-2">
               {operationalStatus.lastWasOtros && (
                  <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest animate-pulse mb-2">⚠️ Validar después de parada externa</p>
               )}
               <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">
                  {isFirstLog ? `Último Cierre: ${proposedKm.toLocaleString()} KM` : `Cálculo de Ruta: ${proposedKm.toLocaleString()} KM`}
               </p>
               {currentKm != proposedKm && (
                  <button onClick={() => setCurrentKm(proposedKm)} className="text-[9px] text-blue-400 font-black uppercase tracking-widest border-b border-blue-400/30 pb-0.5">Sincronizar Sugerido</button>
               )}
            </div>
         </div>

         {!changingVehicle ? (
            <button onClick={() => setChangingVehicle(true)} className="w-full py-4 text-[9px] text-slate-700 hover:text-white uppercase font-black tracking-widest transition-all">¿Cambiar de Unidad?</button>
         ) : (
            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-[2rem] space-y-4">
               <input 
                  type="text" 
                  value={newPatente}
                  onChange={(e) => setNewPatente(e.target.value.toUpperCase())}
                  placeholder="PATENTE"
                  className="w-full bg-black/40 border border-slate-700 rounded-xl p-4 text-center font-black text-2xl text-white outline-none"
               />
               <div className="flex gap-2">
                  <button onClick={() => setChangingVehicle(false)} className="flex-1 py-3 text-[9px] font-black uppercase text-slate-500">Cancelar</button>
                  <button onClick={handlePlateChange} className="flex-1 py-3 bg-blue-600 rounded-xl text-white font-black uppercase text-[9px]">Confirmar</button>
               </div>
            </div>
         )}

         <button 
            onClick={() => setStage(2)} 
            disabled={!currentKm}
            className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all disabled:opacity-30"
         >
            Proceder al Registro &rarr;
         </button>
      </div>
    );
  }

  if (stage === 2) {
    return (
      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
         <div className="flex items-center justify-between px-2">
            <div>
               <p className="text-blue-500 font-black uppercase tracking-[0.2em] text-[9px]">Terminal</p>
               <h3 className="text-white text-xl font-black">{vehiculo.patente}</h3>
            </div>
            <div className="text-right">
               <p className="text-slate-500 font-bold uppercase text-[9px]">Validado</p>
               <p className="text-white font-mono font-black">{currentKm} KM</p>
            </div>
         </div>

         <div className="space-y-4">
            <div className="flex justify-between items-center pl-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Sucursales Visitadas</label>
                <span className="text-[8px] font-black text-slate-700 uppercase italic">Multi-selección activa</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar p-1">
               {sucursales.map(s => (
                  <label key={s.id} className="flex items-center gap-4 p-5 bg-slate-900/40 border border-white/5 rounded-[2rem] hover:bg-slate-900/80 hover:border-blue-500/30 transition-all cursor-pointer group has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/5">
                     <input type="checkbox" name="sucursalIds" value={s.id} className="peer hidden" />
                     <div className="w-5 h-5 rounded-full border-2 border-slate-700 flex items-center justify-center peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all">
                        <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                     </div>
                     <div className="flex-1">
                        <p className="text-[11px] font-black text-slate-300 group-hover:text-white uppercase transition-colors">{s.nombre}</p>
                     </div>
                  </label>
               ))}
            </div>
         </div>

         <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block pl-2">Observaciones</label>
            <textarea 
               value={novedades}
               onChange={(e) => setNovedades(e.target.value)}
               placeholder="Inconvenientes, otros destinos, motivos de demora..."
               className="w-full bg-[#020617] border-2 border-white/5 rounded-[2.5rem] p-6 text-white text-sm font-medium focus:border-blue-500 outline-none transition-all resize-none h-32 placeholder:text-slate-700"
            />
         </div>

         {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase text-center animate-shake">
                {error}
            </div>
         )}

         <div className="flex flex-col gap-4 pt-4">
            <button 
               type="submit" 
               disabled={loading}
               className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all text-xs flex items-center justify-center gap-3 disabled:opacity-50"
            >
               {loading ? (
                   <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Transfiriendo...
                   </>
               ) : "Emitir Parada"}
            </button>
            
            <button 
               type="button" 
               onClick={() => setStage(3)}
               className="w-full py-5 border-2 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 rounded-[2.5rem] font-black uppercase tracking-[0.4em] transition-all text-[10px]"
            >
               Finalizar Turno
            </button>
         </div>
      </form>
    );
  }

  if (stage === 3) {
    return (
      <form onSubmit={(e) => handleSubmit(e, "CIERRE")} className="space-y-8 animate-in fade-in duration-500 text-center">
         <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
         </div>

         <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Finalizar Operativa</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mb-10">Cierre de Registro Diario</p>
         </div>

         <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-2xl text-left space-y-10">
            <div className="space-y-4">
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Kilometraje de Regreso</label>
               <input 
                  type="number"
                  value={currentKm}
                  onChange={(e) => setCurrentKm(e.target.value)}
                  className="w-full bg-[#020617] text-center border-2 border-red-500/20 rounded-2xl px-5 py-8 text-white focus:ring-8 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-black text-5xl"
               />
            </div>

            <div className="space-y-6 pt-6 border-t border-white/5 text-center">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] block mb-4">Estado de Combustible</label>
               <div className="grid grid-cols-5 gap-2">
                 {["LLENO", "3/4", "1/2", "1/4", "RESERVA"].map((val) => (
                   <label key={val} className="cursor-pointer">
                     <input type="radio" name="nivelCombustible" value={val} className="peer sr-only" required />
                     <div className="w-full text-center py-5 rounded-xl font-black text-[8px] uppercase text-slate-600 bg-slate-900 peer-checked:bg-red-600 peer-checked:text-white transition-all border border-white/5">
                       {val}
                     </div>
                   </label>
                 ))}
               </div>
            </div>
         </div>

         <div className="flex flex-col gap-4">
            <button 
               type="submit" 
               disabled={loading}
               className="w-full py-8 bg-red-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.6em] shadow-2xl active:scale-95 transition-all text-sm disabled:opacity-50"
            >
               {loading ? "Cerrando..." : "Proceder al Cierre"}
            </button>
            <button type="button" onClick={() => setStage(2)} className="text-[10px] text-slate-600 uppercase font-black tracking-widest hover:text-white transition-colors">Volver</button>
         </div>
      </form>
    );
  }

  return null;
}
