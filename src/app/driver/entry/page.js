import Link from "next/link";
import { getAllChoferes, handleDriverEntry } from "@/lib/actions";
import DriverAuthClient from "@/components/DriverAuthClient";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import Image from "next/image";

export default async function DriverEntry({ searchParams }) {
  const params = await searchParams;
  const error = params.error;
  
  const choferesRes = await getAllChoferes();
  const choferes = choferesRes.success ? choferesRes.data : [];

  const cookieStore = await cookies();
  const rawDriverName = cookieStore.get("driver_name")?.value;
  const driverName = rawDriverName ? decodeURIComponent(rawDriverName).trim() : null;
  let defaultPatente = "";

  if (driverName) {
    try {
      // Búsqueda insensible a mayúsculas/minúsculas para mayor robustez
      const choferDB = await prisma.chofer.findFirst({ 
        where: { nombre: { equals: driverName, mode: 'insensitive' } } 
      });

      if (choferDB?.patenteAsignada) {
        defaultPatente = choferDB.patenteAsignada;
      } else {
        // Si no tiene asignada, buscar el último vehículo que usó
        const lastRec = await prisma.registroDiario.findFirst({
          where: { nombreConductor: driverName },
          orderBy: { fecha: 'desc' },
          include: { vehiculo: true }
        });
        if (lastRec?.vehiculo?.patente) {
          defaultPatente = lastRec.vehiculo.patente;
        }
      }
    } catch (e) {
      console.error("Error al buscar patente sugerida:", e);
    }
  }

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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-gradient-to-tr from-blue-600 to-indigo-500 mb-6 shadow-xl shadow-blue-500/20 overflow-hidden shadow-2xl transition-transform hover:scale-105">
            <div className="relative w-full h-full"><Image src="/icon.png" alt="FLOTAPP" fill sizes="100%" className="object-cover" /></div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Portal del Conductor</h1>
          <p className="text-gray-400">Identificate e ingresa la patente</p>
        </div>

        <form action={handleDriverEntry} className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
          
          <DriverAuthClient choferes={choferes} />

          {driverName && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <label htmlFor="patente" className="block text-sm font-black text-blue-400 mb-3 text-center uppercase tracking-widest">
                  Vehículo Sugerido (Puedes cambiarlo)
                </label>
                <div className="relative group">
                  <input
                    key={driverName || "empty"}
                    id="patente"
                    name="patente"
                    type="text"
                    placeholder="Ej. AB123CD"
                    defaultValue={defaultPatente}
                    required
                    className="block w-full px-5 py-5 bg-gray-900/80 border-2 border-blue-500/30 rounded-2xl text-white text-3xl text-center tracking-[0.2em] uppercase transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder:text-gray-600 font-black shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                    autoComplete="off"
                    autoFocus={!!driverName}
                  />
                  <div className="mt-2 text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {defaultPatente ? "Sugerida por tu registro" : "Ingresa la patente del vehículo"}
                    </p>
                  </div>
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
                className="relative w-full overflow-hidden inline-flex items-center justify-center px-8 py-5 text-lg font-black tracking-widest uppercase text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform active:scale-[0.98] shadow-xl shadow-blue-500/20"
              >
                <span className="flex items-center gap-3">
                  Continuar
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
