"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DriverAuthClient({ choferes }) {
  const [selectedChofer, setSelectedChofer] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [externalName, setExternalName] = useState("");
  const [remember, setRemember] = useState(true);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const router = useRouter();

  const [fastLoginDriver, setFastLoginDriver] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("flotapp_driver_name");
    if (saved) {
      setFastLoginDriver(saved);
    }
  }, []);

  const handleFingerprintPress = () => {
    if (fastLoginDriver) {
      setSelectedChofer(fastLoginDriver);
      document.cookie = `driver_name=${encodeURIComponent(fastLoginDriver)}; path=/; max-age=31536000`;
      router.refresh(); 
    }
  };

  const handleSelect = (e) => {
    const val = e.target.value;
    if (val === "NUEVO") {
      setIsExternal(true);
      setSelectedChofer("");
    } else {
      setIsExternal(false);
      setSelectedChofer(val);
      if (remember && val) {
        localStorage.setItem("flotapp_driver_name", val);
        document.cookie = `driver_name=${encodeURIComponent(val)}; path=/; max-age=31536000`;
      }
      router.refresh();
    }
  };

  const confirmNewDriver = () => {
    if (externalName.trim()) {
      const name = externalName.trim();
      setIsExternal(false);
      setSelectedChofer(name);
      if (remember) {
        localStorage.setItem("flotapp_driver_name", name);
        document.cookie = `driver_name=${encodeURIComponent(name)}; path=/; max-age=31536000`;
      }
      router.refresh();
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
