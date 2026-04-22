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

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        const [regRes, configRes] = await Promise.all([
          fetch(`/api/registros/${id}`).then(res => res.json()),
          fetch('/api/config').then(res => res.json())
        ]);
        
        if (regRes.success) setRegistro(regRes.data);
        if (configRes.success) {
          const map = configRes.data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
          setConfig(map);
        }
      } catch (err) {
        console.error("Error fetching success data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <StrategicGearIcon className="w-16 h-16 text-blue-500 animate-spin-slow opacity-20" />
      </div>
    );
  }

  if (!registro) {
    return (
       <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
         <h1 className="text-2xl text-red-500 font-bold mb-4 italic uppercase tracking-tighter">Fallo de Sincronización</h1>
         <Link href="/driver/entry" className="px-10 py-4 bg-blue-600 rounded-2xl font-black uppercase text-xs tracking-widest">Volver al Inicio</Link>
       </div>
    );
  }

  const isMoto = registro.vehiculo?.categoria === "MOTO";
  const driverName = registro.nombreConductor || "";
  const driverBase = DRIVER_BASES[driverName] || "SANTELMO";
  const baseAddress = BASE_ADDRESSES[driverBase];
  const phoneNorte = config["PHONE_NORTE"] || "5491111111111"; // Ajustar si es necesario
  const phoneSanTelmo = config["PHONE_SANTELMO"] || "5491122222222"; 

  const handleReturnToBase = () => {
    const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(baseAddress)}&navigate=yes`;
    window.open(wazeUrl, '_blank');
    // Consolidación táctica: Redirigir al home después de un breve delay
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  const getWaLink = (phone, sucursalNombre) => {
    const msg = `FlotApp te da aviso que el conductor finalizó el viaje a la sucursal ${sucursalNombre || 'Base'}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-blue-500/30 relative font-['Outfit']">
        <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-md w-full space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-1000 mt-4">
            <div className="text-center space-y-2 mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em]">Protocolo v8.4 Cumplido</span>
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none pt-2">Bitácora <span className="text-blue-500">Transmitida</span></h1>
            </div>

            <div className="space-y-6">
                {registro.sucursales?.map((sucursal) => {
                   const address = sucursal.direccion || sucursal.nombre;
                   const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(address + ', Buenos Aires')}&navigate=yes`;
                   
                   return (
                      <div key={sucursal.id} className="bg-slate-900/60 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
                          <div className="flex justify-between items-center mb-6">
                              <p className="font-black text-sm uppercase tracking-widest text-slate-400">Sucursal Destino</p>
                              <span className="text-blue-500 font-mono font-black text-lg">#{sucursal.id}</span>
                          </div>
                          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8 leading-none">{sucursal.nombre}</h3>
                          
                          <div className="grid grid-cols-1 gap-4">
                              {!isMoto && (
                                <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-lg shadow-blue-600/20 group/btn">
                                    <img src="/icons/waze.png" className="w-8 h-8 group-hover:scale-110 transition-transform" alt="Waze" />
                                    <span className="text-sm font-black uppercase tracking-[0.2em]">Cargar Waze</span>
                                </a>
                              )}
                              
                              <div className="grid grid-cols-2 gap-3">
                                  <a href={getWaLink(phoneNorte, sucursal.nombre)} target="_blank" rel="noopener noreferrer" className="bg-[#059669] hover:bg-[#10b981] text-white py-5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border border-white/5">
                                      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6" alt="WA" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Avisar Norte</span>
                                  </a>
                                  <a href={getWaLink(phoneSanTelmo, sucursal.nombre)} target="_blank" rel="noopener noreferrer" className="bg-[#059669] hover:bg-[#10b981] text-white py-5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border border-white/5">
                                      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6" alt="WA" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Avisar S.Telmo</span>
                                  </a>
                              </div>
                          </div>
                      </div>
                   );
                })}
            </div>

            {/* RETORNO A BASE - ULTIMO PASO */}
            <div className="pt-10 border-t border-white/10 mt-10">
                <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/80 backdrop-blur-3xl border-2 border-blue-500/30 p-10 rounded-[4rem] text-center space-y-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                    <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-3 opacity-70 italic">Fin de Itinerario Marcado</p>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Regresar a Base <span className="text-blue-500">{driverBase === 'NORTE' ? 'Florida Oeste' : 'San Telmo'}</span></h2>
                    </div>
                    
                    <button 
                      onClick={handleReturnToBase}
                      className="w-full bg-white text-slate-950 py-8 rounded-[2.5rem] flex items-center justify-center gap-5 transition-all active:scale-95 shadow-2xl group hover:bg-blue-50"
                    >
                        <img src="/icons/waze.png" className="w-10 h-10 group-hover:rotate-12 transition-transform" alt="Waze" />
                        <span className="text-lg font-black uppercase tracking-[0.2em]">Iniciar Retorno</span>
                    </button>
                    
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Base: {baseAddress}</p>
                </div>
            </div>

            <div className="pt-8 text-center opacity-30 hover:opacity-100 transition-opacity pb-12">
               <Link href="/driver/entry" className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-white transition-colors">
                  &larr; Volver al Menú Principal
               </Link>
            </div>
        </div>
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
