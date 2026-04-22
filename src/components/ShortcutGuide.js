"use client";
import { useState, useEffect } from "react";

export default function ShortcutGuide() {
  const [isStandalone, setIsStandalone] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Detectar si la app está corriendo en modo standalone (PWA instalada)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(standalone);
  }, []);

  if (isStandalone) return null;

  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="bg-blue-600/10 border border-blue-500/30 rounded-3xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </div>
        
        <div className="flex items-start gap-4">
           <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-600/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
           </div>
           <div className="flex-1 space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Instalación Recomendada</h4>
              <p className="text-[11px] text-slate-300 font-bold leading-relaxed">
                Para la mejor experiencia táctica, añade **FlotApp** a tu pantalla de inicio.
              </p>
              <button 
                onClick={() => setShowGuide(!showGuide)}
                className="text-[9px] font-black text-white underline underline-offset-4 decoration-blue-500 hover:text-blue-400 mt-2 block"
              >
                {showGuide ? "Ocultar Instrucciones" : "¿Cómo instalar?"}
              </button>
           </div>
        </div>

        {showGuide && (
          <div className="mt-6 pt-6 border-t border-blue-500/20 grid grid-cols-2 gap-4 text-[9px] font-bold uppercase tracking-wider animate-in zoom-in-95 duration-500">
             <div className="space-y-3">
                <p className="text-blue-500 italic">En iPhone (Safari):</p>
                <p className="text-slate-400 leading-tight">Pulsa el botón de compartir [ ] y selecciona "Agregar a inicio".</p>
             </div>
             <div className="space-y-3">
                <p className="text-emerald-500 italic">En Android (Chrome):</p>
                <p className="text-slate-400 leading-tight">Pulsa los 3 puntos y selecciona "Instalar aplicación".</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
