"use client";

import { useState } from "react";

export default function PatenteSelector({ defaultPatente }) {
  const [showInput, setShowInput] = useState(!defaultPatente);

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
               className="block w-full px-5 py-6 bg-gray-900 border-2 border-blue-500/20 rounded-[2rem] text-white text-3xl text-center tracking-[0.3em] uppercase transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-gray-700 font-black shadow-inner shadow-blue-500/5 hover:border-blue-500/40"
               autoComplete="off"
               autoFocus
             />
             <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-blue-500/50">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
             </div>
           </div>
           
           {defaultPatente && (
             <button 
               type="button" 
               onClick={() => setShowInput(false)}
               className="w-full mt-4 text-[10px] text-gray-500 hover:text-blue-400 font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m 15 18 -6 -6 6 -6"/></svg>
               Volver a mi patente asignada
             </button>
           )}
         </div>

         <button
            type="submit"
            className="w-full relative overflow-hidden inline-flex items-center justify-center px-8 py-6 text-[12px] font-black tracking-[0.3em] uppercase text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.2)] group"
          >
            <span className="flex items-center gap-3 relative z-10">
              Continuar Turno
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-2"><path d="M 5 12 h 14"/><path d="m 12 5 7 7 -7 7"/></svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
      </div>
    );
  }

  // Si tiene asignada y !showInput
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center justify-center p-8 bg-blue-600/10 border border-blue-500/30 rounded-[2.5rem] mb-8 relative overflow-hidden group">
         
         <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-center">Unidad Asignada</p>
         <h3 className="text-white text-4xl font-black uppercase tracking-[0.2em] mb-1 text-center font-mono">
           {defaultPatente}
         </h3>
         <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest text-center italic mt-2">
           ¿Vas a manejar esta unidad en tu turno de hoy?
         </p>
         
         <input type="hidden" name="patente" value={defaultPatente} />
      </div>

      <div className="grid grid-cols-2 gap-4">
         <button
            type="button"
            onClick={() => setShowInput(true)}
            className="flex flex-col items-center justify-center gap-2 py-6 px-4 bg-gray-900 border-2 border-white/5 rounded-[2rem] text-gray-400 hover:text-white hover:bg-gray-800 hover:border-white/10 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M 3 12 a 9 9 0 1 0 9 -9 a 9.75 9.75 0 0 0 -6.74 2.74 L 3 8"/><path d="M 3 3 v 5 h 5"/></svg>
            <span className="text-[10px] font-black uppercase tracking-widest text-center">No voy a usarla<br/>Cambiar Patente</span>
          </button>
          <button
            type="submit"
            className="flex flex-col items-center justify-center gap-2 py-6 px-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] text-white transition-all shadow-xl shadow-blue-500/20 hover:brightness-110 active:scale-95 border-2 border-transparent hover:border-blue-400/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm"><path d="M 20 6 9 17 l -5 -5"/></svg>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-center text-balance mt-1">Sí, Confirmar<br/>y Continuar</span>
          </button>
      </div>
    </div>
  );
}
