"use client";
import { useState, useEffect } from "react";

export default function InstallOverlay() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState(""); // ios, android, other

  useEffect(() => {
    // 1. Detectar Plataforma
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    }

    // 2. Verificar si ya está instalada (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    // 3. Capturar evento de instalación (Android/Chrome)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Para iOS, mostrar siempre si no es standalone
    if (platform === "ios" && !isStandalone) {
       // Pequeño delay para no molestar al cargar
       const timer = setTimeout(() => setIsVisible(true), 3000);
       return () => clearTimeout(timer);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [platform]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:p-8 animate-in slide-in-from-bottom-full duration-700">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsVisible(false)} />
      
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-3xl p-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500" />
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/20">
             <img src="/icons/pickup_final.png" className="w-14 h-14 object-contain" alt="FlotApp" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Instalar FlotApp</h2>
            <p className="text-slate-400 text-sm font-medium">Crea un acceso directo en tu escritorio para ingresar más rápido.</p>
          </div>

          {platform === "android" ? (
            <button 
              onClick={handleInstallClick}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
              Instalar Ahora
            </button>
          ) : platform === "ios" ? (
            <div className="w-full space-y-6">
               <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 text-left space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white">1</div>
                     <p className="text-xs text-slate-300">Toca el botón <strong>'Compartir'</strong> (cuadrado con flecha) abajo.</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white">2</div>
                     <p className="text-xs text-slate-300">Busca la opción <strong>'Añadir a pantalla de inicio'</strong>.</p>
                  </div>
               </div>
               <button 
                 onClick={() => setIsVisible(false)}
                 className="w-full py-4 text-xs font-black uppercase text-blue-400 hover:text-white transition-colors"
               >
                 Entendido
               </button>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Abre este sitio en tu móvil para instalar</p>
          )}
        </div>
      </div>
    </div>
  );
}
