"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DriverAuthClient({ choferes }) {
  const [selectedChofer, setSelectedChofer] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [externalName, setExternalName] = useState("");
  const [remember, setRemember] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if already remembered
    const saved = localStorage.getItem("flotapp_driver_name");
    if (saved) {
      setSelectedChofer(saved);
    }
  }, []);

  const handleSelect = (e) => {
    const val = e.target.value;
    if (val === "EXTERNO") {
      setIsExternal(true);
      setSelectedChofer("");
    } else {
      setIsExternal(false);
      setSelectedChofer(val);
      if (remember && val) {
        localStorage.setItem("flotapp_driver_name", val);
        document.cookie = `driver_name=${val}; path=/; max-age=31536000`;
      }
      router.refresh(); // Refresh Server Component to fetch new patente
    }
  };

  const confirmExternal = () => {
    if (externalName.trim()) {
      const name = externalName.trim();
      setIsExternal(false);
      setSelectedChofer(name);
      if (remember) {
        localStorage.setItem("flotapp_driver_name", name);
        document.cookie = `driver_name=${name}; path=/; max-age=31536000`;
      }
      router.refresh(); // Refresh Server Component to fetch new patente
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("flotapp_driver_name");
    document.cookie = "driver_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setSelectedChofer("");
    setIsExternal(false);
    setExternalName("");
    router.refresh(); // Clear Server Component patente
  };

  if (selectedChofer) {
    return (
      <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Identificado como</p>
            <p className="text-white font-bold">{selectedChofer}</p>
          </div>
        </div>
        <button type="button" onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400 font-bold uppercase tracking-tight">Cambiar</button>
        <input type="hidden" name="nombreConductor" value={selectedChofer} />
      </div>
    );
  }

  if (isExternal) {
    return (
      <div className="mb-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
        <label htmlFor="externalName" className="block text-sm font-black text-indigo-400 uppercase tracking-wider mb-3">
          Nombre del Conductor Externo
        </label>
        <div className="flex gap-2">
          <input
            id="externalName"
            type="text"
            required
            autoFocus
            value={externalName}
            onChange={(e) => setExternalName(e.target.value)}
            className="flex-1 bg-gray-950/50 border border-indigo-500/30 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Nombre y Apellido"
          />
          <button
            type="button"
            onClick={confirmExternal}
            disabled={!externalName.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold transition-all"
          >
            OK
          </button>
        </div>
        <button type="button" onClick={() => setIsExternal(false)} className="text-[10px] text-gray-500 hover:text-white uppercase font-bold mt-4">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <label htmlFor="nombreConductorSelector" className="block text-sm font-medium text-gray-300 mb-3">
        Selecciona tu Nombre
      </label>
      <select
        id="nombreConductorSelector"
        required
        onChange={handleSelect}
        defaultValue=""
        className="block w-full px-5 py-4 bg-gray-900/50 border border-gray-700/50 rounded-2xl text-white text-lg transition-all focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
      >
        <option value="" disabled>-- Elige un conductor --</option>
        {choferes.map(c => (
          <option key={c.id} value={c.nombre}>{c.nombre}</option>
        ))}
        <option value="EXTERNO">⭐ Otro / Conductor Externo...</option>
      </select>
      <p className="mt-2 text-[10px] text-gray-500 uppercase font-bold text-center italic">Tu selección quedará guardada en este dispositivo</p>
    </div>
  );
}
