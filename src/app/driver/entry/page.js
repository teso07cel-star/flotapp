import Link from "next/link";
import { getAllChoferes } from "@/lib/actions";
import DriverAuthClient from "@/components/DriverAuthClient";

export default async function DriverEntry() {
  const res = await getAllChoferes();
  const choferes = res.success ? res.data : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 selection:bg-blue-500/30 overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-3xl opacity-50 mix-blend-screen" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full blur-3xl opacity-50 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-between items-center mb-8 no-print">
          <Link 
            href="/"
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Inicio
          </Link>
          <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] italic">FlotApp Portal</div>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 mb-6 shadow-2xl shadow-blue-600/30 text-white transform hover:rotate-6 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase italic leading-none">Bitácora Digital</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Gestión de Logística en Tiempo Real</p>
        </div>

        <DriverAuthClient choferes={choferes} />
        
        <div className="mt-12 text-center">
           <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">© 2026 FLOTAPP SYSTEM</p>
        </div>
      </div>
    </div>
  );
}

