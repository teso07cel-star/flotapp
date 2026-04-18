export const dynamic = 'force-dynamic';
import { getExternalVehicleStatus } from "@/lib/externalActions";
import ExternalFormClient from "@/components/ExternalFormClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ExternalFormPage({ searchParams }) {
  const params = await searchParams;
  const patente = params.patente;
  const driverName = params.driver;

  if (!patente || !driverName) {
    redirect("/external");
  }

  const res = await getExternalVehicleStatus(patente);
  
  if (!res.success) {
    return (
      <div className="min-h-screen items-center justify-center flex bg-gray-950 p-6 flex-col">
        <h1 className="text-3xl text-red-500 font-black tracking-tight mb-2">Error Crítico</h1>
        <p className="text-gray-400 mb-8">{res.error}</p>
        <Link href="/external" className="text-white px-6 py-3 bg-pink-600 font-bold rounded-2xl">Volver a intentar</Link>
      </div>
    );
  }

  const { vehiculo, requiredFrequency, lastMonthly, needsFullMonthly } = res.data;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden selection:bg-pink-500/30">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/external" className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Cancelar
          </Link>
          <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-xl">
             <p className="text-blue-400 font-bold tracking-[0.2em] uppercase text-xs">v8.3 Protocolo Táctico Activo</p>
             <span className="text-xs font-black tracking-widest uppercase text-pink-400">{vehiculo.patente}</span>
          </div>
        </div>

        <ExternalFormClient 
          vehiculo={vehiculo} 
          requiredFrequency={requiredFrequency} 
          lastMonthly={lastMonthly} 
          driverName={driverName} 
          needsFullMonthly={needsFullMonthly}
        />
      </div>
    </div>
  );
}
