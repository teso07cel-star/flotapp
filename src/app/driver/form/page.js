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

  const [vehiculoRes, sucursalesRes] = await Promise.all([
    getVehiculoByPatente(patente),
    getAllSucursales()
  ]);

  let vehiculo = vehiculoRes.success ? vehiculoRes.data : null;
  if (!vehiculo) {
      vehiculo = { patente: "SIN ASIGNAR", categoria: "AUTO", id: 0 };
  }

  const sucursales = sucursalesRes.success ? sucursalesRes.data : [];
  const lastLog = vehiculo.registros?.[0];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 1. Verificar si ya validó el KM de ESTE vehículo hoy
  const logKmHoy = (identifiedDriver && vehiculo?.id) ? await prisma.registroDiario.findFirst({
    where: { 
      nombreConductor: identifiedDriver,
      vehiculoId: vehiculo.id,
      kmActual: { not: null },
      fecha: { gte: todayStart }
    },
    orderBy: { fecha: 'desc' }
  }) : null;

  const yaValidoKm = !!logKmHoy;
  const seIngresoKmHoy = yaValidoKm;

  // Fase A: INICIALIZACION (Pide KM) si no validó KM hoy
  // Fase B: OPERATIVO (No pide KM) si ya validó el odómetro de esta unidad hoy
  const phase = yaValidoKm ? "OPERATIVO" : "INICIALIZACION";
  const isFirstLog = !yaValidoKm;


  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden selection:bg-blue-500/30">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <LogoutButton />

        <div className="glass-panel p-8 sm:p-12 rounded-[3.5rem] blue-glow-border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-30 pointer-events-none mix-blend-screen overflow-visible">
             {vehiculo.categoria === "MOTO" ? (
               <img src="/icons/moto.png" className="w-56 grayscale contrast-125 brightness-110" alt="Moto" />
             ) : (vehiculo.categoria === "PICKUP" || vehiculo.categoria === "CAMIONETA" || vehiculo.patente.startsWith("INT")) ? (
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
            <div className="h-16 w-24 bg-blue-500/10 rounded-2xl flex items-center justify-center border-2 border-blue-500/20 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all" />
               <span className="font-mono font-black text-white tracking-[0.2em] text-xl relative z-10 uppercase">{vehiculo.patente}</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-1">Protocolo <span className="text-blue-500">Operativo</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Registro de Bitácora Estratégica</p>
            </div>
          </div>

          <DriverFormClient 
            vehiculo={vehiculo} 
            sucursales={sucursales} 
            lastLog={lastLog} 
            identifiedDriver={identifiedDriver}
            isFirstLog={isFirstLog}
            seIngresoKmHoy={seIngresoKmHoy}
          />
        </div>
      </div>
    </div>
  );
}
