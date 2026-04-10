export const dynamic = 'force-dynamic';
import Link from "next/link";
import { getVehiculoByPatente, getAllSucursales, getDriverOperationalStatus } from "@/lib/actions";
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
    getDriverOperationalStatus(identifiedDriver, patente)
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

      <div className="w-full max-w-xl relative z-10 mt-16">
        <LogoutButton />

        <div className="glass-panel p-8 sm:p-12 rounded-[3.5rem] blue-glow-border relative overflow-hidden">
          
          <div className="flex flex-col items-center gap-6 mb-12 relative z-10 text-center">
            <div className="space-y-2 mb-6">
              <h1 className="text-xl font-black text-white uppercase tracking-[0.3em] opacity-90">Protocolo Operativo</h1>
              <p className="text-[9px] text-blue-400/60 font-bold uppercase tracking-[0.5em]">Identificación de Unidad Blindada</p>
            </div>

            <div className="relative w-full h-32 flex items-center justify-center">
               {vehiculo.categoria === "MOTO" ? (
                 <img src="/icons/moto.png" className="w-48 grayscale contrast-125 brightness-110 drop-shadow-2xl" alt="Moto" />
               ) : (vehiculo.categoria === "PICKUP" || vehiculo.categoria === "CAMIONETA" || vehiculo.patente.startsWith("INT")) ? (
                 <img src="/icons/pickup.png" className="w-64 grayscale brightness-90 contrast-125 drop-shadow-2xl" alt="Hilux" />
               ) : vehiculo.categoria === "AUTO" ? (
                 <img src="/icons/etios.png" className="w-56 brightness-110 contrast-125 drop-shadow-2xl" alt="Etios" />
               ) : (
                 <img src="/icons/admin_hud.png" className="w-24 mix-blend-screen opacity-60" alt="HUD" />
               )}
            </div>

            <div className="h-28 w-full bg-blue-500/5 rounded-[2rem] flex items-center justify-center border-2 border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden group mt-4">
               <div className="absolute inset-0 bg-blue-500/5 blur-2xl transition-all" />
               <span className="font-mono font-black text-white tracking-[0.15em] text-5xl relative z-10 uppercase px-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] shrink-0">{vehiculo.patente}</span>
            </div>
          </div>

          <div className="border-t border-white/5 pt-10">
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
    </div>
  );
}
