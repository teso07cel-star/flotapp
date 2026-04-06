import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/lib/actions";
import Image from "next/image";
import { AdminFaceIcon, StrategicGearIcon } from "@/components/FuturisticIcons";

export default async function AdminLayout({ children }) {
  // El middleware se encarga de la redirección y seguridad.
  // Si llegamos aquí, el usuario está autenticado.
  
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col md:flex-row font-sans text-gray-100 selection:bg-blue-500/30">
      {/* Sidebar - Siempre visible en admin si pasó el middleware */}
      <aside className="w-full md:w-64 bg-[#0f172a]/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-blue-500/20 flex-shrink-0 z-20">
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-blue-500/20 flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-transparent">
               <div className="relative w-11 h-11 flex items-center justify-center bg-slate-900 border border-slate-700 group overflow-hidden grayscale opacity-90 transition-all hover:grayscale-0 hover:opacity-100 rounded-sm">
                  <img 
                     src="/icons/admin_hud.png" 
                     alt="Benjamin Franklin Tactical" 
                     className="w-full h-full object-contain mix-blend-screen saturate-0" 
                  />
                  <div className="absolute inset-0 border-[2px] border-slate-800/50 mix-blend-overlay pointer-events-none" />
                  <div className="absolute -bottom-1 -right-1 z-10 bg-slate-900 rounded-sm">
                     <StrategicGearIcon className="w-4 h-4 text-slate-400 animate-spin-slow" />
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className="text-sm font-black tracking-[0.1em] text-white leading-tight uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Gestión</span>
                  <span className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase opacity-90 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">Administrativa</span>
               </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                 Vehículos & Registros
              </Link>
              <Link href="/admin/branches" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                 Sucursales
              </Link>
              <Link href="/admin/choferes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                 Choferes
              </Link>
              <Link href="/admin/externos" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                 Choferes Externos
              </Link>
              <Link href="/admin/reports/daily" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m3 2h12a2 2 0 002-2v-3a2 2 0 00-2-2h-3M9 19H3m9 0a3 3 0 01-3 3H7a3 3 0 01-3-3m9 0h6m-9-4V3a2 2 0 012-2h6a2 2 0 012 2v12m-5-8v1m-3 8v1m-3-10V5m-4 0h4"/></svg>
                 Reporte Automotor
              </Link>
              <Link href="/admin/reports/drivers" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>
                 Reporte Conductores
              </Link>
              <Link href="/admin/summary" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-cyan-400 bg-cyan-900/20 border border-cyan-500/30 hover:bg-cyan-900/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all cursor-pointer font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                 Resumen Mensual
              </Link>
              <Link href="/admin/expenses" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.623 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.623-1M12 16v1m4-12V3c0-1.1-.9-2-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h4v-1.1a1 1 0 01.1-.5l.9-1.8c.2-.4.4-.8.7-1a4 4 0 012.3-1z"/></svg>
                 Gastos Globales
              </Link>
              <Link href="/admin/mantenimiento" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-400 bg-emerald-900/20 border border-emerald-500/30 hover:bg-emerald-900/40 transition-all cursor-pointer font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                 Control & Mto.
              </Link>
            </nav>

            <div className="p-4 border-t border-blue-500/20 space-y-1">
               <div className="px-3 py-2 text-[6px] font-medium uppercase tracking-[0.2em] text-slate-400 mb-2 select-none pointer-events-none opacity-50">
                  Operador: Brian Lopez
               </div>
               
               {/* Presentaciones Estratégicas para Gerencia */}
               <div className="pb-3 mb-3 border-b border-blue-500/10 space-y-1">
                  <Link 
                    href="/Presentacion_Aplicacion_FlotApp.html" 
                    target="_blank"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all border border-transparent hover:border-blue-500/20"
                  >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                     Presentación y Estructura
                  </Link>
                  <Link 
                    href="/Presentacion_Beneficios_FlotApp.html" 
                    target="_blank"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all border border-transparent hover:border-emerald-500/20"
                  >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                     Beneficios Corporativos
                  </Link>
               </div>

               <form action={logoutAdmin}>
                 <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer text-sm font-medium border border-transparent hover:border-amber-500/30">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    Bloquear Panel
                 </button>
               </form>
               <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer text-sm font-medium border border-transparent hover:border-red-500/30">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  Desconexión
               </Link>
            </div>
          </div>
        </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0f172a] relative">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a] pointer-events-none" />
         <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
          <div className="p-4 md:p-8 xl:p-12 max-w-7xl mx-auto relative z-10 flex flex-col min-h-full">
            <div className="flex-1">
              {children}
            </div>
            
            <footer className="mt-16 pt-8 border-t border-blue-500/20 flex items-center justify-between text-[6px] font-medium uppercase tracking-[0.2em] text-slate-500 opacity-30 select-none pointer-events-none">
               <div>&copy; {new Date().getFullYear()} - FLOTAPP - TACTICAL ADMIN SYSTEM</div>
               <div className="transition-colors uppercase">By: Brian Lopez</div>
            </footer>
          </div>
      </main>
    </div>
  );
}
