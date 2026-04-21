"use client";
import { useEffect, useState } from "react";

export default function ConfirmationOverlay({ show, message = "Transmisión Confirmada", onComplete }) {
  const [stage, setStage] = useState(0); // 0: Hidden, 1: Opening, 2: Ticking, 3: Done

  useEffect(() => {
    if (show) {
      setStage(1);
      const t1 = setTimeout(() => setStage(2), 500);
      const t2 = setTimeout(() => setStage(3), 2500);
      const t3 = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setStage(0);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="relative flex flex-col items-center">
        {/* Animated Background Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className={`w-64 h-64 border border-blue-500/20 rounded-full transition-all duration-1000 ${stage >= 1 ? 'scale-150 opacity-0' : 'scale-50 opacity-100'}`} />
           <div className={`w-64 h-64 border border-cyan-500/20 rounded-full transition-all duration-1000 delay-300 ${stage >= 1 ? 'scale-[2] opacity-0' : 'scale-50 opacity-100'}`} />
        </div>

        {/* The Ticks */}
        <div className="relative w-40 h-40 flex items-center justify-center bg-slate-900 border-2 border-white/5 rounded-[3rem] shadow-3xl">
           <div className="absolute inset-4 bg-blue-600/10 rounded-[2.5rem] blur-xl animate-pulse" />
           
           <svg 
             viewBox="0 0 24 24" 
             className={`w-24 h-24 transition-all duration-700 ${stage >= 2 ? 'opacity-100' : 'opacity-0 scale-50'}`} 
             fill="none" 
             stroke="currentColor" 
             strokeWidth="3.5"
           >
             {/* First Tick */}
             <path 
               d="M5 13l4 4L19 7" 
               className={`text-blue-500 transition-all duration-500 ${stage >= 2 ? 'dash-offset-0' : 'dash-offset-100'}`}
               style={{
                 strokeDasharray: 30,
                 strokeDashoffset: stage >= 2 ? 0 : 30
               }}
             />
             {/* Second Tick (The Double Tick) */}
             <path 
               d="M9 13l4 4L24 7" 
               className={`text-cyan-400 transition-all duration-500 delay-500 ${stage >= 2 ? 'dash-offset-0' : 'dash-offset-100'}`}
               style={{
                 strokeDasharray: 30,
                 strokeDashoffset: stage >= 2 ? 0 : 30,
                 transform: 'translateX(2px)'
               }}
             />
           </svg>
        </div>

        {/* Text and Branding */}
        <div className={`mt-12 text-center transition-all duration-700 ${stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
           <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
             {message}
           </h2>
           <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-blue-500/50" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.6em]">Protocolo B8.3</span>
              <div className="h-[1px] w-8 bg-blue-500/50" />
           </div>
        </div>

        {/* Scanning Line Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-20 animate-[scan_3s_linear_infinite]" />
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translate(-50%, -100%); }
          100% { transform: translate(-50%, 100%); }
        }
      `}</style>
    </div>
  );
}
