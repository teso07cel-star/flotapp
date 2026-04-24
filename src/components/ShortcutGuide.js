"use client";
import { useState, useEffect } from "react";

export default function ShortcutGuide() {
  const [isStandalone, setIsStandalone] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Detectar si la app ya está instalada o en modo standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(standalone);
  }, []);

  if (isStandalone) return null;

  return (
    <div className="w-full bg-[#0f172a]/80 backdrop-blur-md border-b border-blue-500/20 py-3 px-4 animate-in slide-in-from-top duration-700 sticky top-0 z-[60]">
       <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
             </div>
             <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-400 leading-none mb-1">Acceso Directo Táctico</h4>
                <p className="text-[10px] text-slate-300 font-bold leading-tight">
                   Crea un **Acceso Directo** en tu inicio (No es una App instalada).
                </p>
             </div>
          </div>
          
          <button 
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex-shrink-0 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-white/5 transition-all"
          >
             <span className="text-[9px] font-black text-white uppercase tracking-widest">
                {showInstructions ? "Cerrar" : "¿Cómo?"}
             </span>
          </button>
       </div>

       {showInstructions && (
         <div className="max-w-xl mx-auto mt-3 pt-3 border-t border-blue-500/10 grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-300">
            <div className="bg-black/20 p-2 rounded-xl">
               <p className="text-[8px] text-blue-500 font-black uppercase mb-1">iPhone (Safari):</p>
               <p className="text-[9px] text-slate-400 font-medium">Compartir [↑] → "Agregar a Inicio"</p>
            </div>
            <div className="bg-black/20 p-2 rounded-xl">
               <p className="text-[8px] text-emerald-500 font-black uppercase mb-1">Android (Chrome):</p>
               <p className="text-[9px] text-slate-400 font-medium">Menú (⋮) → "Agregar a la pantalla de inicio"</p>
            </div>
         </div>
       )}
    </div>
  );
}
