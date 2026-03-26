"use client";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("VINCULADO ERROR VERCEL: ", error);
  }, [error]);

  return (
    <div className="p-10 bg-red-100 dark:bg-red-950 border-4 border-red-500 rounded-3xl m-10 text-red-900 dark:text-red-300 font-sans shadow-2xl">
      <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">¡Te encontré, Bug Escondido!</h2>
      <p className="mb-6 font-medium text-lg leading-relaxed">
        El error que estabas viendo no era un simple 500, era un fallo interno y profundo de Next.js al renderizar la ficha "AF668JR". Logré interceptarlo con una barrera pasiva (Error Boundary).
        <strong> Por favor envía el texto a continuación:</strong>
      </p>
      
      <div className="bg-black text-green-400 p-6 rounded-2xl overflow-auto text-sm font-mono whitespace-pre-wrap shadow-inner border border-gray-800">
        <span className="text-xl font-bold text-white block mb-4 border-b border-gray-800 pb-2">Error Digest: {error.digest || 'N/A'}</span>
        <span className="font-bold text-red-500 block">Mensaje:</span>
        <span className="block mb-4">{error.message || "Sin mensaje"}</span>
        
        <span className="font-bold text-purple-500 block">Stack Trace Completo:</span>
        <span className="block">{error.stack || "Sin stack trace"}</span>
      </div>
      
      <div className="mt-8 flex gap-4">
        <button 
          onClick={() => reset()} 
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-red-500/30"
        >
          Reintentar Renderizado
        </button>
      </div>
    </div>
  );
}
