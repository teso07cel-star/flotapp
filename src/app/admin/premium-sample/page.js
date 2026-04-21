export const dynamic = 'force-dynamic';
import Link from "next/link";

export default function PremiumSample() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 space-y-12 animate-in fade-in duration-1000 relative overflow-hidden">
      {/* HUD Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none -z-20" />

      {/* Header Premium HUD v2.0 */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/10 pb-12 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-6">
             <div className="h-1 w-16 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Sample Inteligencia de Flota v2.0</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter mb-4 uppercase italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Centro de <span className="text-blue-500">Mando</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            Protocolo de Visualización Táctica Activo
          </p>
        </div>

        <div className="flex gap-4">
           <div className="bg-slate-900/60 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center justify-center min-w-[200px]">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Estatus Sistema</span>
              <span className="text-3xl font-black uppercase italic">Operativo</span>
           </div>
        </div>
      </div>

      {/* Grid de Ejemplo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[3rem] p-10 shadow-3xl shadow-blue-500/20 relative group overflow-hidden">
           <div className="relative z-10">
              <p className="text-blue-200/60 text-[10px] font-black uppercase tracking-widest mb-4">Métrica Total</p>
              <h2 className="text-6xl font-black tracking-tighter">48.2k</h2>
              <p className="text-white/80 font-bold text-xs uppercase mt-4">Kilómetros Consolidados</p>
           </div>
           <div className="absolute top-0 right-0 p-8 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
           </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl group hover:border-blue-500/50 transition-all duration-500">
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Unidades</p>
           <h2 className="text-6xl font-black tracking-tighter text-white">18</h2>
           <p className="text-blue-500 font-bold text-xs uppercase mt-4">Vehículos de Flota</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl">
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Eficiencia</p>
           <h2 className="text-6xl font-black tracking-tighter text-white">94%</h2>
           <p className="text-emerald-500 font-bold text-xs uppercase mt-4">Disponibilidad Red</p>
        </div>
      </div>

      <div className="text-center pt-24 opacity-50">
        <Link href="/admin" className="bg-white/5 border border-white/10 px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.5em] hover:bg-white hover:text-black transition-all">
          Cerrar Vista Previa
        </Link>
      </div>
    </div>
  );
}
