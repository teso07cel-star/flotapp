"use client";
import { useState, useEffect, useRef } from "react";
import { StrategicGearIcon } from "./FuturisticIcons";
import { bindDriverToDevice, checkEstadoAutorizacion } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function DriverAuthClient({ choferes = [], initialDriverName }) {
  const router = useRouter();
  const [selectedChofer, setSelectedChofer] = useState(initialDriverName || "");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeviceAuthorized, setIsDeviceAuthorized] = useState(false);
  const [authStep, setAuthStep] = useState(1); // 1: Select/Request, 2: Pending
  const [deviceOperatorName, setDeviceOperatorName] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("");
  const pollingRef = useRef(null);

  // IDENTIFICACIÓN TÁCTICA AUTOMÁTICA
  useEffect(() => {
    const performAuthCheck = async () => {
      const devId = localStorage.getItem("flotapp_device_id");
      if (!devId) {
        setLoading(false);
        return;
      }

      try {
        const res = await checkEstadoAutorizacion(devId);
        if (res.success && res.estado === "APROBADO") {
          setIsDeviceAuthorized(true);
          
          // Auto-selección inteligente del último conductor
          const lastDriver = localStorage.getItem("flotapp_last_driver");
          if (lastDriver && !selectedChofer) {
             setSelectedChofer(lastDriver);
          }
        } else if (res.success && res.estado === "PENDIENTE") {
          setAuthStep(2);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    performAuthCheck();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
        null,
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleRequestAuth = async (nameToRequest) => {
    const targetName = nameToRequest || deviceOperatorName;
    if (!targetName.trim()) return;

    setIsRequesting(true);
    setErrorMessage("");
    const devId = localStorage.getItem("flotapp_device_id");
    try {
      const { solicitarAutorizacion } = await import("@/lib/actions");
      const res = await solicitarAutorizacion(targetName.trim(), devId);
      if (res.success) {
        setAuthStep(2);
      } else {
        setErrorMessage(res.error || "Fallo en autorización");
      }
    } catch (err) {
      setErrorMessage("Error de enlace");
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    if (authStep === 2) {
       const devId = localStorage.getItem("flotapp_device_id");
       pollingRef.current = setInterval(async () => {
          const res = await checkEstadoAutorizacion(devId);
          if (res.success && res.estado === "APROBADO") {
             clearInterval(pollingRef.current);
             setIsDeviceAuthorized(true);
             setAuthStep(1);
          } else if (res.success && res.estado === "RECHAZADO") {
             clearInterval(pollingRef.current);
             setErrorMessage("Vinculación denegada.");
             setAuthStep(1);
          }
       }, 3000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [authStep]);

  const handleLogin = async (name) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const devId = localStorage.getItem("flotapp_device_id");
      const bindRes = await bindDriverToDevice(name, devId);
      
      if (!bindRes.success) {
        setErrorMessage(bindRes.error);
        setLoading(false);
        return;
      }

      // Persistencia de memoria corporativa
      localStorage.setItem("flotapp_last_driver", name);

      const { createRegistroDiario } = await import("@/lib/actions");
      await createRegistroDiario({
          nombreConductor: name,
          tipoReporte: "INICIO_JORNADA",
          lugarGuarda: gpsLocation || "VIRTUAL_B4"
      });

      document.cookie = `driver_name=${encodeURIComponent(name)}; path=/; max-age=31536000`;
      router.push('/');
    } catch (err) {
      setErrorMessage("Error en despliegue de jornada");
      setLoading(false);
    }
  };

  if (loading) {
     return (
        <div className="py-24 flex flex-col items-center gap-6">
           <StrategicGearIcon className="w-14 h-14 text-blue-500 animate-spin-slow" />
           <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Analizando Credenciales...</p>
        </div>
     );
  }

  if (authStep === 2) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-10 text-center animate-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-2xl">
          <StrategicGearIcon className="text-blue-500 animate-spin-slow w-12 h-12" />
        </div>
        <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Protocolo Pendiente</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] leading-relaxed">Esperando validación del administrador...</p>
        </div>
        <div className="pt-10 flex flex-col gap-4">
            <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest italic">Terminal ID: {localStorage.getItem("flotapp_device_id")?.slice(0,16)}</p>
            <button onClick={() => setAuthStep(1)} className="text-[9px] text-blue-400/40 hover:text-blue-400 uppercase font-black tracking-widest transition-colors">Abortar Operación</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in duration-1000">
      
      {!isExternal ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Identidad Operativa</label>
            <div className="relative group">
                <select
                  value={selectedChofer}
                  onChange={(e) => { setSelectedChofer(e.target.value); setErrorMessage(""); }}
                  className="w-full bg-[#020617] border-2 border-blue-500/20 rounded-2xl px-6 py-6 text-white outline-none focus:border-blue-500 transition-all font-black uppercase tracking-widest text-sm appearance-none cursor-pointer text-center"
                >
                  <option value="">-- SELECCIONAR NOMBRE --</option>
                  {choferes.map((c) => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500/30">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
          </div>

          {selectedChofer && (
            <button 
              onClick={() => isDeviceAuthorized ? handleLogin(selectedChofer) : handleRequestAuth(selectedChofer)}
              disabled={isRequesting}
              className={`w-full py-6 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(0,0,0,0.3)] active:scale-95 transition-all animate-in slide-in-from-bottom-4
                ${isDeviceAuthorized ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/10' : 'bg-slate-800 hover:bg-slate-700'}
              `}
            >
              {isRequesting ? "PROCESANDO..." : (isDeviceAuthorized ? "INICIAR JORNADA" : "SOLICITAR VÍNCULO")}
            </button>
          )}

          <button 
            onClick={() => setIsExternal(true)}
            className="w-full text-[10px] font-black text-slate-700 uppercase tracking-widest hover:text-blue-500 transition-colors py-2"
          >
            No estoy en la lista
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Alta de Operador Nuevo</label>
            <input 
              type="text"
              value={deviceOperatorName}
              onChange={(e) => setDeviceOperatorName(e.target.value.toUpperCase())}
              placeholder="NOMBRE Y APELLIDO"
              className="w-full bg-black/40 border-2 border-slate-800 rounded-2xl p-6 text-center font-black text-white outline-none focus:border-blue-500 transition-all uppercase placeholder:text-slate-700"
              autoFocus
            />
          </div>

          <button 
            onClick={() => handleRequestAuth()}
            disabled={isRequesting || !deviceOperatorName}
            className="w-full py-6 bg-blue-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-30"
          >
            {isRequesting ? "DESCIFRANDO..." : "SOLICITAR ACCESO"}
          </button>

          <button 
            onClick={() => setIsExternal(false)}
            className="w-full text-[10px] font-black text-slate-700 uppercase tracking-widest hover:text-blue-500 transition-colors py-2"
          >
            Volver a la selección
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-[0.2em] text-center animate-in shake-in">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-center flex-col items-center gap-3 pt-6 border-t border-white/5">
         <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="h-1 w-6 bg-blue-500/20 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-full animate-pulse" style={{animationDelay: `${i*200}ms`}} /></div>)}
         </div>
         <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">TACTICA b4.0</span>
      </div>

    </div>
  );
}
