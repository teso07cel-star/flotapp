"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DriverAuthClient({ choferes }) {
  const [selectedChofer, setSelectedChofer] = useState("");
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
    const name = e.target.value;
    setSelectedChofer(name);
    if (remember && name) {
      localStorage.setItem("flotapp_driver_name", name);
      // Also set a session cookie if needed, but localstorage is fine for "cellphone login"
      document.cookie = `driver_name=${name}; path=/; max-age=31536000`;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("flotapp_driver_name");
    document.cookie = "driver_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setSelectedChofer("");
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
        <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400 font-bold uppercase tracking-tight">Cambiar</button>
        <input type="hidden" name="nombreConductor" value={selectedChofer} />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <label htmlFor="nombreConductor" className="block text-sm font-medium text-gray-300 mb-3">
        Selecciona tu Nombre
      </label>
      <select
        id="nombreConductor"
        name="nombreConductor"
        required
        onChange={handleSelect}
        className="block w-full px-5 py-4 bg-gray-900/50 border border-gray-700/50 rounded-2xl text-white text-lg transition-all focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
      >
        <option value="">-- Elige un conductor --</option>
        {choferes.map(c => (
          <option key={c.id} value={c.nombre}>{c.nombre}</option>
        ))}
      </select>
      <p className="mt-2 text-[10px] text-gray-500 uppercase font-bold text-center italic">Tu selección quedará guardada en este dispositivo</p>
    </div>
  );
}
