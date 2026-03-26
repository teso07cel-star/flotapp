"use client";
import { useState, useTransition } from "react";
import { toggleChoferActivo } from "@/lib/actions";

export default function DriverList({ initialDrivers }) {
  const [drivers, setDrivers] = useState(initialDrivers || []);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id, currentStatus) => {
    startTransition(async () => {
      const newStatus = !currentStatus;
      // Optimistic update
      setDrivers(prev => prev.map(d => d.id === id ? { ...d, activo: newStatus } : d));
      
      const res = await toggleChoferActivo(id, newStatus);
      if (!res.success) {
        // Rollback
        setDrivers(prev => prev.map(d => d.id === id ? { ...d, activo: currentStatus } : d));
        alert("Error al actualizar estado: " + res.error);
      }
    });
  };

  if (drivers.length === 0) {
    return (
      <div className="bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-10 text-center shadow-lg font-mono">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-gray-400 text-3xl">👤</span>
        </div>
        <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">Sin Choferes</h3>
        <p className="text-sm text-gray-500 mt-2">Agrega el primer chófer en el panel lateral.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {drivers.map(d => (
        <div 
          key={d.id} 
          className={`bg-white dark:bg-gray-900 border ${d.activo ? 'border-gray-200 dark:border-gray-800' : 'border-red-200 dark:border-red-900/50 opacity-60 grayscale'} rounded-3xl p-6 shadow-xl shadow-black/5 hover:shadow-2xl transition-all group flex items-center justify-between`}
        >
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white flex items-center gap-2">
              {d.nombre}
              {!d.activo && <span className="bg-red-100 text-red-600 text-[9px] px-2 py-0.5 rounded-full tracking-widest">INACTIVO</span>}
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              ID: COD-{d.id.toString().padStart(4, '0')}
            </p>
            {d.passkeyId ? (
              <span className="inline-block mt-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
                ✅ Face ID Vinculado
              </span>
            ) : (
              <span className="inline-block mt-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 outline-dashed outline-amber-200 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                ⚠️ Sin Face ID
              </span>
            )}
          </div>
          
          <button
            onClick={() => handleToggle(d.id, d.activo)}
            disabled={isPending}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm
              ${d.activo 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105' 
                : 'bg-green-50 text-green-600 hover:bg-green-100 hover:scale-105'}
            `}
            title={d.activo ? "Desactivar Chofer" : "Activar Chofer"}
          >
            {d.activo ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
