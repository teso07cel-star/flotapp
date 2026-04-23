"use client";
import { useState } from "react";
import { generarCodigoAutorizacion } from "@/lib/appActions";

export default function MileageAuth({ vehiculoId, initialCode }) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const res = await generarCodigoAutorizacion(vehiculoId);
    if (res.success) {
      setCode(res.code);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5">
      <h2 className="text-xl font-black mb-6 uppercase tracking-tighter border-b border-gray-100 dark:border-gray-800 pb-4 flex items-center justify-between">
        Autorización de KM
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      </h2>
      <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
        Genera un código de un solo uso si el chofer necesita registrar un kilometraje igual o menor al anterior.
      </p>

      {code ? (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6 text-center mb-6 animate-in zoom-in duration-300">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 mb-2">Código Activo</div>
          <div className="text-4xl font-mono font-black tracking-[0.3em] text-gray-900 dark:text-white">{code}</div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center mb-6">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Sin código activo</span>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
      >
        {loading ? "Generando..." : code ? "Regenerar Código" : "Generar Código"}
      </button>
    </div>
  );
}
