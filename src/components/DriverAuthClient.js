"use client";
import { useState, useEffect } from "react";
import { StrategicGearIcon } from "./FuturisticIcons";
import { bindDriverToDevice } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function DriverAuthClient({ choferes, isDeviceAuthorized, initialDriverName }) {
  const router = useRouter();
  const [selectedChofer, setSelectedChofer] = useState(initialDriverName || "");
  const [loading, setLoading] = useState(false);
  const [idGps, setIdGps] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setIdGps(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
        null,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleSelect = async (e) => {
    const val = e.target.value;
    if (!val) return;
    
    setLoading(true);
    setSelectedChofer(val);

    // LÓGICA DE EMERGENCIA: Identificación inmediata
    try {
      const devId = localStorage.getItem("flotapp_device_id");
      await bindDriverToDevice(val, devId);
      
      // REGISTRAR INICIO DE JORNADA (Punto 0)
      const { createRegistroDiario } = await import("@/lib/actions");
      await createRegistroDiario({
          nombreConductor: val,
          tipoReporte: "INICIO_JORNADA",
          lugarGuarda: idGps || "GPS TEMPORAL"
      });

      // SET COOKIE AND STORAGE
      document.cookie = `driver_name=${encodeURIComponent(val)}; path=/; max-age=31536000`;
      localStorage.setItem("flotapp_driver_name", val);
      
      // REDIRECCIÓN DIRECTA A FORMULARIO (Evitando el Home para ganar tiempo)
      let target = "/driver/form";
      if (val.toLowerCase().includes("brian") || val.toLowerCase().includes("lopez")) {
         target = "/driver/form?patente=AD848KR";
      }
      
      window.location.href = target;
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in duration-1000">
      
      <div className="text-center">
         <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Acceso <span className="text-blue-500">Express</span></h1>
         <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Protocolo Táctico de Emergencia (v3.0.5)</p>
      </div>

      <div className="glass-panel p-8 rounded-[3rem] border border-white/5 relative overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
             <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest">Sincronizando Identidad...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Selecciona tu Nombre</label>
            <select
              value={selectedChofer}
              onChange={handleSelect}
              className="w-full bg-[#020617] border-2 border-blue-500/20 rounded-2xl px-6 py-5 text-white outline-none focus:border-blue-500 transition-all font-black uppercase tracking-widest text-sm appearance-none cursor-pointer text-center"
            >
              <option value="">-- ELIGE TU NOMBRE --</option>
              {choferes.map((c) => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
            <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest mt-4">Redirección automática al seleccionar</p>
          </div>
        )}
      </div>

      <div className="flex justify-center flex-col items-center gap-2">
         <div className="h-1 w-32 bg-blue-500/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-full animate-pulse" />
         </div>
         <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Sistema Blindado v3.0.5</span>
      </div>

    </div>
  );
}
