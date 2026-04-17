"use client";
import { useState, useEffect } from "react";
import { createRegistroDiario } from "@/lib/appActions";

export default function DriverFormClient({ vehiculo, sucursales, lastLog, identifiedDriver, isFirstLog, operationalStatus, proposedKm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState(0); // 0: Splash, 1: KM Validation, 2: Routine, 3: Finish
  const [authCode, setAuthCode] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("");
  
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
    setLoading(true);
    setError(null);

    const formData = e ? new FormData(e.target) : new FormData();
    const sucursalIds = e ? formData.getAll("sucursalIds").map(id => parseInt(id)) : [];
    
    const payload = {
      vehiculoId: vehiculo.id,
      nombreConductor: identifiedDriver,
      kmActual: currentKm,
      nivelCombustible: formData.get("nivelCombustible"),
      novedades: novedades,
      sucursalIds: sucursalIds,
      tipoReporte: type,
      lugarGuarda: gpsLocation,
      authCode,
      patenteManual: vehiculo.id === 0 ? vehiculo.patente : null
    };

    const res = await createRegistroDiario(payload);

    if (res.success) {
      if (type === "CIERRE") {
        document.cookie = "driver_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/";
      } else {
        window.location.href = "/?success=true";
      }
    } else {
      if (res.error === "MILEAGE_AUTH_REQUIRED") {
        setShowAuth(true);
        setError("El kilometraje requiere autorización maestra.");
      } else {
        setError(res.error);
      }
      setLoading(false);
    }
  };

  // --- RENDERS ---
  if (stage === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-1000">
         <div className="relative w-32 h-32 mb-12">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
            <div className="absolute inset-2 bg-blue-500/10 rounded-full animate-pulse border border-blue-500/30" />
            <div className="absolute inset-4 border-2 border-dashed border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="relative group">
                  <img src="/icons/admin_hud.png" className="w-16 h-16 mix-blend-screen opacity-90 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" alt="HUD" />
                  <div className="absolute -inset-1 bg-blue-500/20 blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
               </div>
            </div>
         </div>
         
         <div className="text-center relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-[shimmer_2s_infinite]" />
            <h2 className="text-3xl font-black text-white uppercase tracking-[0.3em] mb-4 drop-shadow-2xl">
               TACTICA <span className="text-blue-500 animate-pulse">b4.0</span>
            </h2>
            <div className="flex items-center justify-center gap-3 overflow-hidden h-4">
               <p className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.5em] translate-y-0 animate-[slideUp_4s_infinite]">
                  Sincronizando Protocolo...
               </p>
            </div>
         </div>

         <div className="mt-12 w-64 h-1.5 bg-slate-900/50 border border-white/5 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 animate-[loading_2.2s_ease-in-out_forwards] relative">
               <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/40 blur-sm" />
            </div>
         </div>

         <style jsx>{`
            @keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }
            @keyframes slideUp { 
               0%, 10% { transform: translateY(20px); opacity: 0; }
               20%, 80% { transform: translateY(0px); opacity: 1; }
               90%, 100% { transform: translateY(-20px); opacity: 0; }
            }
            @keyframes shimmer { 0% { opacity: 0.2; } 50% { opacity: 1; } 100% { opacity: 0.2; } }
         `}</style>
      </div>
    );
  }

  // --- STAGE 1: KM VALIDATION ---
  if (stage === 1) {
    return (
      <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
         <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full scale-90">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
               <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[8px]">{isFirstLog ? "Inicio de Jornada" : "Continuidad Operativa"}</p>
            </div>
            <h3 className="text-white text-4xl font-black tracking-tight uppercase drop-shadow-2xl">{vehiculo.patente}</h3>
         </div>

         <div className="bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 p-10 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] pointer-events-none group-hover:bg-blue-600/20 transition-all duration-1000" />
            
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.5em] text-center mb-10 opacity-70">Validar Odómetro Actual</label>
            
            <div className="relative max-w-sm mx-auto mb-10 group/input">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-focus-within/input:opacity-50 transition duration-500"></div>
               <input 
                  type="number"
                  value={currentKm}
                  onChange={(e) => setCurrentKm(e.target.value)}
                  className="relative w-full bg-[#020617] text-center border-2 border-blue-500/30 rounded-2xl px-5 py-10 text-white focus:ring-0 focus:border-blue-500 outline-none transition-all font-black text-6xl shadow-2xl selection:bg-blue-500/30"
               />
               <span className="absolute bottom-6 right-8 text-blue-500 font-black text-xs uppercase opacity-40">KM</span>
            </div>

            <div className="text-center space-y-4">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic flex items-center justify-center gap-2">
                  <span className="w-4 h-[1px] bg-slate-800" />
                  {isFirstLog ? `Último Cierre: ${proposedKm?.toLocaleString()} KM` : `Sugerido: ${proposedKm?.toLocaleString()} KM`}
                  <span className="w-4 h-[1px] bg-slate-800" />
               </p>
               {currentKm !== proposedKm && (
                  <button 
                    onClick={() => setCurrentKm(proposedKm)} 
                    className="group px-6 py-2 rounded-full border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                  >
                    <span className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em]">Sincronizar con Sugerido</span>
                  </button>
               )}
            </div>
         </div>

         {!changingVehicle ? (
            <button onClick={() => setChangingVehicle(true)} className="w-full py-4 text-[9px] text-slate-600 hover:text-white uppercase font-black tracking-[0.5em] transition-all opacity-50 hover:opacity-100 italic">¿Unidad Incorrecta?</button>
         ) : (
            <div className="p-8 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] space-y-6 animate-in slide-in-from-top-6 duration-500 shadow-2xl">
               <input 
                  type="text" 
                  value={newPatente}
                  onChange={(e) => setNewPatente(e.target.value.toUpperCase())}
                  placeholder="NUEVA PATENTE"
                  className="w-full bg-black/60 border-2 border-slate-800 rounded-xl p-6 text-center font-black text-3xl text-white outline-none focus:border-blue-500 transition-all"
               />
               <div className="flex gap-4">
                  <button onClick={() => setChangingVehicle(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Cancelar</button>
                  <button onClick={handlePlateChange} className="flex-1 py-4 bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl text-white font-black uppercase text-[10px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Confirmar Unidad</button>
               </div>
            </div>
         )}

         <button 
            onClick={() => setStage(2)} 
            disabled={!currentKm || loading}
            className="group relative w-full py-8 bg-blue-600 text-white rounded-[3rem] font-black uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(59,130,246,0.3)] active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none"
         >
            <div className="relative z-10 flex items-center justify-center gap-3">
               Siguiente Nodo <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-transparent opacity-0 group-hover:opacity-20 rounded-[3rem] transition-opacity" />
         </button>
      </div>
    );
  }


  // --- STAGE 2: ROUTINE ---
  if (stage === 2) {
    return (
      <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
         <div className="flex items-end justify-between px-4">
            <div className="space-y-1">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-blue-500 font-black uppercase tracking-[0.2em] text-[9px]">Nodo Operacional Live</p>
               </div>
               <h3 className="text-white text-3xl font-black">{vehiculo.patente}</h3>
            </div>
            <div className="text-right pb-1">
               <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Odómetro</p>
               <p className="text-blue-400 font-mono font-black text-lg">{currentKm} <span className="text-[10px] opacity-50">KM</span></p>
            </div>
         </div>

         <div className="space-y-5">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] block pl-2">Ruta / Sucursales</label>
              <span className="text-[8px] text-slate-600 font-bold uppercase">Multiselección Habilitada</span>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-3 custom-scrollbar p-1">
               {sucursales.map(s => (
                  <label key={s.id} className="flex items-center gap-5 p-7 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] hover:bg-blue-600/10 hover:border-blue-500/40 transition-all cursor-pointer group relative overflow-hidden">
                     <div className="relative">
                        <input type="checkbox" name="sucursalIds" value={s.id} className="peer sr-only" />
                        <div className="w-7 h-7 rounded-xl border-2 border-slate-800 bg-black/40 peer-checked:bg-blue-600 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                           <svg className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                     </div>
                     <div className="flex-1">
                        <p className="text-[13px] font-black text-white/90 uppercase tracking-tight group-hover:text-blue-400 transition-colors leading-tight">{s.nombre}</p>
                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1">ID: HUB-0{s.id}</p>
                     </div>
                     <div className="absolute top-1/2 -translate-y-1/2 -right-4 opacity-0 group-hover:opacity-10 group-hover:right-4 transition-all duration-500">
                        <svg className="w-12 h-12 text-blue-500/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                     </div>
                  </label>
               ))}
            </div>
         </div>

         <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] block pl-4">Observaciones del Turno</label>
            <textarea 
               value={novedades}
               onChange={(e) => setNovedades(e.target.value)}
               placeholder="REGISTRAR NOVEDADES..."
               className="w-full bg-[#020617] border border-white/10 rounded-[2.5rem] p-8 text-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none h-40 shadow-inner placeholder:text-slate-800"
            />
         </div>

         <div className="flex flex-col gap-5 pt-4">
            <button 
               type="submit" 
               disabled={loading}
               className="relative overflow-hidden group w-full py-8 bg-blue-600 text-white rounded-[3rem] font-black uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(59,130,246,0.3)] active:scale-[0.98] transition-all text-[11px]"
            >
               <span className="relative z-10">{loading ? "PROC_TRANSMISIÓN..." : "Transmitir Parada Operativa"}</span>
               <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
            </button>
            
            <button 
               type="button" 
               onClick={() => setStage(3)}
               className="w-full py-6 border-2 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 text-red-500/90 rounded-[2.5rem] font-black uppercase tracking-[0.4em] transition-all text-[9px] flex items-center justify-center gap-3 group"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
               Finalizar Protocolo Diario
            </button>
         </div>
      </form>
    );
  }

  // --- STAGE 3: CLOSE ---
  if (stage === 3) {
    return (
      <form onSubmit={(e) => handleSubmit(e, "CIERRE")} className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 text-center">
         <div className="relative w-28 h-28 mx-auto mb-10">
            <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping opacity-30" />
            <div className="absolute inset-0 bg-red-600/10 rounded-full border-2 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
            </div>
         </div>

         <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-3 drop-shadow-2xl">Cierre de Transmisión</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] mb-12 opacity-80 italic">Confirmación Crítica de Final de Turno</p>
         </div>

         <div className="bg-[#1e1b4b]/30 backdrop-blur-3xl border border-red-500/10 p-10 rounded-[4rem] shadow-2xl text-left space-y-12">
            <div className="space-y-6">
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] text-center">Odómetro de Cierre</label>
               <div className="relative group/input">
                  <div className="absolute -inset-1 bg-red-600/10 rounded-2xl blur opacity-30 group-focus-within/input:opacity-50 transition duration-500"></div>
                  <input 
                     type="number"
                     value={currentKm}
                     onChange={(e) => setCurrentKm(e.target.value)}
                     className="relative w-full bg-[#020617] text-center border-2 border-red-500/20 rounded-2xl px-5 py-10 text-white focus:ring-0 focus:border-red-500 outline-none transition-all font-black text-6xl shadow-2xl"
                  />
               </div>
               <p className="text-[10px] text-slate-600 font-bold text-center uppercase tracking-widest italic pt-2">Verificación de Consistencia: {currentKm} KM</p>
            </div>

            <div className="space-y-8 pt-8 border-t border-white/5 text-center">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.6em] block mb-6">Nivel de Combustible</label>
               <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                 {["LLENO", "3/4", "1/2", "1/4", "RESERVA"].map((val, idx) => (
                   <label key={val} className="cursor-pointer group flex-1">
                     <input type="radio" name="nivelCombustible" value={val} defaultChecked={idx===0} className="peer sr-only" required />
                     <div className="w-full text-center py-6 rounded-2xl font-black text-[9px] uppercase text-slate-600 bg-slate-900 border border-white/5 peer-checked:bg-red-600 peer-checked:text-white peer-checked:border-red-500 peer-checked:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all active:scale-90">
                       {val}
                     </div>
                   </label>
                 ))}
               </div>
            </div>
         </div>

         <div className="flex flex-col gap-5">
            <button 
               type="submit" 
               disabled={loading}
               className="group relative w-full py-10 bg-red-600 text-white rounded-[3.5rem] font-black uppercase tracking-[0.6em] shadow-[0_20px_50px_rgba(239,68,68,0.3)] active:scale-[0.98] transition-all text-[12px]"
            >
               <span className="relative z-10">{loading ? "EJECUTANDO CIERRE..." : "Finalizar y Desconectar"}</span>
               <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
            <button 
              type="button" 
              onClick={() => setStage(2)} 
              className="text-[10px] text-slate-600 uppercase font-black tracking-[0.4em] hover:text-white transition-colors py-4"
            >
               &larr; Volver al Nodo de Operaciones
            </button>
         </div>
      </form>
    );
  }

  return null;
}
