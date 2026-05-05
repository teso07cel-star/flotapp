"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { StrategicGearIcon } from "@/components/FuturisticIcons";

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get("success");

  const [isLogged, setIsLogged] = useState(false);
  const [driverName, setDriverName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const rawCookie = document.cookie;
    const isL = rawCookie.includes("driver_name=");
    if (!isL) {
      router.replace("/driver/entry");
      return;
    }
    
    // Extrayendo el valor de la cookie
    const nameMatch = rawCookie.match(/driver_name=([^;]+)/);
    const dName = nameMatch ? decodeURIComponent(nameMatch[1]).toUpperCase() : "";
    setDriverName(dName);
    setIsLogged(true);
    setIsLoading(false);
  }, [router]);

  // Pantalla de carga super táctica para que no haya un flash del menú antes del redirect
  if (isLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6 selection:bg-blue-500/30">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div><div style={{position:"fixed", bottom:10, right:10, fontSize:8, opacity:0.3, color:"white", zIndex:9999}}>BUILD_v9.1.6_ELITE</div>
         </div>
      );
  }

  // Permisos para Administración
  const isAdminSession = driverName.includes("VIDEOTES") || driverName.includes("BRIAN") || driverName.includes("SISTEMA");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-6 selection:bg-blue-500/30 relative overflow-hidden font-sans">
      {success && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-10 duration-700">
          <div className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(16,185,129,0.4)] flex flex-col items-center gap-2 border border-emerald-400">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
               </div>
               <span className="text-xl">INICIO DE JORNADA EXITOSO</span>
            </div>
            <span className="text-[10px] opacity-80 tracking-widest mt-1">Conductor: {driverName}</span>
          </div>
        </div>
      )}
      
      {/* Background HUD Elements - Stealth Matte */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[#0f172a]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center space-x-4 mb-10">
             <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-blue-500/50" />
             <h1 className="text-6xl font-black tracking-[-0.05em] text-white flex items-center gap-4">
                 FLOT<span className="text-blue-500">APP</span>
              </h1>
              <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-blue-500/50" />
           </div>
           <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.6em] opacity-60">Sistema de Control Operativo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
          
          {/* CONDUCTOR ESTRATÉGICO */}
          <Link 
            href="/driver/form"
            className="group flex flex-col relative rounded-[2rem] border border-blue-500/30 bg-[#0f172a]/60 backdrop-blur-xl overflow-hidden hover:border-blue-400/80 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500"
          >
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />
            
            <div className="p-8 pb-0 text-center relative z-10 mt-2">
               <h3 className="text-[22px] leading-tight font-black text-white tracking-widest uppercase mb-1 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  Conductor<br />Estratégico
               </h3>
            </div>
            
            <div className="relative flex-1 flex flex-col items-center justify-center p-6 min-h-[260px]">
               {/* Professional Tactical Vertical Alignment */}
               <div className="flex flex-col items-center justify-center w-full relative z-10 gap-4 pt-2">
                  <div className="w-full flex flex-col items-center justify-center transition-all duration-700 group-hover:-translate-y-2 relative z-10">
                     <div className="absolute bottom-14 w-[70%] max-w-[110px] h-[5px] bg-black/85 blur-[2px] rounded-[100%] z-0"></div>
                     <img src="/icons/etios_tactic_v2.png" className="w-full max-w-[160px] object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] z-10 relative" alt="Etios" />
                  </div>
                  <div className="w-full flex flex-col items-center justify-center transition-all duration-700 group-hover:-translate-y-2 relative z-20">
                     <div className="absolute bottom-6 w-[85%] max-w-[170px] h-[6px] bg-black/85 blur-[3px] rounded-[100%] z-0"></div>
                     <img src="/icons/pickup_tactic.png" className="w-full max-w-[210px] object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] z-10 relative" alt="Hilux" />
                  </div>
                  <div className="w-full flex flex-col items-center justify-center transition-all duration-700 group-hover:-translate-y-2 relative z-30">
                     <div className="absolute bottom-6 w-[95%] max-w-[155px] h-[4px] bg-black/80 blur-[2px] rounded-[100%] z-0"></div>
                     {/* Moto: boosted saturation to pop gray and orange colors */}
                     <img src="/icons/moto_tactic.png" className="w-full max-w-[150px] object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] z-10 relative saturate-[2.5] contrast-[1.25] brightness-110" alt="Moto XR 300" />
                  </div>
               </div>
            </div>
            
            <div className="p-8 pt-0 text-center space-y-6 relative z-10">
               <p className="text-slate-400 text-[11px] uppercase tracking-widest">Optimización de unidades</p>
               <div className="inline-block px-10 py-3 rounded-full border border-blue-500/50 text-blue-400 text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-500 group-hover:text-white transition-all shadow-lg">Ver Más</div>
            </div>
          </Link>

          {/* MOVILIDAD INTELIGENTE */}
          <Link 
            href="/external"
            className="group flex flex-col relative rounded-[2rem] border border-blue-400/30 bg-[#0f172a]/60 backdrop-blur-xl overflow-hidden hover:border-blue-300/80 hover:shadow-[0_0_30px_rgba(147,197,253,0.3)] transition-all duration-500"
          >
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-400/20 to-transparent pointer-events-none" />
            
            <div className="p-8 pb-0 text-center relative z-10 mt-2">
               <h3 className="text-[22px] leading-tight font-black text-white tracking-widest uppercase mb-1 drop-shadow-[0_0_10px_rgba(147,197,253,0.5)]">
                  Movilidad<br />Inteligente
               </h3>
            </div>
            
            <div className="relative flex-1 flex flex-col items-center justify-center p-6 min-h-[220px]">
              <div className="relative w-full flex flex-col items-center justify-center z-20 group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-700 pointer-events-none">
                 {/* Auto Renderizado Transparente Nativamente con sombra de auto-reflejo */}
                 <img src="/icons/cross_official.png" alt="Toyota Corolla Cross" className="w-full max-w-[340px] px-2 object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] scale-x-[-1] relative z-10"/>
              </div>
            </div>
            
            <div className="p-8 pt-0 text-center space-y-6 relative z-10">
               <p className="text-slate-400 text-[11px] uppercase tracking-widest">Soluciones Avanzadas</p>
               <div className="inline-block px-10 py-3 rounded-full border border-blue-400/50 text-blue-300 text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-400 group-hover:text-slate-900 transition-all shadow-lg">Descubrir</div>
            </div>
          </Link>

          {/* GESTIÓN ADMINISTRATIVA */}
          {isAdminSession && (
            <Link 
              href="/admin"
              className="group flex flex-col relative rounded-[2rem] border border-blue-500/30 bg-[#0f172a] overflow-hidden hover:border-blue-400/80 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500"
            >
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />
              
              <div className="p-8 pb-0 text-center relative z-10 mt-2">
                 <h3 className="text-[22px] leading-tight font-black text-white tracking-widest uppercase mb-1 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    Gestión<br />Administrativa
                 </h3>
              </div>
              
              <div className="relative flex-1 flex flex-col items-center justify-center p-6 min-h-[220px]">
                <div className="w-56 h-56 relative flex items-center justify-center pl-4 py-2">
                  <img 
                    src="/icons/admin_hud.png" 
                    alt="Benjamin Franklin" 
                    className="w-full h-full object-contain mix-blend-screen saturate-0 opacity-90 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700"
                  />
                </div>
                <div className="absolute bottom-6 right-8 z-30 opacity-60 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-1000">
                   <StrategicGearIcon className="text-blue-500/40 animate-spin-slow w-20 h-20" />
                </div>
              </div>
              
              <div className="p-8 pt-0 text-center space-y-6 relative z-10">
                 <p className="text-slate-400 text-[11px] uppercase tracking-widest">Control Operacional</p>
                 <div className="inline-block px-10 py-3 rounded-full border border-blue-500/50 text-blue-400 text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-500 group-hover:text-white transition-all shadow-lg">Gestionar</div>
              </div>
            </Link>
          )}

        </div>

        {/* Footer Link & Secret Credits */}
        <div className="mt-16 text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto px-6">
            <Link 
              href="/Manual_Conductor_Estrategico.html"
              target="_blank"
              className="flex-1 min-w-[240px] inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/5 bg-white/5 text-slate-500 hover:text-blue-400 hover:border-blue-500/20 transition-all text-[10px] font-black uppercase tracking-[0.2em] rounded-none shadow-sm hover:shadow-blue-500/5 group"
            >
               Manual Conductor Estratégico
            </Link>
            <Link 
              href="/Manual_Movilidad_Inteligente.html"
              target="_blank"
              className="flex-1 min-w-[240px] inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/5 bg-white/5 text-slate-500 hover:text-blue-300 hover:border-blue-400/20 transition-all text-[10px] font-black uppercase tracking-[0.2em] rounded-none shadow-sm hover:shadow-blue-400/5"
            >
               Manual Movilidad Inteligente
            </Link>
          </div>
          
          <p className="text-[7px] font-medium uppercase tracking-[0.5em] text-slate-200/[0.02] select-none pointer-events-none">
             ADMINISTRACIÓN SUPERIOR: BRIAN EZEQUIEL LÓPEZ - v9.1.0 PRESTIGE
          </p>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  );
}
