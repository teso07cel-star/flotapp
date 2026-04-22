"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body className="bg-gray-950 text-white font-sans flex items-center justify-center min-h-screen">
        <div className="text-center p-10 space-y-6">
          <h1 className="text-6xl font-black text-red-600 italic">FALLA TOTAL</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest">Protocolo de Emergencia Nivel 1 Activado</p>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs font-mono text-red-400">
            {error.message || "Anomalía en el Layout Raíz"}
          </div>
          <button
            onClick={() => reset()}
            className="bg-blue-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            Reintentar Conexión
          </button>
        </div>
      </body>
    </html>
  );
}
