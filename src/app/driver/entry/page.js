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
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Operador Estratégico - Versión B8</p>
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

