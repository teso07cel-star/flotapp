export const dynamic = 'force-dynamic';
import Link from "next/link";
import { getVehiculoByPatente, getAllSucursales } from "@/lib/actions";
import { redirect } from "next/navigation";
import DriverFormClient from "@/components/DriverFormClient";

export default async function DriverForm({ searchParams }) {
  const params = await searchParams;
  const patente = params.patente;

  if (!patente) {
    redirect("/driver/entry");
  }

  const [vehiculoRes, sucursalesRes] = await Promise.all([
    getVehiculoByPatente(patente),
    getAllSucursales()
  ]);

  if (!vehiculoRes.success || !vehiculoRes.data) {
    redirect("/driver/entry?error=Vehículo no encontrado");
  }

  const vehiculo = vehiculoRes.data;
  const sucursales = sucursalesRes.success ? sucursalesRes.data : [];
  const lastLog = vehiculo.registros?.[0];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden selection:bg-blue-500/30">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <Link 
          href="/driver/entry"
          className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver
        </Link>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-800">
            <div className="h-14 w-20 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl flex items-center justify-center border border-gray-600 shadow-inner">
               <span className="font-mono font-bold text-white tracking-wider text-lg">{vehiculo.patente}</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Bitácora Diaria</h1>
              <p className="text-sm text-gray-400 font-medium">Completá los datos de tu jornada</p>
            </div>
          </div>

          <DriverFormClient vehiculo={vehiculo} sucursales={sucursales} lastLog={lastLog} />
        </div>
      </div>
    </div>
  );
}
