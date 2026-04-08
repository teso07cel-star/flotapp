"use client";
import { useState, useEffect } from "react";
import { StrategicGearIcon } from "./FuturisticIcons";
import { bindDriverToDevice } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function DriverAuthClient({ choferes, isDeviceAuthorized, initialDriverName }) {
  const router = useRouter();
  const [selectedChofer, setSelectedChofer] = useState(initialDriverName || "");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [authStep, setAuthStep] = useState(isDeviceAuthorized ? 0 : 1);
  const [deviceOperatorName, setDeviceOperatorName] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [externalName, setExternalName] = useState("");
  const [remember, setRemember] = useState(true);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [fastLoginDriver, setFastLoginDriver] = useState(initialDriverName || "");
  const pollingRef = useRef(null);

  const handleDeviceAuthStep1 = async () => {
    if (deviceOperatorName.trim() !== "") {
      setIsRequesting(true);
      setErrorMessage("");
      const devId = localStorage.getItem("flotapp_device_id");
      try {
        const { solicitarAutorizacion } = await import("@/lib/actions");
        const res = await solicitarAutorizacion(deviceOperatorName.trim(), devId);
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
    if (authStep === 2 && !isDeviceAuthorized) {
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
  }, [authStep, isDeviceAuthorized]);

  const handleFingerprintPress = async () => {
    if (fastLoginDriver) {
      const devId = localStorage.getItem("flotapp_device_id");
      const res = await bindDriverToDevice(fastLoginDriver, devId);
      if (!res.success) {
        alert(res.error);
        return;
      }
      
      const { createRegistroDiario } = await import("@/lib/actions");
      await createRegistroDiario({
          nombreConductor: fastLoginDriver,
          tipoReporte: "INICIO_JORNADA",
          lugarGuarda: idGps || "UBICACIÓN GPS AUTOMÁTICA"
      });

      document.cookie = `driver_name=${encodeURIComponent(fastLoginDriver)}; path=/; max-age=31536000`;
      router.push('/'); 
    }
  };

  const handleSelect = async (e) => {
    const val = e.target.value;
    if (!val) return;
    
    setLoading(true);
    setSelectedChofer(val);

    try {
      const devId = localStorage.getItem("flotapp_device_id");
      await bindDriverToDevice(val, devId);
      
      const { createRegistroDiario } = await import("@/lib/actions");
      await createRegistroDiario({
          nombreConductor: val,
          tipoReporte: "INICIO_JORNADA",
          lugarGuarda: idGps || "GPS TEMPORAL"
      });

      document.cookie = `driver_name=${encodeURIComponent(val)}; path=/; max-age=31536000`;
      router.push('/');
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const confirmNewDriver = async () => {
    if (externalName.trim()) {
      const name = externalName.trim();
      const devId = localStorage.getItem("flotapp_device_id");
      const res = await bindDriverToDevice(name, devId);
      if (!res.success) {
        alert(res.error);
        return;
      }

      setIsExternal(false);
      setSelectedChofer(name);
      localStorage.setItem("flotapp_driver_name", name);
      document.cookie = `driver_name=${encodeURIComponent(name)}; path=/; max-age=31536000`;

      const { createRegistroDiario } = await import("@/lib/actions");
      await createRegistroDiario({
          nombreConductor: name,
          tipoReporte: "INICIO_JORNADA",
          lugarGuarda: idGps || "UBICACIÓN GPS AUTOMÁTICA"
      });

      router.push('/');
    }
  };

  if (!isDeviceAuthorized) {
    if (authStep === 1) {
      return (
        <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in duration-1000">
          <div className="text-center">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Acceso <span className="text-blue-500">Operativo</span></h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Vinculación de Dispositivo</p>
          </div>
          <div className="glass-panel p-8 rounded-[3rem] border border-white/5 space-y-6">
            <p className="text-xs text-slate-400 text-center leading-relaxed font-medium">Este dispositivo no ha sido autorizado para operar la flota. Por favor, solicita acceso a Administración.</p>
            <input 
              type="text"
              value={deviceOperatorName}
              onChange={(e) => setDeviceOperatorName(e.target.value.toUpperCase())}
              placeholder="TU NOMBRE Y APELLIDO"
              className="w-full bg-black/40 border border-slate-700 rounded-xl p-4 text-center font-black text-white outline-none focus:border-blue-500 transition-all"
            />
            {errorMessage && <p className="text-red-500 text-[10px] text-center font-black uppercase tracking-widest">{errorMessage}</p>}
            <button 
              onClick={handleDeviceAuthStep1}
              disabled={isRequesting}
              className="w-full py-5 bg-blue-600 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-blue-500 active:scale-95 transition-all"
            >
              {isRequesting ? "PROCESANDO..." : "SOLICITAR ENLACE"}
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full max-w-sm mx-auto space-y-8 animate-in zoom-in-95 duration-700 text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-2xl relative">
          <StrategicGearIcon className="text-blue-500 animate-spin-slow w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Solicitud Enviada</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] leading-relaxed">Esperando aprobación de Administración...</p>
        <p className="text-[8px] text-slate-700 font-black uppercase mt-12 italic">ID: {localStorage.getItem("flotapp_device_id")?.slice(0,8)}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in duration-1000">
      
      <div className="text-center">
         <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Centro <span className="text-blue-500">Táctico</span></h1>
         <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Identificación de Operador Estratégico</p>
      </div>

      <div className="glass-panel p-8 rounded-[3rem] border border-white/5 relative overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
             <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest">Sincronizando Identidad...</p>
          </div>
        ) : (
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
            <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest mt-4">Redirección automática al seleccionar</p>
          </div>
        )}
      </div>

      <div className="flex justify-center flex-col items-center gap-2">
         <div className="h-1 w-32 bg-blue-500/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-full animate-pulse" />
         </div>
         <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">TACTICA b4.0</span>
      </div>

    </div>
  );
}
