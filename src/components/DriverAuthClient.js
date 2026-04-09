"use client";
import { useState, useEffect, useRef } from "react";
import { StrategicGearIcon } from "./FuturisticIcons";
import { bindDriverToDevice } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function DriverAuthClient({ choferes = [], isDeviceAuthorized, initialDriverName }) {
  const router = useRouter();
  const [selectedChofer, setSelectedChofer] = useState(initialDriverName || "");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [authStep, setAuthStep] = useState(isDeviceAuthorized ? 0 : 1);
  const [deviceOperatorName, setDeviceOperatorName] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("");
  const pollingRef = useRef(null);

  // Capture GPS on mount for identification logs
  useEffect(() => {
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
    if (targetName.trim() !== "") {
      setIsRequesting(true);
      setErrorMessage("");
      const devId = localStorage.getItem("flotapp_device_id");
      try {
        const { solicitarAutorizacion } = await import("@/lib/actions");
        const res = await solicitarAutorizacion(targetName.trim(), devId);
        if (res.success) {
          setAuthStep(2);
        } else {
          setErrorMessage(res.error || "Error desconocido en el servidor");
        }
      } catch (err) {
        setErrorMessage("Error de conexión: " + err.message);
      } finally {
        setIsRequesting(false);
      }
    }
  };

  useEffect(() => {
    // Solo polleamos si el dispositivo NO está autorizado localmente o por server
    if (authStep === 2) {
       const devId = localStorage.getItem("flotapp_device_id");
       pollingRef.current = setInterval(async () => {
          const { checkEstadoAutorizacion } = await import("@/lib/actions");
          const res = await checkEstadoAutorizacion(devId);
          if (res.success && res.estado === "APROBADO") {
             clearInterval(pollingRef.current);
             setAuthSuccess(true);
             setTimeout(() => {
                localStorage.setItem("device_authorized_v1", "true");
                window.location.reload();
             }, 1800);
          } else if (res.success && res.estado === "RECHAZADO") {
             clearInterval(pollingRef.current);
             alert("Tu solicitud de acceso fue rechazada por administración.");
             setAuthStep(1);
          }
       }, 3000);
    }
    return () => {
       if (pollingRef.current) clearInterval(pollingRef.current);
    };
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

      const { createRegistroDiario } = await import("@/lib/actions");
      await createRegistroDiario({
          nombreConductor: name,
          tipoReporte: "INICIO_JORNADA",
          lugarGuarda: gpsLocation || "GPS TEMPORAL"
      });

      document.cookie = `driver_name=${encodeURIComponent(name)}; path=/; max-age=31536000`;
      router.push('/');
    } catch (err) {
      console.error(err);
      setErrorMessage("Error al iniciar sesión");
      setLoading(false);
    }
  };

  const handleSelect = (e) => {
    setSelectedChofer(e.target.value);
    setErrorMessage("");
  };

  // VISTA DE CARGA
  if (loading) {
     return (
        <div className="py-12 flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
           <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest">Sincronizando Identidad...</p>
        </div>
     );
  }

  // VISTA DE SOLICITUD ENVIADA
  if (authStep === 2) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-8 animate-in zoom-in-95 duration-700 text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-2xl relative">
          <StrategicGearIcon className="text-blue-500 animate-spin-slow w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Solicitud Enviada</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] leading-relaxed">Esperando aprobación de Administración...</p>
        <p className="text-[8px] text-slate-700 font-black uppercase mt-12 italic">Dispositivo: {localStorage.getItem("flotapp_device_id")?.slice(0,8)}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in duration-1000">
      
      {!isExternal ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Selecciona tu Nombre</label>
            <select
              value={selectedChofer}
              onChange={handleSelect}
              className="w-full bg-[#020617] border-2 border-blue-500/20 rounded-2xl px-6 py-5 text-white outline-none focus:border-blue-500 transition-all font-black uppercase tracking-widest text-sm appearance-none cursor-pointer text-center"
            >
              <option value="">-- ELIGE TU NOMBRE --</option>
              {choferes.map((c) => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {selectedChofer && (
            <button 
              onClick={() => isDeviceAuthorized ? handleLogin(selectedChofer) : handleRequestAuth(selectedChofer)}
              disabled={isRequesting}
              className="w-full py-5 bg-blue-600 rounded-2xl text-white font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-blue-500 active:scale-95 transition-all animate-in slide-in-from-bottom-4"
            >
              {isRequesting ? "PROCESANDO..." : (isDeviceAuthorized ? "INICIAR JORNADA" : "VINCULAR MI IDENTIDAD")}
            </button>
          )}

          <button 
            onClick={() => setIsExternal(true)}
            className="w-full text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-blue-400 transition-colors"
          >
            ¿No estás en la lista? Ingresar nuevo
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Nuevo Operador</label>
            <input 
              type="text"
              value={deviceOperatorName}
              onChange={(e) => setDeviceOperatorName(e.target.value.toUpperCase())}
              placeholder="NOMBRE Y APELLIDO"
              className="w-full bg-black/40 border border-slate-700 rounded-2xl p-5 text-center font-black text-white outline-none focus:border-blue-500 transition-all uppercase"
            />
          </div>

          <button 
            onClick={() => handleRequestAuth()}
            disabled={isRequesting || !deviceOperatorName}
            className="w-full py-5 bg-blue-600 rounded-2xl text-white font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50"
          >
            {isRequesting ? "PROCESANDO..." : "SOLICITAR ACCESO"}
          </button>

          <button 
            onClick={() => setIsExternal(false)}
            className="w-full text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-blue-400 transition-colors"
          >
            Volver a la lista
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-wider text-center">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-center flex-col items-center gap-2 pt-4">
         <div className="h-1 w-32 bg-blue-500/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-full animate-pulse" />
         </div>
         <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">TACTICA b4.0</span>
      </div>

    </div>
  );
}
