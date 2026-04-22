import { getPrisma } from "@/lib/prisma";
import { getArDate } from "@/lib/utils";
import { getConfigLogistica } from "@/lib/appActions";
import Link from "next/link";

async function getRegistroInfo(id) {
  const numericId = parseInt(id);
  if (isNaN(numericId)) return null;
  
  return await getPrisma().registroDiario.findUnique({
    where: { id: numericId },
    include: {
      vehiculo: true,
      sucursales: true
    }
  });
}

export default async function DriverNavigationPage({ params }) {
  const { id } = await params;
  const [registro, configRes] = await Promise.all([
    getRegistroInfo(id),
    getConfigLogistica()
  ]);

  const config = configRes.success ? configRes.data : {};

  if (!registro) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-10 text-center">
        <div className="space-y-6">
           <p className="text-slate-500 font-black uppercase tracking-[0.4em]">Protocolo Error</p>
           <h1 className="text-2xl font-bold text-white">Registro no encontrado.</h1>
           <Link href="/" className="inline-block py-4 px-8 bg-blue-600 rounded-full font-black text-xs uppercase tracking-widest text-white transition-all">Volver al Inicio</Link>
        </div>
      </div>
    );
  }

  const isMoto = registro.vehiculo?.categoria === "MOTO";
  const driverName = registro.nombreConductor || "Conductor";

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-20 font-sans selection:bg-blue-500/30">
      <div className="max-w-md mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full animate-in fade-in duration-1000">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-green-400 font-black uppercase tracking-[0.2em] text-[8px]">Bitácora Transmitida</p>
           </div>
           <h2 className="text-3xl font-black uppercase tracking-tight italic">Itinerario de Hoy</h2>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{driverName} • {registro.vehiculo?.patente || "S/D"}</p>
        </div>

        {/* Lista de Paradas */}
        <div className="space-y-4">
           {registro.sucursales.map((s, idx) => (
             <div key={s.id} className="bg-[#0f172a]/80 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-600/5 flex items-center justify-center rounded-bl-[1.5rem] font-black text-slate-700 text-xs group-hover:text-blue-500/50 transition-colors">
                   {idx + 1}
                </div>
                
                <div className="mb-6">
                   <h3 className="text-xl font-black uppercase tracking-tight text-white/90 group-hover:text-blue-400 transition-colors">{s.nombre}</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.direccion || "Dirección no cargada"}</p>
                </div>

                <div className="flex flex-col gap-3">
                   {!isMoto && (
                     <a 
                        href={`https://waze.com/ul?q=${encodeURIComponent(s.direccion || s.nombre)}&navigate=yes`}
                        className="flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 hover:bg-blue-500 transition-all font-sans"
                     >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.5 13.5c0 4.142-3.358 7.5-7.5 7.5-.533 0-1.053-.056-1.554-.162l-2.946 2.162v-2.22c-3.136-1.042-5.4-4.041-5.4-7.538 0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5zm-7.5-3.75c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125 1.125-.504 1.125-1.125-.504-1.125-1.125-1.125zm-3.75 0c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125 1.125-.504 1.125-1.125-.504-1.125-1.125-1.125z"/></svg>
                        Abrir en Waze
                     </a>
                   )}
                   
                   <div className="grid grid-cols-2 gap-3">
                      <a 
                        href={`https://wa.me/${config.WHATSAPP_NORTE || ""}?text=${encodeURIComponent(`El chofer ${driverName} confirmó arribo a sucursal ${s.nombre}`)}`}
                        className="flex items-center justify-center gap-2 py-4 bg-green-600/10 border border-green-500/20 text-green-400 rounded-2xl font-black uppercase text-[8px] tracking-widest hover:bg-green-600/20 hover:border-green-500/50 active:scale-95 transition-all"
                      >
                         Avisar Norte
                      </a>
                      <a 
                        href={`https://wa.me/${config.WHATSAPP_SANTELMO || ""}?text=${encodeURIComponent(`El chofer ${driverName} confirmó arribo a sucursal ${s.nombre}`)}`}
                        className="flex items-center justify-center gap-2 py-4 bg-green-600/10 border border-green-500/20 text-green-400 rounded-2xl font-black uppercase text-[8px] tracking-widest hover:bg-green-600/20 hover:border-green-500/50 active:scale-95 transition-all"
                      >
                         Avisar San T.
                      </a>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Footer info */}
        <div className="text-center pt-10 border-t border-white/5">
           <Link href="/" className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] hover:text-white transition-colors">
              &larr; Volver al Protocolo Principal
           </Link>
        </div>

      </div>
    </div>
  );
}
