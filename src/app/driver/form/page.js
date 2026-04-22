export const dynamic = 'force-dynamic';
import { getVehiculoByPatente, getAllSucursales, handleDriverEntry, getDriverOperationalStatus } from "@/lib/appActions";
import { redirect } from "next/navigation";
import DriverFormClient from "@/components/DriverFormClient";
import { cookies } from "next/headers";
import LogoutButton from "@/components/LogoutButton";
import PatenteSelector from "@/components/PatenteSelector";
import { MASTER_SUCURSALES } from "@/lib/constants";

/**
 * DriverForm v8.6 - BLINDAJE ATÓMICO
 * Eliminada toda posibilidad de bloqueo por redirección o fallo de DB.
 */
export default async function DriverForm({ searchParams }) {
  let patente = null;
  let identifiedDriver = null;
  let redirectTarget = null;

  // 1. OBTENER IDENTIDAD Y PARÁMETROS (Blindado)
  try {
    const params = await searchParams;
    patente = params?.patente;
    const cookieStore = await cookies();
    const rawDriverName = cookieStore.get("driver_name")?.value;
    identifiedDriver = rawDriverName ? decodeURIComponent(rawDriverName).trim() : null;

    if (!identifiedDriver) {
      redirectTarget = "/driver/entry";
    }
  } catch (e) {
    console.error("Error inicial en DriverForm:", e);
  }

  if (redirectTarget) redirect(redirectTarget);

  // 2. CARGA DE DATOS EN PARALELO CON FALLBACKS INDIVIDUALES
  let vehiculoRes = { success: false, data: { patente: patente || "NUEVA", categoria: "AUTO", id: 0 } };
  let sucursalesRes = { success: true, data: MASTER_SUCURSALES };
  let statusRes = { success: true, data: { active: false, proposedKm: 0, lastKm: 0 } };

  try {
    // Si tenemos patente, intentamos cargar datos reales, pero no bloqueamos si falla
    const results = await Promise.allSettled([
      patente && patente !== "NUEVA" ? getVehiculoByPatente(patente) : Promise.resolve({ success: false }),
      getAllSucursales(),
      getDriverOperationalStatus(identifiedDriver)
    ]);

    if (results[0].status === 'fulfilled' && results[0].value?.success && results[0].value.data) {
      vehiculoRes.data = results[0].value.data;
      vehiculoRes.success = true;
    }
    if (results[1].status === 'fulfilled' && results[1].value?.success) {
      sucursalesRes.data = results[1].value.data;
    }
    if (results[2].status === 'fulfilled' && results[2].value?.success) {
      statusRes.data = results[2].value.data;
    }
  } catch (error) {
    console.error("Fallo carga resiliente:", error);
  }

  const vehiculo = vehiculoRes.data;
  const sucursales = sucursalesRes.data;
  const operationalStatus = statusRes.data;
  const lastLog = vehiculo.registros?.[0];
  const isFirstLog = !operationalStatus.active;
  const proposedKm = operationalStatus.proposedKm || (lastLog?.kmActual || 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 sm:p-12 flex items-center justify-center relative overflow-hidden selection:bg-blue-500/30">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <LogoutButton />
        <div className="glass-panel p-8 sm:p-14 rounded-[4rem] blue-glow-border relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl shadow-3xl">
          <div className="absolute top-0 right-0 p-10 opacity-40 pointer-events-none mix-blend-screen overflow-visible group">
             {vehiculo.categoria === "MOTO" ? (
               <img src="/icons/moto.png" className="w-64 grayscale contrast-125 brightness-110 rotate-3 group-hover:rotate-0 transition-transform duration-1000" alt="Moto" />
             ) : (vehiculo.categoria === "PICKUP" || vehiculo.categoria === "CAMIONETA") ? (
               <img src="/icons/pickup.png" className="w-96 relative top-6 right-6 grayscale brightness-[0.8] contrast-[1.3] -rotate-2 group-hover:rotate-0 transition-transform duration-1000" alt="Unidad Pesada" />
             ) : (
               <img src="/icons/etios.png" className="w-80 relative top-10 right-10 brightness-110 contrast-125 rotate-2 group-hover:rotate-0 transition-transform duration-1000" alt="Unidad Ligera" />
             )}
          </div>
          
          <div className="flex flex-col gap-8 mb-12 pb-12 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-6">
              <div className="h-20 w-40 bg-blue-600/10 rounded-3xl flex items-center justify-center border-2 border-blue-500/30 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/20 transition-all duration-500" />
                 <span className="font-mono font-black text-white tracking-[0.25em] text-3xl relative z-10 uppercase drop-shadow-lg">{vehiculo.patente}</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">
                  Protocolo <span className="text-blue-500">Operativo</span>
                </h1>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.5em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Registro de Bitácora B8.4
                </p>
              </div>
            </div>

            {!vehiculoRes.success && patente !== "NUEVA" && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] text-center animate-pulse shadow-inner">
                 Advertencia: Modo Resiliente — Cargando Sucursales de Respaldo
              </div>
            )}
          </div>

          <div className="relative z-10">
            {(!patente || patente === "NUEVA") ? (
              <form action={handleDriverEntry} className="space-y-8">
                <input type="hidden" name="nombreConductor" value={identifiedDriver} />
                <PatenteSelector defaultPatente={
                   vehiculo.patente !== "NUEVA" ? vehiculo.patente : 
                   (operationalStatus.active ? operationalStatus.vehiculo?.patente : operationalStatus.assignedPatente) 
                } />
              </form>
            ) : (
              <DriverFormClient 
                vehiculo={vehiculo} 
                sucursales={sucursales} 
                lastLog={lastLog} 
                identifiedDriver={identifiedDriver}
                isFirstLog={isFirstLog}
                operationalStatus={operationalStatus}
                proposedKm={proposedKm}
              />
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-center gap-8 opacity-30 select-none grayscale">
           <img src="/icons/toyota.png" className="h-4 object-contain" alt="Toyota" />
           <div className="w-px h-4 bg-white/20" />
           <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white">FlotApp Tactical Division</span>
        </div>
      </div>
    </div>
  );
}
