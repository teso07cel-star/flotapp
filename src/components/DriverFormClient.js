"use client";
import { useState, useEffect } from "react";
import { createRegistroDiario } from "@/lib/actions";

export default function DriverFormClient({ vehiculo, sucursales, lastLog, identifiedDriver, phase }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFinishingShift, setIsFinishingShift] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("");

  // LÓGICA ULTRA-SIMPLIFICADA v3.0.9
  const isSinAsignar = !vehiculo?.patente || vehiculo.patente === "SIN ASIGNAR" || vehiculo.patente === "" || vehiculo.patente === "SCAN";
  const [manualPatente, setManualPatente] = useState(identifiedDriver?.toLowerCase().includes("brian") && isSinAsignar ? "AD848KR" : "");
  const [isEditingPatente, setIsEditingPatente] = useState(isSinAsignar);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
        null,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.target);
    const data = {
      vehiculoId: vehiculo.id || 0,
      nombreConductor: identifiedDriver || "Conductor",
      kmActual: formData.get("kmActual"),
      kmModificado: true, 
      sucursalIds: isFinishingShift ? [] : formData.getAll("sucursalIds").map(id => parseInt(id)),
      tipoReporte: isFinishingShift ? "CIERRE" : (phase === "INICIO" ? "INICIO" : "PARADA"),
      newPatente: isEditingPatente ? manualPatente : null,
      lugarGuarda: gpsLocation
    };

    if (!data.kmActual) {
      setError("El kilometraje es obligatorio.");
      setLoading(false);
      return;
    }

    const res = await createRegistroDiario(data);
    if (res.success) {
       window.location.href = isFinishingShift ? "/driver/entry" : "/?success=true";
    } else {
       setError(res.error);
       setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* CABECERA OPERADOR */}
        <div className="text-center bg-white/5 p-6 rounded-[2rem] border border-white/10">
           <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Operador Verificado</p>
           <h2 className="text-2xl font-black text-white uppercase">{identifiedDriver || "Identificando..."}</h2>
        </div>

        {/* SECCIÓN UNIDAD - SIEMPRE EDITABLE SI ES 'SIN ASIGNAR' */}
        <div className="bg-black/30 p-8 rounded-[2.5rem] border border-white/5">
           {isEditingPatente ? (
             <div className="space-y-4">
               <label className="text-center block text-[10px] font-black uppercase text-amber-500 tracking-[0.3em]">Identificación Manual de Unidad</label>
               <input 
                 type="text" 
                 required
                 value={manualPatente} 
                 onChange={(e) => setManualPatente(e.target.value.toUpperCase())}
                 className="w-full bg-[#020617] border-2 border-amber-500/50 rounded-2xl p-6 text-center text-4xl font-mono font-black text-white outline-none"
                 placeholder="PATENTE"
               />
               <p className="text-[9px] text-amber-500/50 text-center uppercase font-bold">Escribe 'AD848KR' si no aparece automáticamente</p>
             </div>
           ) : (
             <div className="text-center space-y-4">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Unidad Detectada</p>
               <h3 className="text-6xl font-black text-white font-mono tracking-tighter">{vehiculo.patente}</h3>
               <button type="button" onClick={() => setIsEditingPatente(true)} className="text-[9px] font-black text-blue-500 uppercase border-b border-blue-500/30 pb-1">Cambiar Unidad</button>
             </div>
           )}
        </div>

        {/* SECCIÓN KM */}
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
           <label className="text-center block text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Kilometraje Actual (Odómetro)</label>
           <input 
             name="kmActual"
             type="number"
             required
             defaultValue={lastLog?.kmActual || ""}
             className="w-full bg-black/60 border-2 border-blue-500/30 rounded-3xl p-8 text-center text-5xl font-black text-white outline-none focus:border-blue-500"
             placeholder="000000"
           />
        </div>

        {/* SECCIÓN SUCURSALES (Contextual) */}
        {!isFinishingShift && (
          <div className="space-y-4">
             <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-2">Nodos Visitados</label>
             <div className="grid grid-cols-2 gap-2">
                {sucursales.slice(0, 4).map(s => (
                  <label key={s.id} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/5 transition-all">
                    <input type="checkbox" name="sucursalIds" value={s.id} className="w-4 h-4 rounded bg-black border-white/10 text-blue-500" />
                    <span className="text-[10px] font-black text-slate-300 uppercase truncate">{s.nombre}</span>
                  </label>
                ))}
             </div>
          </div>
        )}

        {/* ACCIÓN PRINCIPAL */}
        <div className="space-y-4 pt-4">
           {loading ? (
             <div className="w-full py-8 text-center bg-slate-900 rounded-[2.5rem] text-blue-500 font-black uppercase tracking-widest animate-pulse">Sincronizando...</div>
           ) : (
             <button type="submit" className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.6em] shadow-[0_0_50px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
               {isFinishingShift ? "Confirmar Cierre" : "Confirmar Reporte"}
             </button>
           )}
           
           {!isFinishingShift && phase === "RITMO" && (
             <button type="button" onClick={() => setIsFinishingShift(true)} className="w-full py-4 text-slate-600 font-black uppercase text-[9px] tracking-widest hover:text-slate-400">Finalizar Jornada</button>
           )}
           {isFinishingShift && (
             <button type="button" onClick={() => setIsFinishingShift(false)} className="w-full py-4 text-slate-600 font-black uppercase text-[9px] tracking-widest hover:text-slate-400">Volver</button>
           )}
        </div>

      </form>

      {error && (
        <div className="fixed bottom-10 left-6 right-6 p-5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-2xl animate-bounce z-[100]">
          {error}
        </div>
      )}

    </div>
  );
}
