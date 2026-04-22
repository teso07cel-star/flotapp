"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("🔴 NEXTJS_ERROR_DIGEST:", error.digest);
    console.error("🔴 NEXTJS_ERROR_MESSAGE:", error.message);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-red-500/20 blur-xl rounded-full" />
          <div className="w-24 h-24 bg-red-500/10 border border-red-500/30 rounded-[2rem] flex items-center justify-center mx-auto relative">
             <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Falla de <span className="text-red-500">Sistema</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            Se ha detectado una anomalía crítica en el servidor. El protocolo de blindaje ha capturado el error para proteger los datos.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl text-left font-mono">
           <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Error Diagnostic</p>
           <p className="text-red-400 text-xs break-all">{error.message || "Excepción de Redimensionamiento de Memoria / DB"}</p>
           {error.digest && <p className="text-slate-600 text-[9px] mt-2">DIGEST: {error.digest}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={() => reset()}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            Reiniciar Interfaz
          </button>
          <a
            href="/"
            className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all"
          >
            Base de Operaciones
          </a>
        </div>
        
        <p className="text-slate-700 text-[8px] font-black uppercase tracking-[0.5em]">FlotApp Tactical Recovery Unit</p>
      </div>
    </div>
  );
}
