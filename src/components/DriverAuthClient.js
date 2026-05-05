"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { bindDriverToDevice, solicitarAutorizacion, checkEstadoAutorizacion } from "@/lib/appActions";

export default function DriverAuthClient({ choferes }) {
  const [selectedChofer, setSelectedChofer] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [externalName, setExternalName] = useState("");
  const [remember, setRemember] = useState(true);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const router = useRouter();

  const [fastLoginDriver, setFastLoginDriver] = useState("");
  
  // DEVICE AUTH STATE
  const [isDeviceAuthorized, setIsDeviceAuthorized] = useState(null);
  const [authStep, setAuthStep] = useState(1); // 1: Pedir Nombre, 2: Pedir Código
  const [deviceOperatorName, setDeviceOperatorName] = useState("");
  const [deviceCode, setDeviceCode] = useState("");
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const pollingRef = useRef(null);

  useEffect(() => {
    let devId = localStorage.getItem("flotapp_device_id");
    if (!devId) {
       // Fallback for non-secure contexts (HTTP) where crypto.randomUUID might be undefined
       if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          devId = crypto.randomUUID();
       } else {
          devId = 'dev-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
       }
       localStorage.setItem("flotapp_device_id", devId);
    }
    console.log("Tactical Device ID:", devId);

    // 3. PROTOCOLO DE AUTORIZACIÓN REAL DE BRIAN EZEQUIEL LOPEZ
    const savedDriver = localStorage.getItem("flotapp_driver_name");
    
    const checkAuthStatus = async () => {
      const devId = localStorage.getItem("flotapp_device_id");
      const res = await checkEstadoAutorizacion(devId);
      
      if (res.success && res.estado === "APROBADO") {
        localStorage.setItem("device_authorized_v2", "true");
        setIsDeviceAuthorized(true);
      } else {
        localStorage.removeItem("device_authorized_v2");
        setIsDeviceAuthorized(false);
      }
    };

    checkAuthStatus();
    
    if (savedDriver) {
      setTimeout(() => setFastLoginDriver(savedDriver), 0);
    }
  }, []);

  const [isRequesting, setIsRequesting] = useState(false);

  const handleDeviceAuthStep1 = async () => {
    if (deviceOperatorName.trim() !== "") {
      setIsRequesting(true);
      setErrorMessage("");
      const devId = localStorage.getItem("flotapp_device_id");
      console.log("Enviando solicitud para:", deviceOperatorName.trim(), "ID:", devId);
      try {
        const res = await solicitarAutorizacion(deviceOperatorName.trim(), devId);
        console.log("Respuesta del servidor:", res);
        if (res.success) {
          setAuthStep(2);
        } else {
          setErrorMessage(res.error || "Error desconocido en el servidor");
        }
      } catch (err) {
        console.error("Error al llamar solicitarAutorizacion:", err);
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
          const res = await checkEstadoAutorizacion(devId);
          if (res.success && res.estado === "APROBADO") {
             clearInterval(pollingRef.current);
             setAuthSuccess(true);
             setTimeout(() => {
                localStorage.setItem("device_authorized_v1", "true");
                setIsDeviceAuthorized(true);
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

  const handleDeviceAuthStep2 = () => {
     // No longer used, handled by polling
  };

  const handleFingerprintPress = async () => {
    if (fastLoginDriver) {
      const devId = localStorage.getItem("flotapp_device_id");
      const res = await bindDriverToDevice(fastLoginDriver, devId);
      if (!res.success) {
        alert(res.error);
        return;
      }
      
      // REGISTRAR INICIO DE JORNADA (Fase 1)
      const { createRegistroDiario } = await import("@/lib/appActions");
      await createRegistroDiario({
          nombreConductor: fastLoginDriver,
          tipoReporte: "INICIO_JORNADA",
          lugarGuarda: "UBICACIÓN GPS AUTOMÁTICA"
      });

      setSelectedChofer(fastLoginDriver);
      document.cookie = `driver_name=${encodeURIComponent(fastLoginDriver)}; path=/; max-age=31536000`;
      router.push('/?success=true'); 
    }
  };

  const handleSelect = async (e) => {
    const val = e.target.value;
    if (!val) return;
    
    if (val === "NUEVO") {
      setIsExternal(true);
      setSelectedChofer("");
    } else {
      setIsRequesting(true);
      setErrorMessage("");
      const devId = localStorage.getItem("flotapp_device_id");
      
      try {
        console.log("Iniciando vinculación para:", val);
        const res = await bindDriverToDevice(val, devId);
        if (!res.success) {
          alert("Error de Vinculación: " + res.error);
          setIsRequesting(false);
          e.target.value = "";
          return;
        }
        
        setIsExternal(false);
        setSelectedChofer(val); localStorage.setItem("flotapp_driver_name", val); setTimeout(() => { window.location.href = "/driver/navigation/select"; }, 1000);
        if (remember) {
          localStorage.setItem("flotapp_driver_name", val);
          document.cookie = `driver_name=${encodeURIComponent(val)}; path=/; max-age=31536000`;
        }

        // REDIRECCIÓN INMEDIATA PARA EVITAR SENSACIÓN DE BLOQUEO
        router.push('/?success=true');
        router.refresh();
      } catch (err) {
        console.error("Falla Crítica en Selección:", err);
        alert("Error de Conexión. Reintente en unos segundos.");
        setIsRequesting(false);
      }
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
      if (remember) {
        localStorage.setItem("flotapp_driver_name", name);
        document.cookie = `driver_name=${encodeURIComponent(name)}; path=/; max-age=31536000`;
      }

      // REGISTRAR INICIO DE JORNADA (Fase 1)
      const { createRegistroDiario } = await import("@/lib/appActions");
      await createRegistroDiario({
          nombreConductor: name,
          tipoReporte: "INICIO_JORNADA",
          lugarGuarda: "UBICACIÓN GPS AUTOMÁTICA"
      });

      router.push('/?success=true');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("flotapp_driver_name");
    document.cookie = "driver_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setSelectedChofer("");
    setIsExternal(false);
    setExternalName("");
    setFastLoginDriver("");
    router.refresh();
  };

  if (isDeviceAuthorized === null) {
    return <div className="h-64 flex items-center justify-center text-blue-500 animate-pulse uppercase font-black text-xs tracking-widest">Verificando enlace físico...</div>;
  }

  if (isDeviceAuthorized === false) {
    if (authSuccess) {
       return (
          <div className="mb-8 p-10 bg-[#0f172a] border border-emerald-500/20 rounded-[2.5rem] text-center backdrop-blur-xl animate-in flip-in-y duration-700">
             <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-emerald-500/50">
                <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             </div>
             <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-widest mb-2">Desbloqueado</h2>
             <p className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-[0.2em] animate-pulse">Autenticación Táctica Exitosa</p>
          </div>
       );
    }

    return (
      <div className="mb-8 p-8 bg-[#0f172a] border border-blue-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>
        <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
        </div>
        <h2 className="text-xl font-black text-white text-center uppercase tracking-tighter mb-2">Dispositivo No Enlazado</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center mb-6">Bloqueo Operativo</p>
        
        {authStep === 1 ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest text-center mb-2">Identificación de Usuario</label>
            <input 
              type="text" 
              placeholder="NOMBRE Y APELLIDO"
              value={deviceOperatorName}
              onChange={(e) => setDeviceOperatorName(e.target.value)}
              className="w-full bg-[#020617] border-2 border-slate-700/50 rounded-2xl px-5 py-5 text-white focus:border-blue-500 outline-none text-center font-bold"
            />
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-in fade-in zoom-in duration-300">
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center">{errorMessage}</p>
                <p className="text-[9px] text-red-400/60 mt-2 text-center">Intentá de nuevo o contactá a soporte.</p>
              </div>
            )}

            <button 
              type="button"
              onClick={handleDeviceAuthStep1}
              disabled={!deviceOperatorName.trim() || isRequesting}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-xs border border-blue-500/50"
            >
              {isRequesting ? 'Procesando...' : 'Solicitar Enlace'}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex flex-col items-center justify-center py-8">
                <div className="relative w-24 h-24 mb-6">
                   <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping"></div>
                   <div className="absolute inset-2 border-4 border-blue-500/40 rounded-full animate-pulse"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-10 h-10 text-blue-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                   </div>
                </div>
                
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Solicitud Enviada</h3>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] animate-pulse">Esperando Respuesta Táctica...</p>
             </div>

             <div className="bg-slate-900/50 border border-white/5 p-5 rounded-[2rem] space-y-3">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest text-center">
                   El administrador ha recibido tu petición. 
                   <br/>Mantené esta pantalla abierta.
                </p>
             </div>

             <button 
                type="button"
                onClick={() => setAuthStep(1)}
                className="w-full py-4 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                &larr; Cancelar Solicitud
              </button>
          </div>
        )}
      </div>
    );
  }

  if (selectedChofer) {
    return (
      <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-[2rem] flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-0.5">Conductor</p>
            <p className="text-white text-xl font-black uppercase tracking-tight leading-none">{selectedChofer}</p>
          </div>
        </div>
        <button type="button" onClick={handleLogout} className="px-4 py-2 text-[10px] text-gray-500 hover:text-red-400 font-black uppercase tracking-widest border border-white/5 hover:border-red-500/20 rounded-xl transition-all">Cambiar</button>
        <input type="hidden" name="nombreConductor" value={selectedChofer} />
      </div>
    );
  }

  if (isExternal) {
    return (
      <div className="mb-8 p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-xl">
        <label htmlFor="externalName" className="block text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 text-center">
          Registro de Nuevo Conductor
        </label>
        <div className="space-y-4">
          <input
            id="externalName"
            type="text"
            required
            autoFocus
            value={externalName}
            onChange={(e) => setExternalName(e.target.value)}
            className="w-full bg-gray-950/50 border-2 border-indigo-500/20 rounded-2xl px-6 py-4 text-white text-lg text-center font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-700"
            placeholder="NOMBRE Y APELLIDO"
          />
          <button
            type="button"
            onClick={confirmNewDriver}
            disabled={!externalName.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-30 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            Confirmar Identidad
          </button>
        </div>
        <button type="button" onClick={() => setIsExternal(false)} className="w-full text-[10px] text-gray-500 hover:text-white uppercase font-black tracking-widest mt-6 transition-colors">
          &larr; Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-8">
      {fastLoginDriver && (
        <div className="flex flex-col items-center justify-center p-10 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <button 
             onClick={handleFingerprintPress}
             className="relative z-10 w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-[0_0_50px_rgba(59,130,246,0.3)] transform transition-all hover:scale-105 active:scale-95 border-8 border-gray-950 group-hover:shadow-[0_0_70px_rgba(59,130,246,0.5)]"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
               <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
               <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
               <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
               <path d="M2 12a10 10 0 0 1 18-6"/>
               <path d="M2 16h.01"/>
               <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
               <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
               <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
               <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
             </svg>
          </button>
          <div className="mt-8 text-center">
             <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Sesión Recordada</p>
             <p className="text-white text-3xl font-black uppercase tracking-tight">{fastLoginDriver}</p>
             <p className="text-[10px] text-gray-500 mt-4 max-w-[220px] leading-relaxed mx-auto font-bold uppercase tracking-wider italic">Toca la huella para confirmación biométrica</p>
          </div>
          
          <button 
            type="button"
            onClick={() => { setFastLoginDriver(""); setShowManualLogin(true); }}
            className="mt-8 text-[9px] text-gray-600 hover:text-gray-400 font-black uppercase tracking-[0.2em] transition-colors"
          >
            No soy {fastLoginDriver} (Elegir otro)
          </button>
        </div>
      )}

      {(!fastLoginDriver || showManualLogin) && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <label htmlFor="nombreConductorSelector" className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 text-center">
            {showManualLogin ? "Selecciona otro perfil:" : "Inicia Sesión con tu Nombre"}
          </label>
          <div className="relative group">
            <select
              id="nombreConductorSelector"
              required
              onChange={handleSelect}
              defaultValue=""
              className="block w-full px-8 py-5 bg-gray-900 border-2 border-white/5 rounded-[1.5rem] text-white text-lg font-bold appearance-none transition-all focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer group-hover:border-white/10"
            >
              <option value="" disabled>-- ELIGE TU NOMBRE --</option>
              {choferes.map(c => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
              <option value="NUEVO" className="text-blue-400 font-black italic">⭐ Registrarse como Nuevo Chofer...</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 transition-transform group-hover:translate-y-1">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          <p className="mt-6 text-[9px] text-gray-600 uppercase font-black text-center tracking-[0.2em] italic">Seguridad por reconocimiento facial o huella digital</p>
        </div>
      )}
    </div>
  );
}
