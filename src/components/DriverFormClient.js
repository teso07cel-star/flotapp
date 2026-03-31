"use client";
import { useState, useEffect } from "react";
import { createRegistroDiario } from "@/lib/actions";

export default function DriverFormClient({ vehiculo, sucursales, lastLog, identifiedDriver, isFirstLog }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [isFinishingShift, setIsFinishingShift] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  // Capturamos el GPS al cargar el componente
  useEffect(() => {
    if ("geolocation" in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setGpsLocation(`${lat}, ${lng}`);
          setGpsLoading(false);
        },
        (err) => {
          console.error("Error GPS:", err);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.target;
    const formData = new FormData(form);
    
    // Detectamos si el KM fue modificado manualmente comparado con el sugerido
    const inputKm = formData.get("kmActual");
    const suggestedKm = lastLog?.kmActual;
    const kmModificado = inputKm && suggestedKm && parseInt(inputKm) !== parseInt(suggestedKm);

    const data = {
      vehiculoId: vehiculo.id,
      nombreConductor: identifiedDriver || lastLog?.nombreConductor || "Conductor",
      kmActual: inputKm,
      kmModificado: kmModificado,
      nivelCombustible: formData.get("nivelCombustible"),
      motivoUso: formData.get("motivoUso"),
      novedades: formData.get("novedades"),
      sucursalIds: isFirstLog || isFinishingShift ? [] : formData.getAll("sucursalIds").map(id => parseInt(id)),
      authCode: authCode,
      tipoReporte: isFirstLog ? "INICIO" : (isFinishingShift ? "CIERRE" : "PARADA"),
      lugarGuarda: gpsLocation // Enviamos las coordenadas aquí
    };

    // Validaciones básicas: KM solo obligatorio en inicio y cierre
    if ((isFirstLog || isFinishingShift) && !data.kmActual) {
      setError("El kilometraje es obligatorio.");
      setLoading(false);
      return;
    }

    const res = await createRegistroDiario(data);

    if (res.success) {
      window.location.href = "/?success=true";
    } else {
      if (res.error === "MILEAGE_AUTH_REQUIRED") {
        setShowAuth(true);
        setError("El kilometraje ingresado requiere autorización administrativa.");
      } else {
        setError("Error: " + res.error);
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* OVERLAY EXPLICATIVO PARA EL VIDEO */}
      <div className="bg-blue-600/20 border border-blue-500/50 backdrop-blur-md p-4 rounded-2xl mb-6 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
        <h4 className="text-blue-400 font-black tracking-widest text-xs uppercase mb-1">
          {isFirstLog ? "Tutorial 1/3: Inicio de Turno" : (isFinishingShift ? "Tutorial 3/3: Cierre de Turno" : "Tutorial 2/3: Flash Entry")}
        </h4>
        <p className="text-white text-sm font-medium">
          {isFirstLog ? "Registrá el kilometraje inicial, tanque y novedades. Paso indispensable para comenzar." : 
          (isFinishingShift ? "Ingresá el kilometraje final y observaciones para cerrar la jornada." : 
          "Registro rápido (Flash Entry) al visitar una nueva sucursal o parada.")}
        </p>
      </div>

      {/* Header Info - Conductor Identificado */}
      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-[2rem] shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500 shadow-inner">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <div>
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest leading-none mb-1">Operador Logístico</p>
            <p className="text-white font-bold tracking-tight">{identifiedDriver || lastLog?.nombreConductor || "Invitado"}</p>
          </div>
        </div>
        <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
           <span className="text-[10px] font-black tracking-widest uppercase text-blue-400">{vehiculo.patente}</span>
        </div>
      </div>

      {/* GPS INDICATOR */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-950/50 rounded-2xl border border-white/5 w-fit mx-auto animate-in fade-in duration-1000">
        <div className={`h-2 w-2 rounded-full ${gpsLocation ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : (gpsLoading ? 'bg-amber-500 animate-ping' : 'bg-red-500')}`} />
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
          {gpsLocation ? `Localización Activa: ${gpsLocation}` : (gpsLoading ? 'Buscando Señal GPS...' : 'GPS No Disponible')}
        </span>
      </div>

      {error && !showAuth && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-wider text-center animate-bounce">
          {error}
        </div>
      )}

      {/* 1. INICIO DE JORNADA: Solo se muestra en el primer log del día */}
      {isFirstLog && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="p-5 bg-blue-600/10 border border-blue-600/20 rounded-3xl">
             <p className="text-blue-500 font-black uppercase tracking-widest text-[10px] mb-1">Primer Inicio del Día</p>
             <h3 className="text-white font-bold text-lg leading-tight text-balance">Comenzando jornada con la unidad {vehiculo.patente}.</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-gray-500 pl-1 tracking-widest text-center">Kilometraje Actual</label>
              <div className="relative group">
                <input
                  name="kmActual"
                  type="number"
                  required
                  defaultValue={lastLog?.kmActual || ""}
                  className="w-full bg-gray-950 text-center border-2 border-white/5 rounded-2xl px-5 py-5 text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-black text-3xl"
                  placeholder="000000"
                />
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-blue-500 font-black text-xs uppercase tracking-widest">km</div>
              </div>
              <p className="text-[9px] text-gray-500 font-bold text-center uppercase tracking-widest italic mt-2">Último registro: {lastLog?.kmActual?.toLocaleString()} km</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. JORNADA ACTIVA / RE-INGRESOS RÁPIDOS */}
      {!isFirstLog && !isFinishingShift && (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex flex-col gap-6 relative overflow-hidden group backdrop-blur-md">
             <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner shadow-emerald-500/40 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                </div>
                <div>
                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1.5 font-sans">Turno Reconocido</p>
                  <p className="text-white text-xl font-black tracking-tight uppercase">Segundo Viaje / Parada</p>
                  <p className="text-gray-500 text-[9px] font-black uppercase mt-1 tracking-widest">
                    Unidad {vehiculo.patente} • {lastLog?.kmActual?.toLocaleString()} km
                  </p>
                </div>
             </div>
             
             <div className="flex gap-3 relative z-10">
               <div className="flex-1 p-3 bg-gray-950/50 rounded-2xl border border-white/5">
                 <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Última actividad</p>
                 <p className="text-emerald-500 text-xs font-black uppercase">{new Date(lastLog?.fecha).toLocaleTimeString("es-AR", {hour: '2-digit', minute:'2-digit'})} hs</p>
               </div>
               <button
                 type="button"
                 onClick={() => setIsFinishingShift(true)}
                 className="flex-[1.5] bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                 <span>Finalizar Turno</span>
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
               </button>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end px-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] font-sans">Sucursales Visitadas</label>
              <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded-full border border-blue-500/10 italic">Reporte de Parada</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar p-1">
              {sucursales.map(s => (
                <label
                  key={s.id}
                  className="flex items-center gap-4 p-5 rounded-[1.8rem] border border-white/5 bg-gray-900/40 hover:bg-gray-800/60 hover:border-blue-500/30 transition-all cursor-pointer group/item relative overflow-hidden"
                >
                  <div className="relative flex items-center justify-center z-10">
                    <input 
                      type="checkbox" 
                      name="sucursalIds" 
                      value={s.id}
                      className="w-6 h-6 rounded-lg border-2 border-gray-700 bg-gray-950 text-blue-600 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div className="flex-1 z-10">
                    <div className="text-[11px] font-black text-gray-300 group-hover/item:text-blue-400 transition-colors uppercase tracking-tight leading-none mb-1">{s.nombre}</div>
                    <div className="text-[9px] text-gray-600 font-bold truncate uppercase tracking-tighter">{s.direccion}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. FINALIZAR DÍA: Resumen de cierre */}
      {isFinishingShift && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="p-6 bg-pink-600/10 border border-pink-600/20 rounded-[2.5rem] backdrop-blur-xl">
             <div className="flex justify-between items-start mb-3">
                <p className="text-pink-500 font-black uppercase tracking-[0.2em] text-[10px]">Cierre del Turno Diario</p>
                <button type="button" onClick={() => setIsFinishingShift(false)} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all">Cancelar</button>
             </div>
             <h3 className="text-white font-black text-xl leading-tight uppercase tracking-tight">Cerrando jornada para {vehiculo.patente}.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-gray-500 pl-1 tracking-widest">Kilometraje Final</label>
              <div className="relative group">
                <input
                  name="kmActual"
                  type="number"
                  required
                  className="w-full bg-gray-950 text-center border-2 border-pink-500/20 rounded-2xl px-5 py-5 text-white focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-black text-3xl"
                  placeholder="000000"
                />
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-pink-500 font-black text-xs uppercase tracking-widest">km</div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase text-gray-500 pl-1 tracking-widest">Marcar Nivel Combustible</label>
              <div className="grid grid-cols-5 gap-1 p-1 bg-gray-950 rounded-2xl border-2 border-white/5">
                {["LLENO", "3/4", "1/2", "1/4", "RESERVA"].map((val, idx) => (
                  <label key={val} className="cursor-pointer relative flex flex-col items-center group">
                    <input type="radio" name="nivelCombustible" value={val} defaultChecked={idx===0} className="peer sr-only" required />
                    <div className="w-full text-center py-5 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-tighter text-gray-500 peer-checked:bg-pink-600 peer-checked:text-white peer-checked:shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all">
                      {val}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* AUTH CODE MODAL */}
      {showAuth && (
        <div className="space-y-4 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="text-center">
            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Código de Autorización</label>
            <p className="text-[11px] text-amber-500/70 font-bold uppercase mt-1">Variación inusual detectada</p>
          </div>
          <input
            type="text"
            required
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            className="w-full bg-gray-950 border-2 border-amber-500/40 rounded-2xl px-5 py-5 text-white font-mono text-4xl tracking-[0.5em] text-center focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder:text-gray-900"
            placeholder="0000"
            maxLength={4}
          />
          <p className="text-[9px] text-amber-500/50 font-bold text-center uppercase tracking-widest mt-2">
            Pedile el código al administrador para validar.
          </p>
        </div>
      )}

      {/* OBSERVACIONES: Visible en Inicio y Cierre de turno */}
      {(isFirstLog || isFinishingShift) && (
        <div className="space-y-3 animate-in fade-in duration-700">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">¿Alguna Novedad u Observación?</label>
          <textarea
            name="novedades"
            rows={2}
            disabled={loading}
            className="w-full bg-gray-950/50 border-2 border-white/5 rounded-[1.5rem] px-5 py-4 text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-800 text-sm font-medium"
            placeholder="Escribí aquí si pasó algo o hay algún aviso..."
          />
        </div>
      )}

      {/* BOTÓN DE ACCIÓN DINÁMICO */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-6 px-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl flex justify-center items-center gap-4 active:scale-[0.97] disabled:opacity-50 
            ${isFinishingShift ? 'bg-gradient-to-r from-pink-600 to-rose-600 shadow-pink-500/30' : 
              (isFirstLog ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30' : 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/30')} 
            text-white hover:brightness-110`}
        >
          {loading ? (
            <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="relative top-[1px]">
                {isFirstLog ? "Registrar Inicio" : (isFinishingShift ? "Finalizar Turno" : "Confirmar Paradas")}
              </span>
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
