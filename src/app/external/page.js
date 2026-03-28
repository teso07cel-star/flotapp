import Link from "next/link";
import { processExternalEntry } from "@/lib/externalActions";

export default function ExternalEntryPage({ searchParams }) {
  const error = searchParams?.error;

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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 mb-6 shadow-xl shadow-purple-500/20 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Conductores Externos</h1>
          <p className="text-gray-400">Portal para camiones y transportes tercerizados</p>
        </div>

        <form action={processExternalEntry} className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
          
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
            className="relative w-full overflow-hidden inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              Continuar a Bitácora
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
