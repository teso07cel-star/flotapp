import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#050b18] text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a1428] border-b md:border-b-0 md:border-r border-blue-500/10 p-6 flex flex-col">
        <div className="mb-12">
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-500">FLOTAPP <span className="text-white">PRO</span></h1>
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500">Control Táctico</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-600/10 transition-colors text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-400">
            Panel General
          </Link>
          <Link href="/admin/summary" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-600/10 transition-colors text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-400">
            Resumen Mensual
          </Link>
          <Link href="/admin/maintenance" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-600/10 transition-colors text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-400">
            Semáforo Mantenimiento
          </Link>
          <Link href="/admin/branches" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-600/10 transition-colors text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-400">
            Sucursales
          </Link>
          <Link href="/admin/reports/daily" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-600/10 transition-colors text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-400">
            Libro de Ruta
          </Link>
          <Link href="/admin/migrate" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-yellow-600/10 transition-colors text-xs font-black uppercase tracking-widest text-gray-400 hover:text-yellow-400">
            Migración DB
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
           <Link href="/" className="text-[10px] font-black uppercase text-gray-600 hover:text-red-400 transition-colors">Salir del Sistema</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
         <div className="p-6 md:p-12">
           {children}
         </div>
      </main>
    </div>
  );
}
