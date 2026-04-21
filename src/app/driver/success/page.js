import { getPrisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DriverSuccess({ searchParams }) {
  const { id } = await searchParams;
  
  if (!id) {
    return (
       <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
         <h1 className="text-2xl text-red-500 font-bold mb-4">Error: Registro no especificado</h1>
         <Link href="/driver/entry" className="px-6 py-3 bg-blue-600 rounded-full font-bold">Volver al Inicio</Link>
       </div>
    );
  }

  const prisma = getPrisma();
  const registro = await prisma.registroDiario.findUnique({
    where: { id: parseInt(id) },
    include: {
      vehiculo: true,
      sucursales: true
    }
  });

  if (!registro) {
     return notFound();
  }

  const isMoto = registro.vehiculo?.categoria === "MOTO";
  const hasSucursales = registro.sucursales && registro.sucursales.length > 0;
  
  let config = [];
  try {
     config = await prisma.configLogistica.findMany();
  } catch (err) {
     console.error("Local config fetch error:", err);
  }
  const phoneNorte = config.find(c => c.key === "PHONE_NORTE")?.value || "5491111111111";
  const phoneSanTelmo = config.find(c => c.key === "PHONE_SANTELMO")?.value || "5491122222222";
  const waNorteLink = `https://wa.me/${phoneNorte}?text=${encodeURIComponent("Hola Base NORTE, les informo mi próximo arribo. Vehículo: " + (registro.vehiculo?.patente || "S/D"))}`;
  const waSanTelmoLink = `https://wa.me/${phoneSanTelmo}?text=${encodeURIComponent("Hola Base SAN TELMO, les informo mi próximo arribo. Vehículo: " + (registro.vehiculo?.patente || "S/D"))}`;

  // Time and Date
  const txTime = new Date(registro.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute:'2-digit' });

  const bgPath = isMoto ? "/icons/moto_tactic.png" : "/icons/pickup_tactic.png";

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-blue-500/30 relative">
        {/* Ambient Animated Background */}
        <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Dynamic Vehicle Background */}
        <div className="absolute inset-x-0 top-1/4 pointer-events-none opacity-10 blur-sm flex justify-center">
            <img src={bgPath} alt="Vehiculo Fondo" className="w-[120%] max-w-[800px] object-contain scale-125 mix-blend-screen opacity-50" />
        </div>

        <div className="max-w-md w-full space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-1000 mt-4 font-['Outfit']">
            {/* HEADER */}
            <div className="text-center space-y-2 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em]">Protocolo Cumplido</span>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em] italic opacity-70">
                    Transmitido desde nodo operacional {txTime}
                </p>
            </div>

            {hasSucursales ? (
                <div className="space-y-4">
                    <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.5em] px-2 mb-4">Pickup ({registro.sucursales.length} Sucursales)</h2>
                    
                    {registro.sucursales.map((sucursal, idx) => {
                       const address = sucursal.direccion || sucursal.nombre;
                       const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(address + ', Buenos Aires')}&navigate=yes`;
                       
                       const isFirst = idx === 0;
                       const opacityClass = isFirst ? "" : "opacity-60 hover:opacity-100 transition-opacity";

                       const isOtros = sucursal.nombre.toLowerCase().includes('otros');
                       const showWaze = !isMoto && !isOtros;
                       const WAZE_GRID_COLS = showWaze ? "grid-cols-3" : "grid-cols-2";

                       return (
                          <div key={sucursal.id} className={`bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-3xl border border-blue-500/10 p-6 rounded-[2.5rem] relative overflow-hidden group shadow-[0_15px_40px_rgba(0,0,0,0.4)] ${opacityClass} mb-5 hover:border-blue-500/30 hover:scale-[1.02] transition-all duration-500`}>
                              {isFirst && <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>}
                              
                              <div className="flex justify-between items-center mb-4 pl-2 relative z-10">
                                  <p className="font-black text-sm uppercase tracking-tight">Sucursal: <span className="text-blue-400 text-lg">{sucursal.nombre}</span></p>
                              </div>
                              <div className={`grid ${WAZE_GRID_COLS} gap-3 relative z-10`}>
                                  {showWaze && (
                                    <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className={`bg-gradient-to-b from-[#1e3a8a] to-[#172554] ${isFirst ? 'hover:to-[#1d4ed8] shadow-[0_0_20px_rgba(59,130,246,0.3)]' : ''} text-white py-4 px-1 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border border-blue-500/20 hover:border-blue-400/50`}>
                                        <img src="/icons/waze.png" className={`w-7 h-7 filter drop-shadow-md pb-0.5 ${!isFirst ? 'opacity-60' : 'opacity-90 saturate-150 brightness-125'}`} alt="Waze" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">Waze</span>
                                    </a>
                                  )}
                                  <a href={waNorteLink} target="_blank" rel="noopener noreferrer" className={`bg-gradient-to-b from-[#059669] to-[#064e3b] ${isFirst ? 'hover:to-[#059669] shadow-[0_0_20px_rgba(34,197,94,0.3)]' : ''} text-white py-4 px-1 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border border-emerald-500/20 hover:border-emerald-400/50`}>
                                      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className={`w-7 h-7 ${!isFirst && 'opacity-60'}`} alt="WA" />
                                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">Norte</span>
                                  </a>
                                  <a href={waSanTelmoLink} target="_blank" rel="noopener noreferrer" className={`bg-gradient-to-b from-[#059669] to-[#064e3b] ${isFirst ? 'hover:to-[#059669] shadow-[0_0_20px_rgba(34,197,94,0.3)]' : ''} text-white py-4 px-1 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border border-emerald-500/20 hover:border-emerald-400/50`}>
                                      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className={`w-7 h-7 ${!isFirst && 'opacity-60'}`} alt="WA" />
                                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">S.Telmo</span>
                                  </a>
                              </div>
                          </div>
                       );
                    })}
                </div>
            ) : null}

            {isMoto && !hasSucursales ? (
                <div className="space-y-4">
                    <h2 className="text-xs font-black text-green-500 uppercase tracking-[0.5em] px-2 mb-4">Moto (S / WAZE)</h2>
                    <div className="bg-slate-800/40 backdrop-blur-xl border-t border-green-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] p-8 rounded-[3rem] text-center space-y-6 relative">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Notificar arribo a:</p>
                        <div className="space-y-3">
                            <a href={waNorteLink} target="_blank" rel="noopener noreferrer" className="w-full bg-[#059669] hover:bg-[#059669]/80 text-white py-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-8 h-8" alt="WA" />
                                <span className="text-sm font-black uppercase tracking-[0.2em]">Avisar a Norte</span>
                            </a>
                            <a href={waSanTelmoLink} target="_blank" rel="noopener noreferrer" className="w-full bg-[#059669] hover:bg-[#059669]/80 text-white py-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-8 h-8" alt="WA" />
                                <span className="text-sm font-black uppercase tracking-[0.2em]">Avisar a San Telmo</span>
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                !(hasSucursales) && (
                    <div className="space-y-4 opacity-70 mt-8">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] px-2">Otros</h2>
                        <div className="bg-slate-800/20 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">¿Retornar al HUB?</span>
                            <Link href="/driver/entry" className="bg-[#0f172a] hover:bg-[#1e293b] border border-blue-500/20 text-blue-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            Siguiente Tarea
                            </Link>
                        </div>
                    </div>
                )
            )}

            <div className="pt-8 text-center opacity-40 hover:opacity-100 transition-opacity pb-12">
               <Link href="/driver/entry" className="text-[10px] font-black text-white uppercase tracking-[0.3em] underline decoration-white/20 underline-offset-4">
                  Finalizar Ciclo Táctico
               </Link>
            </div>
        </div>
    </div>
  );
}
