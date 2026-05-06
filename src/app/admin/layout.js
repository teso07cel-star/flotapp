import Link from "next/link";
import { cookies } from "next/headers";
import { logoutAdmin } from "@/lib/authActions";
import Image from "next/image";
import { AdminFaceIcon, StrategicGearIcon } from "@/components/FuturisticIcons";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({ children }) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("flotapp_admin_auth");
    const isAuth = authCookie?.value === "true";
    
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col md:flex-row font-sans text-gray-100 selection:bg-blue-500/30">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-[#0f172a]/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-blue-500/20 flex-shrink-0 z-20">
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-blue-500/20 flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-transparent">
                 <div className="relative w-11 h-11 flex items-center justify-center bg-slate-900 border border-slate-700 group overflow-hidden grayscale opacity-90 transition-all hover:grayscale-0 hover:opacity-100 rounded-sm">
                    <img 
                       src="/icons/admin_hud.png" 
                       alt="System Logo" 
                       className="w-full h-full object-contain mix-blend-screen saturate-0" 
                    />
                    <div className="absolute inset-0 border-[2px] border-slate-800/50 mix-blend-overlay pointer-events-none" />
                    <div className="absolute -bottom-1 -right-1 z-10 bg-slate-900 rounded-sm">
                       <StrategicGearIcon className="w-4 h-4 text-slate-400 animate-spin-slow" />
                    </div>
                 </div>
                 <div className="flex flex-col relative">
                     <span className="text-sm font-black tracking-[0.1em] text-white leading-tight uppercase">Dashboard</span>
                     <span className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase opacity-90">Administrativo</span>
                      <div className="absolute -top-1 -right-4 bg-blue-600 text-white text-[7px] px-2 py-1 rounded-full font-black animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)] uppercase whitespace-nowrap">v9.1.0 PRESTIGE</div>
                  </div>
              </div>
              
              {/* Mobile Navigation (Persistent) */}
              <div className="md:hidden w-full p-4 border-b border-blue-500/20 bg-slate-900/50">
                  <h4 className="font-black uppercase text-[10px] text-blue-400 mb-4 tracking-[0.3em] px-2 opacity-70">Navegación Admin</h4>
                  <nav className="flex flex-wrap gap-2">
                      <Link href="/admin" className="px-4 py-2.5 rounded-xl text-gray-400 bg-slate-800 border border-white/5 hover:text-blue-300 transition-all text-[9.5px] font-black uppercase tracking-widest">Vehículos</Link>
                      <Link href="/admin/branches" className="px-4 py-2.5 rounded-xl text-gray-400 bg-slate-800 border border-white/5 hover:text-blue-300 transition-all text-[9.5px] font-black uppercase tracking-widest">Sucursales</Link>
                      <Link href="/admin/choferes" className="px-4 py-2.5 rounded-xl text-gray-400 bg-slate-800 border border-white/5 hover:text-blue-300 transition-all text-[9.5px] font-black uppercase tracking-widest">Choferes</Link>
                      <Link href="/admin/reports/daily" className="px-4 py-2.5 rounded-xl text-gray-400 bg-slate-800 border border-white/5 hover:text-blue-300 transition-all text-[9.5px] font-black uppercase tracking-widest">Reportes</Link>
                      <Link href="/admin/reports/monthly" className="px-4 py-2.5 rounded-xl text-cyan-400 bg-cyan-900/20 border border-cyan-500/30 transition-all text-[9.5px] font-black uppercase tracking-widest">Mensual</Link>
                      <Link href="/admin/mantenimiento" className="px-4 py-2.5 rounded-xl text-emerald-400 bg-emerald-900/20 border border-emerald-500/30 transition-all text-[9.5px] font-black uppercase tracking-widest">Control</Link>
                      <Link href="/admin/settings" className="px-4 py-2.5 rounded-xl text-amber-500 bg-amber-900/20 border border-amber-500/30 transition-all text-[9.5px] font-black uppercase tracking-widest">Ajustes</Link>
                  </nav>
              </div>


              {/* Desktop Navigation */}
              <nav className="hidden md:flex flex-1 p-4 space-y-1 overflow-y-auto flex-col">

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
                <Link href="/admin/reports/daily" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m3 2h12a2 2 0 002-2v-3a2 2 0 00-2-2h-3M9 19H3m9 0a3 3 0 01-3 3H7a3 3 0 01-3-3m9 0h6m-9-4V3a2 2 0 012-2h6a2 2 0 012 2v12m-5-8v1m-3 8v1m-3-10V5m-4 0h4"/></svg>
                   Reporte Automotor
                </Link>
                <Link href="/admin/reports/monthly" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-cyan-400 bg-cyan-900/20 border border-cyan-500/30 hover:bg-cyan-900/40 transition-all font-bold">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                   Reporte Mensual
                </Link>
                <Link href="/admin/mantenimiento" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-400 bg-emerald-900/20 border border-emerald-500/30 hover:bg-emerald-900/40 transition-all font-bold">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                   Control y Mantenimiento
                </Link>
                <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-500 bg-amber-900/20 border border-amber-500/30 hover:bg-amber-900/40 transition-all font-bold">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                   Configuración
                </Link>
              </nav>
              
              <div className="p-4 border-t border-blue-500/20 space-y-1">
                 <div className="px-3 py-2 text-[6px] font-medium uppercase tracking-[0.2em] text-slate-400 mb-2 select-none opacity-50">
                    Operador: Brian Ezequiel Lopez
                 </div>
                 <form action={logoutAdmin}>
                   <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer text-sm font-medium border border-transparent hover:border-amber-500/30">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      Bloquear Panel
                   </button>
                 </form>
              </div>
            </div>
          </aside>
    

        
        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0f172a] relative">
           {/* SEÑAL TACTICA v9.0.0 */}
           <div className="w-full bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.6em] py-3 text-center border-b border-blue-500/40 z-50 animate-in fade-in slide-in-from-top duration-700 no-print flex items-center justify-center gap-4">
              <StrategicGearIcon className="w-4 h-4 text-blue-500 animate-spin-slow" />
              <span>SISTEMA v9.1.0 PRESTIGE - CONTROL LOGÍSTICO TOTAL</span>
              <StrategicGearIcon className="w-4 h-4 text-blue-500 animate-spin-slow" />
           </div>

           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a] pointer-events-none" />
            <div className="p-4 md:p-8 xl:p-12 max-w-7xl mx-auto relative z-10 flex flex-col min-h-full">
              <div className="flex-1">
                {children}
              </div>
              <footer className="mt-16 pt-8 border-t border-blue-500/20 flex items-center justify-between text-[6px] font-medium uppercase tracking-[0.2em] text-slate-500 opacity-30">
                 <div>&copy; {new Date().getFullYear()} - FLOTAPP - TACTICAL ADMIN SYSTEM</div>
                 <div className="uppercase">Auditoría: Brian Ezequiel Lopez (v4.0 ELITE)</div>
              </footer>
            </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("CRASH FATAL EN LAYOUT ADMINISTRATIVO:", error);
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-8">
        <div className="bg-slate-900 border-2 border-dashed border-blue-500/30 rounded-[3rem] p-16 max-w-2xl w-full text-center shadow-3xl shadow-blue-500/10 backdrop-blur-xl">
           <div className="w-24 h-24 bg-blue-600/20 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-blue-500/20 shadow-2xl">
              <StrategicGearIcon className="w-12 h-12 animate-spin-slow" />
           </div>
           <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">PANEL BLOQUEADO</h2>
           <p className="text-blue-400 font-bold uppercase text-[10px] tracking-widest mb-10">Brian Ezequiel Lopez, hemos detectado una excepción en el núcleo del Layout</p>
           
           <div className="bg-black/40 p-8 rounded-3xl text-left border border-white/5 mb-10">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-3">Reporte de Error Táctico:</p>
              <code className="text-blue-300 font-mono text-sm break-all leading-relaxed">
                {error.message || "Fallo crítico en la carga del panel administrativo."}
              </code>
           </div>
           
           <div className="flex flex-col gap-4">
              <a href="/admin" className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
                Reiniciar Módulo Admin
              </a>
              <a href="/" className="text-[9px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-[0.3em]">
                Ir a Panel General
              </a>
           </div>
        </div>
      </div>
    );
  }
}
