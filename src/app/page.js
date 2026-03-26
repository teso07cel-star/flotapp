"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
export const dynamic = 'force-dynamic';
import Link from "next/link";
import { getVehiculoByPatente } from "@/lib/actions";

function HomePageContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-6 selection:bg-blue-500/30 relative overflow-hidden">
      {success && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-10 duration-500">
          <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-emerald-500/40 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            ¡Registro Guardado con Éxito!
          </div>
        </div>
      )}
      
      {/* Dynamic Crypto Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Nebulosas */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[40%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Símbolos Flotantes */}
        {/* Bitcoin */}
        <div className="absolute top-[15%] left-[10%] text-amber-500/20 w-32 h-32 animate-[bounce_8s_infinite]">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 10h-2V8h2a1 1 0 1 0 0-2H9v2H7v2h2v4H7v2h2v2h2v-2h2a3 3 0 0 0 0-6Zm-2 4h-2v-2h2a1 1 0 0 1 0 2Z" fillRule="evenodd"/><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8Z"/></svg>
        </div>
        
        {/* Ethereum */}
        <div className="absolute bottom-[20%] right-[15%] text-purple-500/20 w-40 h-40 animate-[bounce_10s_infinite]" style={{ animationDelay: '3s' }}>
          <svg viewBox="0 0 320 512" fill="currentColor"><path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.5 160 512l152-221.5-152 92.9z"/></svg>
        </div>

        {/* Solana */}
        <div className="absolute top-[40%] right-[5%] text-emerald-400/15 w-24 h-24 animate-[bounce_7s_infinite]" style={{ animationDelay: '1s' }}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.25 15.11H3.75a.75.75 0 00-.75.75v1.5a.75.75 0 00.75.75h16.5a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75zm0-4.61H3.75a.75.75 0 00-.75.75v1.5a.75.75 0 00.75.75h16.5a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75zm0-4.61H3.75a.75.75 0 00-.75.75v1.5a.75.75 0 00.75.75h16.5a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75z"/></svg>
        </div>

        {/* Tether */}
        <div className="absolute bottom-[10%] left-[20%] text-green-500/20 w-28 h-28 animate-[bounce_9s_infinite]" style={{ animationDelay: '5s' }}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14v-4c3.31 0 6-1.34 6-3s-2.69-3-6-3V4h-2v2C7.69 6 5 7.34 5 9s2.69 3 6 3v4h2zM7 9c0-1.1.9-2 2-2h2v4H9c-1.1 0-2-.9-2-2z"/></svg>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 mb-8 shadow-2xl shadow-blue-500/20 text-white transform hover:rotate-6 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            FLOTAPP
          </h1>
          <p className="text-xl text-gray-400 font-medium">Gestión inteligente para tu flota de vehículos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          <Link 
            href="/driver/entry"
            className="group relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 text-left transition-all duration-500 hover:bg-white/10 hover:border-blue-500/50 hover:-translate-y-2 shadow-2xl shadow-black/50"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-6 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Soy Chofer</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Cargá el kilometraje diario, sucursales visitadas y novedades del vehículo.</p>
            <div className="mt-8 flex items-center gap-2 text-blue-400 font-bold text-sm">
              INGRESAR <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </Link>

          <Link 
            href="/admin"
            className="group relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 text-left transition-all duration-500 hover:bg-white/10 hover:border-purple-500/50 hover:-translate-y-2 shadow-2xl shadow-black/50"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Soy Admin</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Gestioná vehículos, sucursales, visualizá resúmenes mensuales y vencimientos.</p>
            <div className="mt-8 flex items-center gap-2 text-purple-400 font-bold text-sm">
              INGRESAR <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  );
}
