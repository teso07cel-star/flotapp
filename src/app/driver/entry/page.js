import Link from "next/link";
import { getAllChoferes, handleDriverEntry } from "@/lib/actions";
import DriverAuthClient from "@/components/DriverAuthClient";
import PatenteSelector from "@/components/PatenteSelector";
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
  // Decodificar y normalizar (quitar espacios de más)
  const driverName = rawDriverName ? decodeURIComponent(rawDriverName).replace(/\s+/g, ' ').trim() : null;
  let defaultPatente = "";

  if (driverName) {
    try {
      // 1. Intento de coincidencia exacta (normalizada)
      let choferDB = await prisma.chofer.findFirst({ 
        where: { nombre: { equals: driverName, mode: 'insensitive' } } 
      });

      // 2. Si falla, búsqueda flexible
      if (!choferDB) {
        const normalize = (str) => str.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
          .replace(/[^a-z0-9]/g, ""); // Solo letras y números

        const normalizedSearch = normalize(driverName);
        choferDB = choferes.find(c => normalize(c.nombre) === normalizedSearch);
      }

      if (choferDB?.patenteAsignada) {
        defaultPatente = choferDB.patenteAsignada;
      } else {
        // Fallback: Si no tiene asignada o es nuevo, buscar el último vehículo que usó
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-gradient-to-tr from-blue-600 to-indigo-500 mb-6 shadow-xl shadow-blue-500/20 overflow-hidden transition-transform hover:scale-105 border-4 border-gray-950">
            <div className="relative w-full h-full"><Image src="/icon.png" alt="FLOTAPP" fill sizes="100%" className="object-cover" /></div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase">Centro Operativo</h1>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-400">Identificación de Personal</p>
        </div>

        <form action={handleDriverEntry} className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-2xl relative">
          
          <DriverAuthClient choferes={choferes} />

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-wider text-center animate-bounce">
              {error}
            </div>
          )}

          {driverName && (
             <PatenteSelector defaultPatente={defaultPatente} />
          )}

        </form>
      </div>
    </div>
  );
}
