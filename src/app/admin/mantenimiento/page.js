import { 
  getAllVehiculos, 
  getUltimosRegistros 
} from "@/lib/appActions";
import ControlMantenimientoClient from "./ControlMantenimientoClient";
import AutoRefresh from "@/components/AutoRefresh";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ControlMantenimientoPage() {
  const vRes = await getAllVehiculos();
  
  if (!vRes.success) {
    return (
      <div className="p-10 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-3xl">
        <h2 className="text-red-600 dark:text-red-400 font-bold uppercase mb-2">Error de Conexión Táctica</h2>
        <p className="text-gray-600 font-mono text-sm">{vRes.error}</p>
        <p className="mt-4 text-xs text-gray-500 italic">Si ves este error, verifica la conexión a la base de datos en Vercel.</p>
      </div>
    );
  }

  const vehiculosRaw = vRes.data || [];

  // Calculate days for VTV and Seguro on the server
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const processedVehicles = vehiculosRaw.map(v => {
    let vtvDias = null;
    let seguroDias = null;

    if (v.vtvVencimiento) {
      const vtvDate = new Date(v.vtvVencimiento);
      vtvDate.setHours(0, 0, 0, 0);
      const diffTime = vtvDate - hoy;
      vtvDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (v.seguroVencimiento) {
      const seguroDate = new Date(v.seguroVencimiento);
      seguroDate.setHours(0, 0, 0, 0);
      const diffTime = seguroDate - hoy;
      seguroDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const odometro = v.registros?.[0]?.kmActual || 0;
    
    // Calcular Estado de Cubiertas Táctico
    const ultimoCambio = v.Mantenimiento?.find(m => m.tipoServicio === "Cambio de cubiertas");
    let cubiertasEstado = "Sin Datos";
    if (ultimoCambio && ultimoCambio.kilometraje) {
       const kmRecorridos = odometro - ultimoCambio.kilometraje;
       const restante = Math.max(0, 50000 - kmRecorridos);
       cubiertasEstado = `Faltan ${restante.toLocaleString()} KM`;
    }

    return {
      id: v.id,
      patente: v.patente,
      categoria: v.categoria,
      tipo: v.tipo,
      odometro,
      vtvDias,
      seguroDias,
      cubiertasEstado
    };
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AutoRefresh />
      
      {/* BANNER DE VERSIÓN PARA VERIFICACIÓN */}
      <div className="bg-emerald-600 px-6 py-2 rounded-full inline-block mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
         <p className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Protocolo de Mantenimiento v2.0 Activo</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase text-emerald-500">Control de Flota</h1>
          <p className="text-gray-500">Estado preventivo de unidades, VTV, Seguros y Odómetros.</p>
        </div>
        
        <div className="bg-slate-900/40 p-1 px-4 rounded-full border border-white/5 flex items-center gap-3">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
           <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Escaneo de Telemetría Sincronizado</span>
        </div>
      </div>

      {/* SECCIÓN DE RESUMEN TÁCTICO */}
      <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.6rem] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
           
           <div className="relative bg-[#020617]/90 border-2 border-emerald-500/20 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)] rounded-2xl flex items-center justify-center transition-all duration-500">
                         <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                         </svg>
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1 text-glow-emerald">Estado de Despliegue</h2>
                         <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.4em] opacity-80">Protocolo de Integridad Automotriz</p>
                      </div>
                   </div>
                </div>

                <ControlMantenimientoClient vehiculos={processedVehicles} />
           </div>
      </div>
    </div>
  );
}
