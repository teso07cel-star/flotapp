export const dynamic = 'force-dynamic';
import Link from "next/link";
import { getVehiculoByPatente, getAllSucursales } from "@/lib/actions";
import { redirect } from "next/navigation";
import DriverFormClient from "@/components/DriverFormClient";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import { HiluxIcon, EnduroIcon, ToyotaSedanIcon } from "@/components/FuturisticIcons";

export default async function DriverForm({ searchParams }) {
  const params = await searchParams;
  let patente = params.patente;
  
  const cookieStore = await cookies();
  const rawDriverName = cookieStore.get("driver_name")?.value;
  const identifiedDriver = rawDriverName ? decodeURIComponent(rawDriverName).replace(/\s+/g, ' ').trim() : null;

  if (!patente && identifiedDriver) {
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
  }

  if (!patente && !identifiedDriver) {
    redirect("/driver/entry");
  }

  const [vehiculoRes, sucursalesRes, statusRes] = await Promise.all([
    getVehiculoByPatente(patente),
    getAllSucursales(),
    import("@/lib/actions").then(m => m.getDriverOperationalStatus(identifiedDriver))
  ]);

  let vehiculo = vehiculoRes.success ? vehiculoRes.data : null;
  if (!vehiculo) {
      vehiculo = { patente: "SIN ASIGNAR", categoria: "AUTO", id: 0 };
  }

  const sucursales = sucursalesRes.success ? sucursalesRes.data : [];
  const operationalStatus = statusRes.success ? statusRes.data : { active: false, proposedKm: 0, lastKm: 0 };
  
  const lastLog = vehiculo.registros?.[0];
  const isFirstLog = !operationalStatus.active;
  const proposedKm = operationalStatus.proposedKm || (lastLog?.kmActual || 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden selection:bg-blue-500/30">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <LogoutButton />

        <div className="glass-panel p-8 sm:p-12 rounded-[3.5rem] blue-glow-border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-40 pointer-events-none mix-blend-screen overflow-visible z-0">
             {vehiculo.categoria === "MOTO" ? (
               <img src="/icons/moto.png" className="w-64 grayscale contrast-125 brightness-110 mt-20" alt="Moto" />
             ) : (vehiculo.categoria === "PICKUP" || vehiculo.categoria === "CAMIONETA" || vehiculo.patente.startsWith("INT")) ? (
               <img src="/icons/pickup.png" className="w-[30rem] relative top-24 right-4 grayscale brightness-[0.7] contrast-[1.2]" alt="Hilux" />
             ) : vehiculo.categoria === "AUTO" ? (
               <img src="/icons/etios.png" className="w-96 relative top-24 right-4 brightness-125 contrast-125" alt="Etios" />
             ) : (
               <div className="w-80 h-80 relative flex items-center justify-center mr-2 mt-20 bg-[#0f172a] rounded-3xl">
                 <img 
                   src="/icons/admin_hud.png" 
                   className="w-full h-full object-contain mix-blend-screen saturate-0 opacity-90 transition-all duration-700" 
                   alt="Operator Verified" 
                 />
               </div>
             )}
          </div>
          
          <div className="flex flex-col items-center gap-8 mb-16 pb-12 border-b border-white/5 relative z-10">
            <div className="h-40 w-full bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center border-4 border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)] relative overflow-hidden group">
               <div className="absolute inset-0 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all" />
               <span className="font-mono font-black text-white tracking-[0.2em] text-7xl relative z-10 uppercase px-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">{vehiculo.patente}</span>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-white uppercase tracking-[0.2em] leading-none mb-3 opacity-90">Protocolo Operativo</h1>
              <p className="text-[11px] text-blue-400/60 font-bold uppercase tracking-[0.5em]">Identificación de Unidad Blindada</p>
            </div>
          </div>

          <DriverFormClient 
            vehiculo={vehiculo} 
            sucursales={sucursales} 
            lastLog={lastLog} 
            identifiedDriver={identifiedDriver}
            isFirstLog={isFirstLog}
            operationalStatus={operationalStatus}
            proposedKm={proposedKm}
          />
        </div>
      </div>
    </div>
  );
}
