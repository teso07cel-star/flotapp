import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/lib/actions";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get("flotapp_admin_auth")?.value === "true";
  
  // Si no hay cookie de auth, solo mostramos el contenido (el middleware se encarga de redirigir si no es /login)
  // Si no queremos mostrar el sidebar en /login, lo ocultamos aqu
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-emerald-950 flex flex-col md:flex-row font-sans text-gray-900 dark:text-emerald-50 selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Sidebar */}
      {isAuth && (
        <aside className="w-full md:w-64 bg-white/80 dark:bg-emerald-950/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-emerald-100 dark:border-emerald-900/50 flex-shrink-0 z-20 shadow-2xl shadow-emerald-900/20">
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
                 $
               </div>
               <span className="text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">FlotaAdmin</span>
            </div>
            
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                 Vehículos & Registros
              </Link>
              <Link href="/admin/drivers" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                 Choferes
              </Link>
              <Link href="/admin/branches" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                 Sucursales
              </Link>
              <Link href="/admin/reports/daily" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m3 2h12a2 2 0 002-2v-3a2 2 0 00-2-2h-3M9 19H3m9 0a3 3 0 01-3 3H7a3 3 0 01-3-3m9 0h6m-9-4V3a2 2 0 012-2h6a2 2 0 012 2v12m-5-8v1m-3 8v1m-3-10V5m-4 0h4"/></svg>
                 Reporte Diario
              </Link>
              <Link href="/admin/expenses" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.623 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.623-1M12 16v1m4-12V3c0-1.1-.9-2-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h4v-1.1a1 1 0 01.1-.5l.9-1.8c.2-.4.4-.8.7-1a4 4 0 012.3-1z"/></svg>
                 Gastos Globales
              </Link>
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
               <form action={logoutAdmin}>
                 <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer text-sm font-medium">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    Bloquear Panel
                 </button>
               </form>
               <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer text-sm font-medium">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  Salir
               </Link>
            </div>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-10">
         <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.4) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
         <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-600/10 to-transparent pointer-events-none" />
         
         {/* Marcas de agua de Dólar Blue */}
         <div className="fixed top-[20%] right-[5%] text-emerald-500/10 w-64 h-64 pointer-events-none transform rotate-12">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
         </div>
         <div className="fixed bottom-[10%] left-[10%] text-emerald-500/5 w-96 h-96 pointer-events-none transform -rotate-6">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
         </div>

         <div className="p-4 md:p-8 xl:p-12 max-w-7xl mx-auto relative z-10">
           {children}
         </div>
      </main>
    </div>
  );
}
