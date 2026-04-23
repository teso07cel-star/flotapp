"use client";

import { useState } from "react";

export default function PatenteSelector({ defaultPatente }) {
  const [showInput, setShowInput] = useState(!defaultPatente);
  const [loading, setLoading] = useState(false);

  const forceRedirect = (e) => {
    // Si el clic es en un botón de submit, forzamos la redirección por JS para evitar bloqueos
    const form = e.currentTarget.closest("form");
    if (!form) return;
    
    setLoading(true);
    const fd = new FormData(form);
    const p = fd.get("patente")?.toString().replace(/\s+/g, "").toUpperCase().trim();
    
    if (p) {
      window.location.href = `/driver/form?patente=${encodeURIComponent(p)}`;
    }
  };

  if (showInput) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="mb-8">
           <label htmlFor="patente" className="block text-[11px] font-black text-blue-400 mb-4 text-center uppercase tracking-[0.2em] font-sans">
             Ingresa la patente del vehículo
           </label>
           <div className="relative group">
             <input
               id="patente"
               name="patente"
               type="text"
               placeholder="EJ. AB123CD"
               required
               className="block w-full px-5 py-6 bg-gray-900 border-2 border-blue-500/20 rounded-[1.5rem] text-white text-3xl text-center tracking-[0.3em] uppercase transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-gray-700 font-black"
               autoComplete="off"
               autoFocus
             />
           </div>
           
           {defaultPatente && (
             <button 
               type="button" 
               onClick={() => setShowInput(false)}
               className="w-full mt-4 text-[10px] text-gray-500 hover:text-blue-400 font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
             >
               Volver a mi patente asignada
             </button>
           )}
         </div>

         <button
            type="button"
            onClick={forceRedirect}
            disabled={loading}
            className="w-full relative overflow-hidden inline-flex items-center justify-center px-8 py-6 text-[12px] font-black tracking-[0.3em] uppercase text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] hover:from-blue-500 hover:to-indigo-500 transform active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.2)] group"
          >
            <span className="flex items-center gap-3 relative z-10">
              {loading ? "PROCESANDO..." : "Continuar Turno"}
              {!loading && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
            </span>
          </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center justify-center p-8 bg-blue-600/10 border border-blue-500/30 rounded-[2.5rem] mb-8 relative overflow-hidden group">
         <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-center">Unidad Asignada</p>
         <h3 className="text-white text-4xl font-black uppercase tracking-[0.2em] mb-1 text-center font-mono">
           {defaultPatente}
         </h3>
         <input type="hidden" name="patente" value={defaultPatente} />
      </div>

      <div className="grid grid-cols-2 gap-4">
         <button
            type="button"
            onClick={() => setShowInput(true)}
            className="flex flex-col items-center justify-center gap-2 py-6 px-4 bg-gray-900 border-2 border-white/5 rounded-[2rem] text-gray-400 hover:text-white"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-center">No voy a usarla<br/>Cambiar</span>
          </button>
          <button
            type="button"
            onClick={forceRedirect}
            disabled={loading}
            className="flex flex-col items-center justify-center gap-2 py-6 px-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] text-white transition-all shadow-xl shadow-blue-500/20"
          >
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-center">{loading ? "CARGANDO..." : "Sí, Confirmar"}</span>
          </button>
      </div>
    </div>
  );
}
