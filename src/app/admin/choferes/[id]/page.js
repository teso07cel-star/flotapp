export const dynamic = 'force-dynamic';
import { getDriverTodayInfo } from "@/lib/appActions";
import Link from "next/link";
import DynamicMap from "@/components/DynamicMap";

export default async function ChoferDetailPage({ params }) {
  // En Next.js 16, params suele venir de la desestructuración, a veces via Promise, dependendo de config.
  // Resolvemos directamente para ser safe:
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const res = await getDriverTodayInfo(id);
  
  if (!res.success) {
    return (
      <div className="p-10 border border-red-500/20 bg-red-500/5 text-red-500 text-center rounded-[2rem]">
        <h1 className="font-black uppercase tracking-widest text-xl mb-2">Error de Sincronización</h1>
        <p className="text-xs uppercase opacity-80">{res.error}</p>
        <Link href="/admin/choferes" className="mt-6 inline-block bg-red-500/20 hover:bg-red-500/30 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
          Volver a Choferes
        </Link>
      </div>
    );
  }

  const { chofer, mapBranches, totalRegistrosHoy } = res.data;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <Link href="/admin/choferes" className="text-blue-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            ATRÁS
          </Link>
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase text-white">{chofer.nombre}</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">
            {totalRegistrosHoy > 0 ? "Operador Activo Hoy" : "Operador Inactivo Hoy"}
          </p>
        </div>
        
        <div className="bg-[#0f172a] p-6 border-l-4 border-blue-600 rounded-[2rem] shadow-xl">
           <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Bitácoras Activas Hoy</p>
           <p className="text-3xl font-black text-white">{totalRegistrosHoy}</p>
        </div>
      </div>

      <div className="mb-8">
         <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
               <h2 className="text-xl font-black uppercase tracking-tighter text-blue-500">Recorrido del Día</h2>
               <p className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em]">Mapa de Sucursales Visitadas</p>
            </div>
         </div>
         {mapBranches.length > 0 ? (
            <DynamicMap branchesData={mapBranches} />
         ) : (
            <div className="w-full h-[400px] rounded-[3rem] border-2 border-dashed border-slate-700/50 flex flex-col items-center justify-center bg-slate-900/30">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-600 mb-4 opacity-50"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center max-w-sm">Este chofer no ha registrado visitas a sucursales en el día de la fecha.</p>
            </div>
         )}
      </div>
      
    </div>
  );
}
