"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
export const dynamic = 'force-dynamic';
import Link from "next/link";
import Image from "next/image";
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
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center space-x-2 w-auto px-6 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 mb-8 shadow-2xl shadow-blue-500/20 text-white transform hover:rotate-3 transition-transform duration-500">
            {/* Auto icon */}
            <div className="relative w-8 h-8"><Image src="/icons/auto.png" alt="Auto" fill sizes="100%" className="object-contain invert mix-blend-screen" /></div>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            {/* Pickup icon */}
            <div className="relative w-8 h-8"><Image src="/icons/pickup.png" alt="Pickup" fill sizes="100%" className="object-contain invert mix-blend-screen" /></div>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            {/* Moto icon */}
            <div className="relative w-8 h-8"><Image src="/icons/moto.png" alt="Moto" fill sizes="100%" className="object-contain invert mix-blend-screen" /></div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            FLOTAPP
          </h1>
          <p className="text-xl text-gray-400 font-medium">Gestión inteligente para tu flota de vehículos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          <Link 
            href="/driver/entry"
            className="group relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 text-left transition-all duration-500 hover:bg-white/10 hover:border-blue-500/50 hover:-translate-y-2 shadow-2xl shadow-black/50"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity w-32 h-32">
               {/* Truck watermark */}
               <Image src="/icons/pickup.png" alt="Pickup" fill sizes="100%" className="object-contain invert mix-blend-screen opacity-100" />
            </div>
            <div className="relative w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-6 overflow-hidden group-hover:bg-blue-500 transition-all transform group-hover:scale-110">
              {/* Truck icon */}
              <div className="relative w-7 h-7"><Image src="/icons/pickup.png" alt="Pickup" fill sizes="100%" className="object-contain invert mix-blend-screen" /></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Soy Chofer</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Cargá el kilometraje diario, sucursales visitadas y novedades del vehículo.</p>
            <div className="mt-8 flex items-center gap-2 text-blue-400 font-bold text-sm">
              INGRESAR <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </Link>

          <Link 
            href="/external"
            className="group relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 text-left transition-all duration-500 hover:bg-white/10 hover:border-pink-500/50 hover:-translate-y-2 shadow-2xl shadow-black/50 flex flex-col justify-between h-full"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity w-32 h-32">
               {/* Externo watermark */}
               <Image src="/icons/auto.png" alt="Externo" fill sizes="100%" className="object-contain invert mix-blend-screen opacity-100" />
            </div>
            <div>
              <div className="relative w-14 h-14 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center mb-6 overflow-hidden group-hover:bg-pink-500 transition-all transform group-hover:scale-110">
                {/* Externo icon */}
                <div className="relative w-7 h-7"><Image src="/icons/auto.png" alt="Externo" fill sizes="100%" className="object-contain invert mix-blend-screen" /></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Soy Externo</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Registro mensual, semanal y diario para vehículos tercerizados.</p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-pink-400 font-bold text-sm">
              INGRESAR <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </Link>

          <Link 
            href="/admin"
            className="group relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 text-left transition-all duration-500 hover:bg-white/10 hover:border-purple-500/50 hover:-translate-y-2 shadow-2xl shadow-black/50"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity w-32 h-32">
               {/* Admin Banknote watermark */}
               <Image src="/icons/admin.png" alt="Admin" fill sizes="100%" className="object-contain invert mix-blend-screen opacity-100" />
            </div>
            <div className="relative w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6 overflow-hidden group-hover:bg-purple-500 transition-all transform group-hover:scale-110">
              {/* Admin Banknote icon */}
              <div className="relative w-7 h-7"><Image src="/icons/admin.png" alt="Admin" fill sizes="100%" className="object-contain invert mix-blend-screen" /></div>
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
