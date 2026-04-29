"use client";
import { useState, useEffect } from "react";
import { createRegistroDiario } from "@/lib/appActions";
import ConfirmationOverlay from "./ConfirmationOverlay";

export default function DriverFormClient({ vehiculo, sucursales, lastLog, identifiedDriver, isFirstLog, operationalStatus, proposedKm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState(0); // 0: Splash, 1: KM Validation, 2: Routine, 3: Finish
  const [authCode, setAuthCode] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("");
  const [submittedRecordId, setSubmittedRecordId] = useState(null);
  
  // States for the form
  const [currentKm, setCurrentKm] = useState(proposedKm || "");
  const [novedades, setNovedades] = useState("");
  const [changingVehicle, setChangingVehicle] = useState(false);
  const [newPatente, setNewPatente] = useState("");
  const [selectedSucursales, setSelectedSucursales] = useState([]);
  const [dynamicProposedKm, setDynamicProposedKm] = useState(proposedKm);

  // 1. Stage 0 -> 1 Automated transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setStage(1);
    }, 800);
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

  // 3. Dynamic Mileage Suggestion
  useEffect(() => {
    const updateMileage = async () => {
      if (selectedSucursales.length === 0) {
        setDynamicProposedKm(operationalStatus.lastKm || proposedKm);
        return;
      }
      
      const res = await import("@/lib/appActions").then(m => m.getRouteMileage(identifiedDriver, selectedSucursales));
      if (res.success) {
        const baseKm = operationalStatus.lastKm || (lastLog?.kmActual || 0);
        setDynamicProposedKm(baseKm + res.data);
      }
    };
    updateMileage();
  }, [selectedSucursales, identifiedDriver, operationalStatus.lastKm, proposedKm, lastLog]);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const handlePlateChange = () => {
    if (newPatente.trim()) {
      window.location.href = `/driver/form?patente=${newPatente.trim().toUpperCase()}`;
    }
  };

  const toggleSucursal = (id) => {
    setSelectedSucursales(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e, type = "PARADA") => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    // PROTOCOLO ANTI-DUPLICADOS (Escudo B8.4)
    const lastSubmitTime = localStorage.getItem("flotapp_last_submit");
    if (lastSubmitTime && (Date.now() - parseInt(lastSubmitTime) < 300000)) { // 5 minutos
       setError("PROTOCOLO BLOQUEADO: Ya se envió una bitácora recientemente. Espere 5 min o verifique su conexión.");
       setLoading(false);
       return;
    }

    const payload = {
      vehiculoId: vehiculo.id,
      nombreConductor: identifiedDriver,
      kmActual: currentKm,
      nivelCombustible: e ? new FormData(e.target).get("nivelCombustible") : null,
      novedades: novedades,
      sucursalIds: selectedSucursales,
      tipoReporte: type,
      lugarGuarda: gpsLocation,
      authCode,
      patenteManual: vehiculo.id === 0 ? vehiculo.patente : null
    };

    try {
      const res = await createRegistroDiario(payload);

      if (res.success) {
        localStorage.setItem("flotapp_last_submit", Date.now().toString());
        if (res.data && res.data.id) {
            setSubmittedRecordId(res.data.id);
        }
        setConfirmationMessage(type === "CIERRE" ? "Protocolo Finalizado" : "Transmisión Exitosa");
        setShowConfirmation(true);
        setLoading(false);
        
        if (type === "CIERRE") {
          // Mantener sesión activa del chofer
        }
      } else {
        if (res.error === "MILEAGE_AUTH_REQUIRED") {
          setShowAuth(true);
          setError("El kilometraje requiere autorización maestra.");
        } else {
          setError(res.error || "Error desconocido");
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("Fallo catastrófico en la transmisión:", err);
      setError("Error de conexión con el servidor Táctico. Reintentando transmisión libre requerida.");
      setLoading(false);
    }
  };

  const handleConfirmationComplete = () => {
    const isCierre = confirmationMessage === "Protocolo Finalizado";
    if (isCierre) {
      window.location.href = "/";
    } else {
      if (submittedRecordId) {
         window.location.href = `/driver/success?id=${submittedRecordId}`;
      } else {
         window.location.href = "/driver/entry";
      }
    }
  };

  return (
    <>
      <ConfirmationOverlay 
        show={showConfirmation} 
        message={confirmationMessage} 
        onComplete={handleConfirmationComplete} 
      />
      
      {stage === 0 && (
          <div className="flex flex-col items-center justify-center py-6 animate-in fade-in duration-500">
            <div className="relative w-24 h-24 mb-6">
               <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
               <div className="absolute inset-2 bg-blue-500/10 rounded-full animate-pulse border border-blue-500/30" />
               <div className="absolute inset-4 border-2 border-dashed border-blue-500/20 rounded-full animate-[spin_5s_linear_infinite]" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative group">
                     <img src="/icons/admin_hud.png" className="w-12 h-12 mix-blend-screen opacity-90 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" alt="HUD" />
                     <div className="text-blue-500 hover:bg-blue-500/10 p-2 rounded-lg transition-all"></div>
                  </div>
               </div>
            </div>
            
            <div className="text-center relative">
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-[shimmer_2s_infinite]" />
               <h2 className="text-3xl font-black text-white uppercase tracking-[0.3em] mb-4 drop-shadow-2xl">
                  TACTICA <span className="text-blue-500 animate-pulse">B8.3</span>
               </h2>
               <p className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.5em]">Sincronizando Protocolo...</p>
            </div>

            <div className="mt-8 w-64 h-1.5 bg-slate-900/50 border border-white/5 rounded-full overflow-hidden shadow-inner">
               <div className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 animate-[loading_0.8s_ease-in-out_forwards] relative" />
            </div>
         </div>
      )}

      {stage === 1 && (
         <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center space-y-2">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full scale-90">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[8px]">{isFirstLog ? "Inicio de Jornada" : "Continuidad Operativa"}</p>
               </div>
               <h3 className="text-white text-4xl font-black tracking-tight uppercase drop-shadow-2xl">{vehiculo.patente}</h3>
            </div>

            <div className="bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 p-10 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden group">
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.5em] text-center mb-10 opacity-70">Validar Odómetro Actual</label>
               <div className="relative max-w-sm mx-auto mb-10 group/input">
                  <input 
                     type="number"
                     value={currentKm}
                     onChange={(e) => setCurrentKm(e.target.value)}
                     className="relative w-full bg-[#020617] text-center border-2 border-blue-500/30 rounded-2xl px-5 py-10 text-white focus:ring-0 focus:border-blue-500 outline-none transition-all font-black text-6xl shadow-2xl"
                  />
                  <span className="absolute bottom-6 right-8 text-blue-500 font-black text-xs uppercase opacity-40">KM</span>
               </div>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic text-center mb-4">
                  {isFirstLog ? `Último Cierre: ${dynamicProposedKm?.toLocaleString()} KM` : `Sugerencia: ${dynamicProposedKm?.toLocaleString()} KM`}
               </p>
            </div>

            <button 
               onClick={() => setStage(2)} 
               disabled={!currentKm || loading}
               className="group relative w-full py-8 bg-blue-600 text-white rounded-[3rem] font-black uppercase tracking-[0.5em] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-30"
            >
               Siguiente Nodo &rarr;
            </button>
         </div>
      )}

      {stage === 2 && (
         <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="flex items-end justify-between px-4">
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                     <p className="text-blue-500 font-black uppercase tracking-[0.2em] text-[9px]">Nodo Operacional Live</p>
                  </div>
                  <h3 className="text-white text-3xl font-black">{vehiculo.patente}</h3>
               </div>
               <div className="text-right">
                  <p className="text-blue-400 font-mono font-black text-lg">{currentKm} KM</p>
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] block pl-2">Ruta / Sucursales</label>
               <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-3 custom-scrollbar">
                  {sucursales.map(s => (
                     <label key={s.id} className="flex items-center gap-4 p-5 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl hover:bg-blue-600/10 transition-all cursor-pointer group">
                        <input 
                           type="checkbox" 
                           checked={selectedSucursales.includes(s.id)}
                           onChange={() => toggleSucursal(s.id)}
                           className="peer sr-only" 
                        />
                        <div className="w-6 h-6 rounded-md border-2 border-slate-800 bg-black/40 peer-checked:bg-blue-600 transition-all" />
                        <div className="flex-1">
                           <p className="text-[14px] font-black text-white uppercase leading-tight">{s.nombre}</p>
                        </div>
                     </label>
                  ))}
               </div>
            </div>

            <div className="space-y-4">
               <textarea 
                  value={novedades}
                  onChange={(e) => setNovedades(e.target.value)}
                  placeholder="REGISTRAR NOVEDADES..."
                  className="w-full bg-[#020617] border border-white/10 rounded-[2.5rem] p-8 text-white text-sm focus:border-blue-500 outline-none transition-all h-32"
               />
            </div>
            <div className="flex flex-col gap-5 pt-4">
               {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-in fade-in zoom-in duration-300">
                     <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center">{error}</p>
                  </div>
               )}
               <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-8 bg-blue-600 text-white rounded-[3rem] font-black uppercase tracking-[0.5em] shadow-2xl active:scale-[0.98] transition-all text-[11px]"
               >
                  {loading ? "TRANSMITIENDO..." : "Transmitir Parada Operativa"}
               </button>
               <button 
                  type="button" 
                  onClick={() => setStage(3)}
                  className="w-full py-6 border-2 border-red-500/20 bg-red-500/5 text-red-500 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[9px]"
               >
                  Finalizar Protocolo Diario
               </button>
            </div>
         </form>
      )}

      {stage === 3 && (
         <form onSubmit={(e) => handleSubmit(e, "CIERRE")} className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 text-center">
            <div>
               <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-3">Cierre de Transmisión</h2>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] mb-12 italic">Confirmación de Final de Turno</p>
            </div>

            <div className="bg-[#1e1b4b]/30 backdrop-blur-3xl border border-red-500/10 p-10 rounded-[4rem] space-y-12">
               <div className="space-y-6">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.6em]">Odómetro de Cierre</label>
                  <input 
                     type="number"
                     value={currentKm}
                     onChange={(e) => setCurrentKm(e.target.value)}
                     className="w-full bg-[#020617] text-center border-2 border-red-500/20 rounded-2xl px-5 py-10 text-white font-black text-6xl shadow-2xl"
                  />
               </div>
               
               <div className="flex flex-wrap justify-center gap-3">
                  {["LLENO", "3/4", "1/2", "1/4", "RESERVA"].map((val, idx) => (
                    <label key={val} className="cursor-pointer flex-1 min-w-[60px]">
                      <input type="radio" name="nivelCombustible" value={val} defaultChecked={idx===0} className="peer sr-only" required />
                      <div className="w-full py-4 rounded-2xl font-black text-[9px] uppercase text-slate-600 bg-slate-900 border border-white/5 peer-checked:bg-red-600 peer-checked:text-white transition-all text-center">
                        {val}
                      </div>
                    </label>
                  ))}
               </div>
            </div>
            <div className="flex flex-col gap-5">
               {showAuth && (
                  <div className="space-y-4 animate-in fade-in zoom-in duration-300 bg-red-500/10 p-6 rounded-3xl border border-red-500/30">
                     <label className="block text-[10px] font-black text-red-400 uppercase tracking-[0.6em] text-center mb-2">Código de Seguridad Requerido</label>
                     <input 
                        type="text"
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value)}
                        placeholder="INGRESE EL PIN"
                        className="w-full bg-[#020617] text-center border-2 border-red-500/30 rounded-2xl px-5 py-6 text-white font-black text-3xl shadow-2xl focus:border-red-500 outline-none"
                     />
                  </div>
               )}
               {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-in fade-in zoom-in duration-300">
                     <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center">{error}</p>
                  </div>
               )}
               <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-10 bg-red-600 text-white rounded-[3.5rem] font-black uppercase tracking-[0.6em] shadow-2xl active:scale-[0.98] transition-all text-[12px]"
               >
                  {loading ? "CERRANDO..." : "Finalizar Turno"}
               </button>
               <button type="button" onClick={() => setStage(2)} className="text-[10px] text-slate-600 uppercase font-black py-4">Volver</button>
            </div>
         </form>
      )}

      <style jsx>{`
         @keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }
         @keyframes shimmer { 0% { opacity: 0.2; } 50% { opacity: 1; } 100% { opacity: 0.2; } }
      `}</style>
    </>
  );
}
