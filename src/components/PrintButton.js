"use client";

/**
 * Operación Legado de Acero v6.0.0
 * Componente Cliente puro para manejar la impresión de PDF.
 * Esto evita violaciones de frontera en los Server Components.
 */
export default function PrintButton() {
  return (
    <button 
      onClick={() => typeof window !== "undefined" && window.print()}
      className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white px-5 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl flex items-center gap-2 border border-white/10"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
      </svg>
      Exportar PDF
    </button>
  );
}
