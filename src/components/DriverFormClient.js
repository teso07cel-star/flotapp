"use client";
import { useState, useEffect } from "react";
import { createRegistroDiario } from "@/lib/actions";
import { calculateSegment, BASE_LOCATION } from "@/lib/geoUtils";

export default function DriverFormClient({ vehiculo, sucursales, lastLog, identifiedDriver, phase }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workflowState, setWorkflowState] = useState(phase === "INICIO" ? "START_SPLASH" : "ROUTINE");
  const [isFinishingShift, setIsFinishingShift] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("");
  
  // LÓGICA DE IDENTIFICACIÓN TACTICA b4.0.0
  const isSinAsignar = !vehiculo?.patente || vehiculo.patente === "SIN ASIGNAR" || vehiculo.patente === "" || vehiculo.patente === "SCAN";
  const [manualPatente, setManualPatente] = useState("");
  const [isEditingPatente, setIsEditingPatente] = useState(isSinAsignar);

  // Cálculo de KM Teórico dinámico
  const [selectedSucursalIds, setSelectedSucursalIds] = useState([]);
  const [theoreticalKm, setTheoreticalKm] = useState(0);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
        null,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    if (selectedSucursalIds.length > 0) {
      const selectedNodes = sucursales.filter(s => selectedSucursalIds.includes(s.id));
      const lastLoc = lastLog ? { lat: lastLog.lat, lng: lastLog.lng } : BASE_LOCATION;
      const dist = calculateSegment(lastLoc, selectedNodes);
      setTheoreticalKm(dist);
    } else {
      setTheoreticalKm(0);
    }
  }, [selectedSucursalIds, lastLog, sucursales]);

  const handleStartJornada = async () => {
    setLoading(true);
    const res = await createRegistroDiario({
      vehiculoId: vehiculo.id || 0,
      nombreConductor: identifiedDriver,
      tipoReporte: "INICIO",
      kmActual: lastLog?.kmActual || 0,
      lugarGuarda: gpsLocation
    });
    if (res.success) {
      setWorkflowState("ROUTINE");
      window.location.reload(); // Refresh to update session state from server
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.target);
    const data = {
      vehiculoId: vehiculo.id || 0,
      nombreConductor: identifiedDriver || "Conductor",
      // En rutina no se pide KM, se confirma el teórico o se usa el último
      kmActual: isFinishingShift ? formData.get("kmActual") : (lastLog?.kmActual || 0) + theoreticalKm,
      kmModificado: isFinishingShift, 
      sucursalIds: isFinishingShift ? [] : selectedSucursalIds,
      tipoReporte: isFinishingShift ? "CIERRE" : "PARADA",
      newPatente: isEditingPatente ? manualPatente : null,
      lugarGuarda: gpsLocation,
      nivelCombustible: isFinishingShift ? formData.get("nivelCombustible") : null
    };

    if (isFinishingShift && !data.kmActual) {
      setError("El kilometraje final es obligatorio para el cierre.");
      setLoading(false);
      return;
    }

    const res = await createRegistroDiario(data);
    if (res.success) {
       window.location.href = isFinishingShift ? "/driver/entry" : "/driver/form?success=true";
    } else {
       setError(res.error);
       setLoading(false);
    }
  };

  if (workflowState === "START_SPLASH") {
    return (
      <div className="space-y-12 animate-in zoom-in-95 duration-700 pt-10 pb-20 text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse" />
          <div className="bg-slate-900/80 border border-blue-500/30 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 relative z-10">
            <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Iniciar Jornada</h2>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em]">Preparado para el despliegue táctico</p>
        </div>
        <button 
          onClick={handleStartJornada}
          disabled={loading}
          className="w-full py-10 bg-blue-600 text-white rounded-[3rem] font-black uppercase tracking-[0.6em] shadow-[0_0_60px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-xl"
        >
          {loading ? "Sincronizando..." : "Iniciar Ahora"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* CABECERA OPERADOR */}
        <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2rem] border border-white/10">
           <div>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1 leading-none">Operador</p>
              <h2 className="text-xl font-black text-white uppercase leading-none">{identifiedDriver || "Identificando..."}</h2>
           </div>
           <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">En Jornada</span>
           </div>
        </div>

        {/* SECCIÓN UNIDAD */}
        <div className="bg-black/30 p-8 rounded-[2.5rem] border border-white/5">
           {isEditingPatente ? (
             <div className="space-y-4">
               <label className="text-center block text-[10px] font-black uppercase text-amber-500 tracking-[0.3em]">Identificación Unidad</label>
               <input 
                 type="text" 
                 required
                 value={manualPatente} 
                 onChange={(e) => setManualPatente(e.target.value.toUpperCase())}
                 className="w-full bg-[#020617] border-2 border-amber-500/50 rounded-2xl p-6 text-center text-4xl font-mono font-black text-white outline-none"
                 placeholder="PATENTE"
               />
             </div>
           ) : (
             <div className="text-center space-y-4">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Unidad</p>
               <h3 className="text-6xl font-black text-white font-mono tracking-tighter leading-none">{vehiculo.patente}</h3>
               <button type="button" onClick={() => setIsEditingPatente(true)} className="text-[9px] font-black text-blue-500 uppercase border-b border-blue-500/30 pb-0.5">Cambiar</button>
             </div>
           )}
        </div>

        {/* CONTENIDO PRINCIPAL SEGÚN FASE */}
        {!isFinishingShift ? (
          <div className="space-y-8">
             {/* SUCURSALES */}
             <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-2">Seleccionar Nodos de Visita</label>
                <div className="grid grid-cols-2 gap-2">
                   {sucursales.map(s => (
                     <label key={s.id} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/5 transition-all">
                       <input 
                          type="checkbox" 
                          checked={selectedSucursalIds.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedSucursalIds([...selectedSucursalIds, s.id]);
                            else setSelectedSucursalIds(selectedSucursalIds.filter(id => id !== s.id));
                          }}
                          className="w-4 h-4 rounded bg-black border-white/10 text-blue-500" 
                        />
                       <span className="text-[10px] font-black text-slate-300 uppercase truncate">{s.nombre}</span>
                     </label>
                   ))}
                </div>
             </div>

             {/* CONFIRMACIÓN KM TEÓRICO */}
             {theoreticalKm > 0 && (
               <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl text-center animate-in slide-in-from-top-4 duration-500">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Recorrido Estimado (Fórmula Táctica)</p>
                  <h4 className="text-3xl font-black text-white">+{theoreticalKm} <span className="text-sm opacity-50">KM</span></h4>
                  <p className="text-[8px] text-blue-500/60 font-medium uppercase mt-2 italic">*Calculado Base {"->"} Sucursales {"->"} Regreso Base</p>
               </div>
             )}
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
            {/* KM FINAL */}
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
              <label className="text-center block text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Kilometraje Final (Odómetro)</label>
              <input 
                name="kmActual"
                type="number"
                required
                defaultValue={(lastLog?.kmActual || 0)}
                className="w-full bg-black/60 border-2 border-red-500/30 rounded-3xl p-8 text-center text-5xl font-black text-white outline-none focus:border-red-500"
                placeholder="000000"
              />
            </div>

            {/* COMBUSTIBLE */}
            <div className="bg-amber-500/5 p-8 rounded-[2.5rem] border border-amber-500/10 space-y-6">
              <label className="text-center block text-[10px] font-black uppercase text-amber-500 tracking-[0.3em]">Nivel de Combustible</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {["LLENO", "3/4", "1/2", "1/4", "BAJO"].map((val) => (
                  <label key={val} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/10 cursor-pointer hover:bg-amber-500/10 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/20 transition-all group">
                    <input type="radio" name="nivelCombustible" value={val} required className="hidden" />
                    <span className="text-[10px] font-black text-slate-400 group-has-[:checked]:text-white uppercase">{val}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACCIÓN PRINCIPAL */}
        <div className="space-y-4 pt-4">
           {loading ? (
             <div className="w-full py-8 text-center bg-slate-900 rounded-[2.5rem] text-blue-500 font-black uppercase tracking-widest animate-pulse">Sincronizando...</div>
           ) : (
             <button 
                type="submit" 
                className={`w-full py-8 text-white rounded-[2.5rem] font-black uppercase tracking-[0.6em] transition-all shadow-2xl ${
                  isFinishingShift ? "bg-red-600 shadow-red-600/30 hover:bg-red-500" : "bg-blue-600 shadow-blue-600/30 hover:scale-[1.02]"
                }`}
              >
               {isFinishingShift ? "Cerrar Jornada" : "Confirmar Reporte"}
             </button>
           )}
           
           {!isFinishingShift && (
             <button type="button" onClick={() => setIsFinishingShift(true)} className="w-full py-4 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:text-red-500/50 transition-colors">Finalizar Jornada</button>
           )}
           {isFinishingShift && (
             <button type="button" onClick={() => setIsFinishingShift(false)} className="w-full py-4 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:text-blue-500 transition-colors">Volver a Bitácora</button>
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
