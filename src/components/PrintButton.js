"use client";

export default function PrintButton({ label = "EXPORTAR PDF" }) {
  const handlePrint = () => {
    // Force dark mode print if possible, but standard print is better
    window.print();
  };

  return (
    <button 
      onClick={handlePrint}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-800 text-white hover:bg-black rounded-2xl font-black text-[10px] tracking-widest transition-all shadow-xl shadow-black/10 no-print"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      {label}
    </button>
  );
}
