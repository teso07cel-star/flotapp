import Link from "next/link";
import { getAllChoferes } from "@/lib/appActions";
import { redirect } from "next/navigation";
export const dynamic = 'force-dynamic';
import DriverAuthClient from "@/components/DriverAuthClient";
import { cookies } from "next/headers";

export default async function DriverEntry({ searchParams }) {
  let choferes = [];
  let error = null;

  try {
    const params = await searchParams;
    error = params?.error || null;
  } catch (e) {
    console.error("Error reading searchParams:", e);
  }

  try {
    const choferesRes = await getAllChoferes();
    choferes = choferesRes?.success ? choferesRes.data : [];
  } catch (e) {
    console.error("Error getting choferes:", e);
    choferes = [];
  }

  try {
    const cookieStore = await cookies();
    const rawDriverName = cookieStore.get("driver_name")?.value;
    const driverName = rawDriverName ? decodeURIComponent(rawDriverName).replace(/\s+/g, ' ').trim() : null;

    if (driverName) {
      redirect("/driver/form");
    }
  } catch (e) {
    // redirect() throws a special NEXT_REDIRECT error - let it propagate
    if (e?.digest?.startsWith?.('NEXT_REDIRECT')) throw e;
    console.error("Error checking cookies:", e);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 selection:bg-blue-500/30 relative overflow-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[150px] animate-pulse pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-1000">
        <Link 
          href="/"
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all mb-12"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Abortar Misión
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-full max-w-[400px] h-64 mb-6 relative group mx-auto">
             <div className="absolute -inset-4 bg-blue-500/20 rounded-[3rem] blur-2xl group-hover:bg-blue-500/30 transition duration-1000 opacity-50" />
             <div className="w-64 h-64 relative flex items-center justify-center bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-3xl p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                <img 
                  src="/icons/admin_hud.png" 
                  className="w-full h-full object-contain mix-blend-screen saturate-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" 
                  alt="Sistema Verificado" 
                />
             </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-[-0.07em] text-white leading-none uppercase italic">
              Centro <span className="text-blue-500">Táctico</span>
            </h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.6em] pl-2">
              Operador Estratégico <span className="text-blue-500/50">v8.3 Protocolo Táctico</span>
            </p>
          </div>
        </div>

        <div className="glass-panel p-12 rounded-[3.5rem] blue-glow-border relative overflow-hidden shadow-2xl backdrop-blur-2xl bg-slate-900/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <div className="relative z-10">
            <DriverAuthClient choferes={choferes} />
          </div>

          {error && (
            <div className="mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[9px] font-black uppercase tracking-[0.2em] text-center animate-bounce shadow-lg">
              {error}
            </div>
          )}
        </div>

        <p className="text-center mt-12 text-[8px] font-bold text-slate-600 uppercase tracking-[0.5em]">
          Protocolo de Encriptación Activo — Nodo B8.3
        </p>
      </div>
    </div>
  );
}

