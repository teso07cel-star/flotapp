export const dynamic = 'force-dynamic';
import Link from "next/link";
import { getVehiculoByPatente, getAllSucursales, handleDriverEntry } from "@/lib/appActions";
import { redirect } from "next/navigation";
import DriverFormClient from "@/components/DriverFormClient";
import { cookies } from "next/headers";
import { getPrisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import PatenteSelector from "@/components/PatenteSelector";

export default async function DriverForm({ searchParams }) {
  const prisma = getPrisma();
  try {
    const params = await searchParams;
    let patente = params?.patente;
    
    const cookieStore = await cookies();
    const rawDriverName = cookieStore.get("driver_name")?.value;
    const identifiedDriver = rawDriverName ? decodeURIComponent(rawDriverName).replace(/\s+/g, ' ').trim() : null;

    if (!patente && identifiedDriver) {
       try {
         const lastRec = await prisma.registroDiario.findFirst({
            where: { nombreConductor: identifiedDriver },
            orderBy: { fecha: 'desc' },
            include: { vehiculo: true }
         });
         
         if (lastRec?.vehiculo?.patente) {
            patente = lastRec.vehiculo.patente;
            redirect(`/driver/form?patente=${patente}`);
         } else {
            let choferDB = await prisma.chofer.findFirst({ 
              where: { nombre: { equals: identifiedDriver, mode: 'insensitive' } } 
            });
            if (choferDB?.patenteAsignada) {
               patente = choferDB.patenteAsignada;
               redirect(`/driver/form?patente=${patente}`);
            } else {
               patente = "NUEVA";
            }
         }
       } catch (dbErr) {
         // redirect() throws NEXT_REDIRECT - let it propagate
         if (dbErr?.digest?.startsWith?.('NEXT_REDIRECT')) throw dbErr;
         console.error("Error buscando patente del conductor:", dbErr);
         patente = "NUEVA"; // Fallback: pedir patente manualmente
       }
    }

    if (!patente && !identifiedDriver) {
      redirect("/driver/entry");
    }

    let vehiculoRes = { success: false };
    let sucursalesRes = { success: false };
    let statusRes = { success: false };

    try {
      [vehiculoRes, sucursalesRes, statusRes] = await Promise.all([
        getVehiculoByPatente(patente).catch(e => ({ success: false, error: e.message })),
        getAllSucursales().catch(e => ({ success: false, error: e.message })),
        import("@/lib/appActions").then(m => m.getDriverOperationalStatus(identifiedDriver)).catch(e => ({ success: false, error: e.message }))
      ]);
    } catch (e) {
      console.error("Error loading form data:", e);
    }

    let vehiculo = vehiculoRes?.success ? vehiculoRes.data : null;
    const isManualVehicle = !vehiculo;

    if (!vehiculo) {
        vehiculo = { patente: patente || "SIN ASIGNAR", categoria: "AUTO", id: 0 };
    }

    const sucursales = sucursalesRes?.success ? sucursalesRes.data : [];
    const operationalStatus = statusRes?.success ? statusRes.data : { active: false, proposedKm: 0, lastKm: 0 };
    
    const lastLog = vehiculo.registros?.[0];
    const isFirstLog = !operationalStatus.active;
    const proposedKm = operationalStatus.proposedKm || (lastLog?.kmActual || 0);

    return (
      <div className="min-h-screen bg-gray-950 text-gray-200 p-4 sm:p-12 flex items-center justify-center relative overflow-hidden selection:bg-blue-500/30">
        {/* ELEMENTOS DE FONDO TÁCTICO */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-xl relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <LogoutButton />

          <div className="glass-panel p-8 sm:p-14 rounded-[4rem] blue-glow-border relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl shadow-3xl">
            <div className="absolute top-0 right-0 p-10 opacity-40 pointer-events-none mix-blend-screen overflow-visible group">
               {vehiculo.categoria === "MOTO" ? (
                 <img src="/icons/moto.png" className="w-64 grayscale contrast-125 brightness-110 rotate-3 group-hover:rotate-0 transition-transform duration-1000" alt="Moto" />
               ) : (vehiculo.categoria === "PICKUP" || vehiculo.categoria === "CAMIONETA" || vehiculo.patente?.startsWith?.("INT")) ? (
                 <img src="/icons/pickup.png" className="w-96 relative top-6 right-6 grayscale brightness-[0.8] contrast-[1.3] -rotate-2 group-hover:rotate-0 transition-transform duration-1000" alt="Unidad Pesada" />
               ) : vehiculo.categoria === "AUTO" ? (
                 <img src="/icons/etios.png" className="w-80 relative top-10 right-10 brightness-110 contrast-125 rotate-2 group-hover:rotate-0 transition-transform duration-1000" alt="Unidad Ligera" />
               ) : (
                 <div className="w-72 h-72 relative flex items-center justify-center mr-4 mt-4 bg-slate-800/30 rounded-[3rem] border border-white/5">
                   <img 
                     src="/icons/admin_hud.png" 
                     className="w-full h-full object-contain mix-blend-screen saturate-0 opacity-80 group-hover:scale-110 transition-all duration-1000" 
                     alt="Sello de Operación" 
                   />
                 </div>
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
                    Registro de Bitácora B8.3
                  </p>
                </div>
              </div>

              {isManualVehicle && patente !== "NUEVA" ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] text-center animate-pulse shadow-inner">
                   Advertencia: Unidad no identificada en Red — Modo Backup Activado
                </div>
              ) : null}
            </div>

            <div className="relative z-10">
              {patente === "NUEVA" ? (
                <form action={handleDriverEntry} className="space-y-8">
                  <input type="hidden" name="nombreConductor" value={identifiedDriver} />
                  <PatenteSelector defaultPatente={null} />
                </form>
              ) : (
                <DriverFormClient 
                  vehiculo={vehiculo} 
                  sucursales={sucursales} 
                  lastLog={vehiculo.registros?.[0]} 
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
  } catch (err) {
    // Let Next.js redirects propagate
    if (err?.digest?.startsWith?.('NEXT_REDIRECT')) throw err;
    
    console.error("FATAL error in DriverForm:", err);
    
    // Fallback UI instead of 500
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-2xl font-black text-white uppercase mb-4">Error Temporal</h1>
          <p className="text-sm text-gray-400 mb-8">Hubo un problema al cargar el formulario. Por favor intenta nuevamente.</p>
          <a href="/driver/entry" className="inline-block px-8 py-4 bg-blue-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all">
            Volver al Inicio
          </a>
        </div>
      </div>
    );
  }
}
