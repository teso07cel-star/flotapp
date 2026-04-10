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
            
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto font-sans">
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12 l 2 -2 m 0 0 l 7 -7 7 7 M 5 10 v 10 a 1 1 0 0 0 1 1 h 3 m 10 -11 l 2 2 m -2 -2 v 10 a 1 1 0 0 1 -1 1 h -3 m -6 0 a 1 1 0 0 0 1 -1 v -4 a 1 1 0 0 1 1 -1 h 2 a 1 1 0 0 1 1 1 v 4 a 1 1 0 0 0 1 1 m -6 0 h 6"/></svg>
                 Vehículos & Registros
              </Link>
              <Link href="/admin/branches" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21 V 5 a 2 2 0 0 0 -2 -2 H 7 a 2 2 0 0 0 -2 2 v 16 m 14 0 h 2 m -2 0 h -5 m -9 0 H 3 m 2 0 h 5 M 9 7 h 1 m -1 4 h 1 m 4 -4 h 1 m -1 4 h 1 m -5 10 v -5 a 1 1 0 0 1 1 -1 h 2 a 1 1 0 0 1 1 1 v 5 m -4 0 h 4"/></svg>
                 Sucursales
              </Link>
              <Link href="/admin/choferes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0 -5.356 -1.857 M17 20H7 m10 0v-2c0 -.656 -.126 -1.283 -.356 -1.857 M7 20H2v-2a3 3 0 0 1 5.356 -1.857 M7 20v-2c0 -.656 .126 -1.283 .356 -1.857 m0 0 a 5.002 5.002 0 0 1 9.288 0 M15 7 a 3 3 0 1 1 -6 0 a 3 3 0 0 1 6 0 z m 6 3 a 2 2 0 1 1 -4 0 a 2 2 0 0 1 4 0 z M7 10 a 2 2 0 1 1 -4 0 a 2 2 0 0 1 4 0 z"/></svg>
                 Choferes
              </Link>
              <Link href="/admin/externos" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7 a 4 4 0 1 1 -8 0 a 4 4 0 0 1 8 0 z M 12 14 a 7 7 0 0 0 -7 7 h 14 a 7 7 0 0 0 -7 -7 z"/></svg>
                 Choferes Externos
              </Link>
              <Link href="/admin/reports/daily" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17 v -2 a 4 4 0 0 0 -4 -4 H 5 a 4 4 0 0 0 -4 4 v 2 m 3 2 h 12 a 2 2 0 0 0 2 -2 v -3 a 2 2 0 0 0 -2 -2 h -3 M 9 19 H 3 m 9 0 a 3 3 0 0 1 -3 3 H 7 a 3 3 0 0 1 -3 -3 m 9 0 h 6 m -9 -4 V 3 a 2 2 0 0 1 2 -2 h 6 a 2 2 0 0 1 2 2 v 12 m -5 -8 v 1 m -3 8 v 1 m -3 -10 V 5 m -4 0 h 4"/></svg>
                 Reporte Automotor
              </Link>
              <Link href="/admin/reports/drivers" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21 v -2 a 4 4 0 0 0 -4 -4 H 9 a 4 4 0 0 0 -4 4 v 2 m 11 -10 a 4 4 0 1 1 -8 0 a 4 4 0 0 1 8 0 z"/></svg>
                 Reporte Conductores
              </Link>
              <Link href="/admin/drivers/status" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer font-bold drop-shadow-[0_0_8px_rgba(59,130,246,0.2)]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657 L 13.414 20.9 a 1.998 1.998 0 0 1 -2.827 0 l -4.244 -4.243 a 8 8 0 1 1 11.314 0 z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11 a 3 3 0 1 1 -6 0 a 3 3 0 0 1 6 0 z"/></svg>
                 Estado Chofer
              </Link>
              <Link href="/admin/reports/range" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-cyan-400 bg-cyan-900/10 border border-cyan-500/20 hover:bg-cyan-900/30 transition-all cursor-pointer font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7 V 3 m 8 4 V 3 m -9 8 h 10 M 5 21 h 14 a 2 2 0 0 0 2 -2 V 7 a 2 2 0 0 0 -2 -2 H 5 a 2 2 0 0 0 -2 2 v 12 a 2 2 0 0 0 2 2 z"/></svg>
                 Reporte Semanal
              </Link>
              <Link href="/admin/summary" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-[#0f172a] transition-all cursor-pointer">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19 v -6 a 2 2 0 0 0 -2 -2 H 5 a 2 2 0 0 0 -2 2 v 6 a 2 2 0 0 0 2 2 h 2 a 2 2 0 0 0 2 -2 z m 0 0 V 9 a 2 2 0 0 1 2 -2 h 2 a 2 2 0 0 1 2 2 v 10 m -6 0 a 2 2 0 0 0 2 2 h 2 a 2 2 0 0 0 2 -2 m 0 0 V 5 a 2 2 0 0 1 2 -2 h 2 a 2 2 0 0 1 2 2 v 14 a 2 2 0 0 1 -2 2 h -2 a 2 2 0 0 1 -2 -2 z"/></svg>
                 Resumen Mensual
              </Link>
              <Link href="/admin/expenses" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8 c -1.657 0 -3 .895 -3 2 s 1.343 2 3 2 3 .895 3 2 -1.343 2 -3 2 m 0 -8 c 1.11 0 2.08 .407 2.623 1 M 12 8 V 7 m 0 1 v 8 m 0 0 v 1 m 0 -1 c -1.11 0 -2.08 -.407 -2.623 -1 M 12 16 v 1 m 4 -12 V 3 c 0 -1.1 -.9 -2 -2 -2 H 4 a 2 2 0 0 0 -2 2 v 10 a 2 2 0 0 0 2 2 h 4 v -1.1 a 1 1 0 0 1 .1 -.5 l .9 -1.8 c .2 -.4 .4 -.8 .7 -1 a 4 4 0 0 1 2.3 -1 z"/></svg>
                 Gastos Globales
              </Link>
              <Link href="/admin/mantenimiento" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-400 bg-emerald-900/20 border border-emerald-500/30 hover:bg-emerald-900/40 transition-all cursor-pointer font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317 c .426 -1.756 2.924 -1.756 3.35 0 a 1.724 1.724 0 0 0 2.573 1.066 c 1.543 -.94 3.31 .826 2.37 2.37 a 1.724 1.724 0 0 0 1.065 2.572 c 1.756 .426 1.756 2.924 0 3.35 a 1.724 1.724 0 0 0 -1.066 2.573 c .94 1.543 -.826 3.31 -2.37 2.37 a 1.724 1.724 0 0 0 -2.572 1.065 c -.426 1.756 -2.924 1.756 -3.35 0 a 1.724 1.724 0 0 0 -2.573 -1.066 c -1.543 .94 -3.31 -.826 -2.37 -2.37 a 1.724 1.724 0 0 0 -1.065 -2.572 c -1.756 -.426 -1.756 -2.924 0 -3.35 a 1.724 1.724 0 0 0 1.066 -2.573 c -.94 -1.543 .826 -3.31 2.37 -2.37 .996 .608 2.296 .07 2.572 -1.065 z M 15 12 a 3 3 0 1 1 -6 0 a 3 3 0 0 1 6 0 z"/></svg>
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
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12 a 2 2 0 0 0 2 -2 v-6 a 2 2 0 0 0 -2 -2 H 6 a 2 2 0 0 0 -2 2 v6 a 2 2 0 0 0 2 2 z m 10 -10 V 7 a 4 4 0 0 0 -8 0 v 4 h 8 z"/></svg>
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
