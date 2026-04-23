"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StrategicGearIcon } from "@/components/FuturisticIcons";
import { DRIVER_BASES, BASE_ADDRESSES } from "@/lib/constants";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  
  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({});
  const [showBaseReturn, setShowBaseReturn] = useState(false);

  useEffect(() => {
    if (!id) {
       setLoading(false);
       return;
    }
    
    const fetchData = async () => {
      try {
        const [regRes, configRes] = await Promise.all([
          fetch(`/api/registros/${id}`).then(res => res.json()),
          fetch('/api/config').then(res => res.json())
        ]);
        
        if (regRes.success) {
          setRegistro(regRes.data);
        } else {
          // BLINDAJE v8.4.2: Fallback táctico si la API falla
          console.warn("⚠️ API FALLBACK ACTIVATED");
          setRegistro({
            id: id,
            nombreConductor: "CONDUCTOR",
            sucursales: []
          });
        }
        if (configRes.success) {
          const map = configRes.data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
          setConfig(map);
        }
      } catch (err) {
        console.error("Error fetching success data:", err);
        // EMERGENCIA TACTICA
        setRegistro({ id: id, nombreConductor: "SISTEMA", sucursales: [] });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <StrategicGearIcon className="w-24 h-24 text-blue-500 animate-spin-slow opacity-20" />
      </div>
    );
  }

  if (!registro) {
    return (
       <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
         <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <span className="text-3xl">⚠️</span>
         </div>
         <h1 className="text-2xl text-red-500 font-black mb-4 italic uppercase tracking-tighter">Fallo de Sincronización</h1>
         <p className="text-slate-500 text-xs mb-8 uppercase tracking-widest font-bold">No se encontró el registro de la parada.</p>
         <Link href="/driver/entry" className="px-10 py-5 bg-blue-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-600/30">Volver al Inicio</Link>
       </div>
    );
  }

  const driverName = registro.nombreConductor || "";
  const driverBase = DRIVER_BASES[driverName] || "SANTELMO";
  const baseAddress = BASE_ADDRESSES[driverBase];
  const phoneNorte = config["PHONE_NORTE"] || "5491180591342";
  const phoneSanTelmo = config["PHONE_SANTELMO"] || "5491128620002"; 

  const handleReturnToBase = () => {
    const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(baseAddress)}&navigate=yes`;
    window.open(wazeUrl, '_blank');
    // Redirigir al inicio después de que el conductor inicie el retorno
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  const getWaLink = (phone, sucursalNombre) => {
    const msg = `FlotApp: El conductor ${driverName} finalizó el viaje a la sucursal ${sucursalNombre || 'Base'}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const sucursalesArr = registro.sucursales || [];

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-blue-500/30 relative font-['Outfit']">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/4 w-[50rem] h-[50rem] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-md w-full space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-8 mb-20">
            <div className="text-center space-y-3 mb-12">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full shadow-inner">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Logística Activa v9.5</span>
                </div>
                <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none pt-4 drop-shadow-2xl">
                  Guía de <span className="text-blue-500">Ruta</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.6em] italic">Protocolo de Asistencia al Conductor</p>
            </div>

            <div className="space-y-8">
                {sucursalesArr.length > 0 ? (
                  sucursalesArr.map((sucursal) => {
                    const address = sucursal.direccion || sucursal.nombre;
                    const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(address + ', Buenos Aires')}&navigate=yes`;
                    
                    return (
                       <div key={sucursal.id} className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[3.5rem] shadow-3xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-700">
                           <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           
                           <div className="flex justify-between items-center mb-8 relative z-10">
                               <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 uppercase text-[8px] font-black tracking-widest text-slate-400">Punto de Control</div>
                               <span className="text-blue-500 font-mono font-black text-xl italic leading-none">#{sucursal.id}</span>
                           </div>
                           
                           <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-10 leading-none relative z-10">{sucursal.nombre}</h3>
                           
                           <div className="grid grid-cols-1 gap-5 relative z-10">
                                <a href={wazeUrl} target="_blank" rel="noopener noreferrer" 
                                   className="relative group/btn bg-white text-slate-950 py-7 rounded-[2rem] flex items-center justify-center gap-5 transition-all active:scale-95 shadow-2xl overflow-hidden hover:pr-8">
                                    <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                                    <img src="/icons/waze.png" className="w-10 h-10 group-hover/btn:rotate-12 transition-transform relative z-10" alt="Waze" />
                                    <span className="text-sm font-black uppercase tracking-[0.2em] relative z-10 group-hover/btn:text-white">Navegar con Waze</span>
                                </a>
                               
                               <div className="grid grid-cols-2 gap-4">
                                   <a href={getWaLink(phoneNorte, sucursal.nombre)} target="_blank" rel="noopener noreferrer" 
                                      className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 text-emerald-400 py-5 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group/wa">
                                       <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5 opacity-70 group-hover/wa:opacity-100 group-hover/wa:scale-110 transition-all" alt="WA" />
                                       <span className="text-[9px] font-black uppercase tracking-widest">Avisar Norte</span>
                                   </a>
                                   <a href={getWaLink(phoneSanTelmo, sucursal.nombre)} target="_blank" rel="noopener noreferrer" 
                                      className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 text-emerald-400 py-5 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group/wa">
                                       <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5 opacity-70 group-hover/wa:opacity-100 group-hover/wa:scale-110 transition-all" alt="WA" />
                                       <span className="text-[9px] font-black uppercase tracking-widest">Avisar S. Telmo</span>
                                   </a>
                               </div>
                           </div>
                       </div>
                    );
                  })
                ) : (
                  <div className="bg-slate-900/40 p-12 rounded-[3.5rem] border border-white/5 text-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sin sucursales marcadas en este reporte.</p>
                  </div>
                )}
            </div>

            {/* RETORNO A BASE */}
            {!showBaseReturn ? (
               <button 
                 onClick={() => setShowBaseReturn(true)}
                 className="w-full py-8 border-2 border-dashed border-blue-500/20 hover:border-blue-500/50 rounded-[3rem] text-blue-500/60 hover:text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] transition-all animate-in zoom-in duration-500"
               >
                 Terminar Itinerario &rarr;
               </button>
            ) : (
              <div className="pt-6 animate-in slide-in-from-bottom-10 duration-1000">
                  <div className="bg-gradient-to-br from-blue-700/20 to-slate-900/80 backdrop-blur-3xl border-2 border-blue-500/30 p-10 rounded-[4rem] text-center space-y-10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <StrategicGearIcon className="w-32 h-32 text-white animate-spin-slow" />
                      </div>
                      
                      <div className="relative z-10">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.6em] mb-4 opacity-70 italic font-mono">Consolidado Táctico</p>
                          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Regresar a <br/><span className="text-blue-500">Base {driverBase}</span></h2>
                      </div>
                      
                      <button 
                        onClick={handleReturnToBase}
                        className="relative w-full bg-blue-600 hover:bg-blue-500 text-white py-9 rounded-[2.5rem] flex items-center justify-center gap-6 transition-all active:scale-95 shadow-3xl shadow-blue-500/40 group/return overflow-hidden"
                      >
                          <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/return:translate-x-0 transition-transform duration-700"></div>
                          <img src="/icons/waze.png" className="w-12 h-12 group-hover/return:scale-110 transition-transform relative z-10" alt="Waze" />
                          <span className="text-xl font-black uppercase tracking-[0.2em] relative z-10">Iniciar Retorno</span>
                      </button>
                      
                      <div className="space-y-1 relative z-10">
                         <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Base de Operaciones</p>
                         <p className="text-[10px] text-blue-300/60 font-black uppercase tracking-tight">{baseAddress}</p>
                      </div>
                      
                      <button onClick={() => router.push("/")} className="text-[9px] text-slate-600 uppercase font-black tracking-widest hover:text-white transition-colors relative z-10">
                        Omitir y Volver al Menú
                      </button>
                  </div>
              </div>
            )}

            <div className="text-center opacity-20 hover:opacity-100 transition-opacity pb-12">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em] block mb-2">FlotApp Tactical Division</span>
               <div className="w-12 h-[1px] bg-white/10 mx-auto"></div>
            </div>
        </div>

        <style jsx>{`
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin-slow {
                animation: spin-slow 12s linear infinite;
            }
        `}</style>
    </div>
  );
}

export default function DriverSuccess() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
