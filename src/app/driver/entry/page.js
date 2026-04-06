import Link from "next/link";
import { getAllChoferes } from "@/lib/actions";
import { redirect } from "next/navigation";
import DriverAuthClient from "@/components/DriverAuthClient";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import Image from "next/image";
import { HiluxIcon, AdminFaceIcon } from "@/components/FuturisticIcons";

export default async function DriverEntry({ searchParams }) {
  const params = await searchParams;
  const error = params.error;
  
  let choferesRes = await getAllChoferes();
  let choferes = choferesRes.success ? choferesRes.data : [];

  // SEEDING TÁCTICO PARA EL DEMO (Solo si la lista está vacía)
  if (choferes.length === 0) {
    console.log("⚠️ Base de Datos vacía. Iniciando auto-población táctica...");
    const { addChofer } = await import("@/lib/actions");
    await addChofer("GONZALO");
    await addChofer("RAMIRO");
    await addChofer("LUCAS");
    await addChofer("MARIANO");
    await addChofer("BRIAN LOPEZ"); // ASEGURAR IDENTIDAD PARA EL TEST ACTUAL
    
    // Volver a consultar
    choferesRes = await getAllChoferes();
    choferes = choferesRes.success ? choferesRes.data : [];
  }

  const cookieStore = await cookies();
  const rawDriverName = cookieStore.get("driver_name")?.value;
  const driverName = rawDriverName ? decodeURIComponent(rawDriverName).replace(/\s+/g, ' ').trim() : null;

  if (driverName) {
    redirect("/driver/form");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 selection:bg-blue-500/30">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
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
          <div className="inline-flex items-center justify-center w-full max-w-[400px] h-64 mb-2 relative group mx-auto">
             <div className="w-64 h-64 relative flex items-center justify-center bg-[#0f172a] rounded-[2rem] border border-blue-500/20 shadow-2xl p-4">
               <img 
                 src="/icons/admin_hud.png" 
                 className="w-full h-full object-contain mix-blend-screen saturate-0 opacity-90 transition-all duration-700" 
                 alt="Operator Verified" 
               />
             </div>
          </div>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-white mb-2 uppercase">Centro <span className="text-blue-500">Táctico</span></h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Identificación de Operador Estratégico</p>
          <div className="mt-2 inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10">
             <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none">v3.0.4-TACTICAL</span>
          </div>
        </div>

        <div className="glass-panel p-10 rounded-[3rem] blue-glow-border relative overflow-hidden">
          
          <DriverAuthClient choferes={choferes} />

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-wider text-center animate-bounce">
              {error}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
