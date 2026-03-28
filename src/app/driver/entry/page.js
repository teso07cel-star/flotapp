import Link from "next/link";
import { getAllChoferes, handleDriverEntry } from "@/lib/actions";
import DriverAuthClient from "@/components/DriverAuthClient";

export default async function DriverEntry({ searchParams }) {
  const params = await searchParams;
  const error = params.error;
  
  const choferesRes = await getAllChoferes();
  const choferes = choferesRes.success ? choferesRes.data : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 selection:bg-blue-500/30">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-3xl opacity-50 mix-blend-screen" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full blur-3xl opacity-50 mix-blend-screen" />
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mb-6 shadow-xl shadow-blue-500/20 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Portal del Conductor</h1>
          <p className="text-gray-400">Identificate e ingresa la patente</p>
        </div>

        <form action={handleDriverEntry} className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
          
          <DriverAuthClient choferes={choferes} />

          <div className="mb-8">
            <label htmlFor="patente" className="block text-sm font-medium text-gray-300 mb-3">
              Patente del Vehículo
            </label>
            <div className="relative group">
              <input
                id="patente"
                name="patente"
                type="text"
                placeholder="Ej. AB123CD"
                required
                className="block w-full px-5 py-4 bg-gray-900/50 border border-gray-700/50 rounded-2xl text-white text-xl text-center tracking-widest uppercase transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-600 font-bold"
                autoComplete="off"
              />
              <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 bg-gradient-to-r from-blue-500 to-indigo-500 blur-sm pointer-events-none" style={{ margin: "-2px" }} />
            </div>
            {error && (
              <p className="mt-4 text-sm text-red-400 flex items-center justify-center gap-2 bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="relative w-full overflow-hidden inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              Continuar
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
