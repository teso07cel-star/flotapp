import Link from "next/link";
import { processExternalEntry } from "@/lib/externalActions";
import Image from "next/image";
import { LuxurySedanIcon } from "@/components/FuturisticIcons";

export const dynamic = 'force-dynamic';

export default async function ExternalEntryPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 selection:bg-purple-500/30">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-3xl opacity-50 mix-blend-screen" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-600/20 to-transparent rounded-full blur-3xl opacity-50 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link 
          href="/"
          className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver al Inicio
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-slate-500/10 border border-slate-500/20 mb-8 shadow-2xl relative group">
             <div className="absolute inset-0 bg-slate-500/5 blur-xl group-hover:bg-slate-500/10 transition-all rounded-full" />
             <LuxurySedanIcon className="w-12 h-12 text-slate-300 relative z-10" />
          </div>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-white mb-2 uppercase">Movilidad <span className="text-slate-400">Inteligente</span></h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Red de Transporte y Logística Externa</p>
        </div>

        <form action={processExternalEntry} className="glass-panel p-10 rounded-[3rem] silver-glow-border relative overflow-hidden space-y-8">
          
          <div>
            <label htmlFor="patente" className="block text-sm font-medium text-gray-300 mb-3">
              Patente del Vehículo
            </label>
            <input
              id="patente"
              name="patente"
              type="text"
              placeholder="Ej. AB123CD"
              required
              className="block w-full px-5 py-4 bg-gray-900/50 border border-gray-700/50 rounded-2xl text-white text-xl text-center tracking-widest uppercase transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder:text-gray-600 font-bold"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="nombreConductor" className="block text-sm font-medium text-gray-300 mb-3">
              Nombre Completo del Conductor
            </label>
            <input
              id="nombreConductor"
              name="nombreConductor"
              type="text"
              placeholder="Ej. Juan Pérez"
              required
              className="block w-full px-5 py-4 bg-gray-900/50 border border-gray-700/50 rounded-2xl text-white text-lg transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder:text-gray-600 font-medium capitalize"
              autoComplete="name"
            />
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400 flex items-center justify-center gap-2 bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-6 text-[13px] font-black uppercase tracking-[0.4em] text-white transition-all duration-300 bg-slate-700 hover:bg-slate-600 rounded-2xl shadow-2xl active:scale-[0.97]"
          >
            Acceso Externo
          </button>
        </form>
      </div>
    </div>
  );
}
