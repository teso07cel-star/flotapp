export const dynamic = 'force-dynamic';
import Link from "next/link";
import { getVehiculoByPatente, getAllSucursales, handleDriverEntry } from "@/lib/appActions";
import { redirect } from "next/navigation";
import DriverFormClient from "@/components/DriverFormClient";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import PatenteSelector from "@/components/PatenteSelector";

export default async function DriverForm({ searchParams }) {
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
      <div className="min-h-screen bg-gray-950 text-gray-200 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden selection:bg-blue-500/30">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" />

        <div className="w-full max-w-xl relative z-10">
          <LogoutButton />

          <div className="glass-panel p-8 sm:p-12 rounded-[3.5rem] blue-glow-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-30 pointer-events-none mix-blend-screen overflow-visible">
               {vehiculo.categoria === "MOTO" ? (
                 <img src="/icons/moto.png" className="w-56 grayscale contrast-125 brightness-110" alt="Moto" />
               ) : (vehiculo.categoria === "PICKUP" || vehiculo.categoria === "CAMIONETA" || vehiculo.patente?.startsWith?.("INT")) ? (
                 <img src="/icons/pickup.png" className="w-80 relative top-4 right-4 grayscale brightness-[0.7] contrast-[1.2]" alt="Hilux" />
               ) : vehiculo.categoria === "AUTO" ? (
                 <img src="/icons/etios.png" className="w-72 relative top-8 right-4 brightness-125 contrast-125" alt="Etios" />
               ) : (
                 <div className="w-64 h-64 relative flex items-center justify-center mr-2 mt-2 bg-[#0f172a] rounded-3xl">
                   <img 
                     src="/icons/admin_hud.png" 
                     className="w-full h-full object-contain mix-blend-screen saturate-0 opacity-90 transition-all duration-700" 
                     alt="Operator Verified" 
                   />
                 </div>
               )}
            </div>
            
            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-white/5 relative z-10">
              <div className="h-16 w-32 bg-blue-500/10 rounded-2xl flex items-center justify-center border-2 border-blue-500/20 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all" />
                 <span className="font-mono font-black text-white tracking-[0.2em] text-xl relative z-10 uppercase">{vehiculo.patente}</span>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-1">Protocolo <span className="text-blue-500">Operativo</span></h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">Registro de Bitácora Estratégica</p>
              </div>
            </div>

            {isManualVehicle && patente !== "NUEVA" ? (
              <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                 Atención: Unidad no registrada. Los datos se guardarán como backup manual.
              </div>
            ) : null}

            {patente === "NUEVA" ? (
              <form action={handleDriverEntry}>
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
