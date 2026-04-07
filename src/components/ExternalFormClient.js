"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitExternalLog } from "@/lib/externalActions";

export default function ExternalFormClient({ vehiculo, requiredFrequency, lastMonthly, driverName, needsFullMonthly }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmPreviousPhotos, setConfirmPreviousPhotos] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  // Al montar, intentamos obtener el GPS
  useEffect(() => {
    if ("geolocation" in navigator) {
      setTimeout(() => setGpsLoading(true), 0);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setGpsLocation(`${lat}, ${lng}`);
          setGpsLoading(false);
        },
        (error) => {
          console.error("Error obteniendo GPS:", error);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const [formData, setFormData] = useState({
    kmActual: "",
    vtvVencimiento: "",
    seguroVencimiento: "",
    lugarGuarda: "fija",
    lugarGuardaDetalle: "",
    recargaCombustible: "no",
    nivelCombustible: "LLENO",
    montoCombustible: "",
    motivoUso: "reparto",
    novedades: ""
  });

  useEffect(() => {
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        vtvVencimiento: vehiculo.vtvVencimiento ? new Date(vehiculo.vtvVencimiento).toISOString().split('T')[0] : "",
        seguroVencimiento: vehiculo.seguroVencimiento ? new Date(vehiculo.seguroVencimiento).toISOString().split('T')[0] : ""
      }));
    }, 0);
  }, [vehiculo.vtvVencimiento, vehiculo.seguroVencimiento]);

  const [photos, setPhotos] = useState({
    frente: null, trasera: null, latIzq: null, latDer: null, vtv: null, seguro: null, ticket: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = (name, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotos(prev => ({ ...prev, [name]: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    if (step === 1) {
      if (requiredFrequency === "mensual" || requiredFrequency === "semanal") {
        if (!formData.kmActual) return "El kilometraje es obligatorio.";
      }
      return null;
    }
    if (step === 2 && requiredFrequency === "mensual" && !confirmPreviousPhotos) {
       // Removido requerimiento obligatorio para evitar bloqueos en zonas de baja señal o pruebas
       // if (!photos.frente || !photos.trasera || !photos.latIzq || !photos.latDer) return "Faltan fotografías del vehículo.";
       return null;
    }
    if (step === 3 && requiredFrequency === "mensual" && !confirmPreviousPhotos) {
       if (!formData.vtvVencimiento || !formData.seguroVencimiento) return "Las fechas son obligatorias.";
       return null;
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    
    // Jump logic
    if (step === 1) {
      if (requiredFrequency === "mensual") {
          if (confirmPreviousPhotos) setStep(4);
          else setStep(2);
      } else if (requiredFrequency === "semanal" || requiredFrequency === "diario_cierre") {
          setStep(4);
      } else {
          setStep(5);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const prevStep = () => {
    setError(null);
    if (step === 5) {
      if (requiredFrequency === "diario_inicio") setStep(1);
      else setStep(4);
    } else if (step === 4) {
      if (requiredFrequency === "mensual" && !confirmPreviousPhotos) setStep(3);
      else setStep(1);
    } else {
      setStep(s => s - 1);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        vehiculoId: vehiculo.id,
        driver: driverName,
        requiredFrequency,
        confirmPreviousPhotos,
        gpsLocation,
        ...formData,
        ...photos
      };

      const result = await submitExternalLog(payload);
      if (result.success) {
        window.location.href = "/?success=true";
      } else {
        setError(result.error);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "Error al enviar");
      setLoading(false);
    }
  };

  const isDiarioInicio = requiredFrequency === "diario_inicio";

  return (
    <div className="max-w-md w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Info */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
            {requiredFrequency === "mensual" ? "Auditoría Mensual" : 
             (requiredFrequency === "semanal" ? "Auditoría Semanal" : 
             (requiredFrequency === "diario_inicio" ? "Ingreso Diario" : "Cierre de Jornada"))}
          </h2>
          <p className="text-[10px] text-pink-500 font-bold uppercase tracking-widest leading-none">Proveedor Logístico</p>
        </div>
        {!isDiarioInicio && (
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Estado</p>
            <div className="flex gap-1 justify-end">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1.5 w-6 rounded-full ${step === i ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]' : (step > i ? 'bg-pink-900/50' : 'bg-gray-800')}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
           <svg className="w-24 h-24 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        </div>

        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg z-50 animate-bounce">
            {error}
          </div>
        )}

        {/* GPS INDICATOR (Pequeño, premium) */}
        {!isDiarioInicio && (
          <div className="mb-6 flex items-center gap-2 px-3 py-2 bg-gray-950/50 rounded-xl border border-white/5 w-fit">
            <div className={`h-2 w-2 rounded-full ${gpsLocation ? 'bg-emerald-500 animate-pulse' : (gpsLoading ? 'bg-amber-500 animate-ping' : 'bg-red-500')}`} />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              {gpsLocation ? `GPS: ${gpsLocation}` : (gpsLoading ? 'Buscando Satélite...' : 'GPS Deshabilitado')}
            </span>
          </div>
        )}

        {/* FLUJO DIARIO INICIO: Un solo clic */}
        {isDiarioInicio && (
          <div className="space-y-8 py-4 animate-in zoom-in-95 duration-500">
             <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center text-pink-500 mx-auto shadow-inner shadow-pink-500/10 border border-pink-500/20 relative">

                   <svg className="w-12 h-12 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 20c4.33 0 8.058-2.73 9.473-6.571M12 4c4.33 0 8.058 2.73 9.473 6.571M12 4C8.667 4 5.333 4 2 4m10 0v16" /></svg>
                </div>
                <div className="space-y-1">
                   <p className="text-pink-400 font-black uppercase tracking-[0.2em] text-[11px]">Control de Ingreso</p>
                   <h3 className="text-white text-2xl font-black uppercase tracking-tight">Bienvenido, {driverName}</h3>
                   <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Unidad {vehiculo.patente.toUpperCase()} • {new Date().toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}</p>
                </div>
             </div>
             
             <div className="p-4 bg-gray-950/50 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
                   <span>Estado GPS</span>
                   <span className={gpsLocation ? "text-emerald-500" : "text-amber-500"}>{gpsLocation ? "Conectado" : "Buscando..."}</span>
                </div>
                <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                   <div className={`h-full bg-pink-500 transition-all duration-1000 ${gpsLocation ? 'w-full' : 'w-1/3 animate-pulse'}`} />
                </div>
             </div>

             <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={loading || gpsLoading}
                className="group w-full relative h-16 bg-white text-black font-black uppercase tracking-[0.3em] text-xs rounded-2xl overflow-hidden active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] disabled:opacity-50"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                   {loading ? <div className="h-5 w-5 border-4 border-black/20 border-t-black rounded-full animate-spin" /> : "Confirmar Ingreso"}
                   {!loading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                </span>
             </button>
          </div>
        )}

        {/* PASO 1: KM o Login Cierre */}
        {!isDiarioInicio && step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            {requiredFrequency === "mensual" && needsFullMonthly && lastMonthly && !confirmPreviousPhotos && (
              <div className="p-5 bg-pink-500/10 border border-pink-500/20 rounded-3xl space-y-4">
                <div className="flex gap-3 items-center">
                   <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   </div>
                   <h4 className="text-white font-black text-xs uppercase tracking-tight leading-tight">¿El vehículo no tuvo cambios visuales?</h4>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    type="button" 
                    onClick={() => { setConfirmPreviousPhotos(true); setStep(1); }}
                    className="w-full py-3 bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-pink-500 transition-all"
                  >
                    Sí, usar fotos anteriores
                  </button>
                  <p className="text-[8px] text-pink-500/60 text-center font-black uppercase tracking-widest">Última inspección: {new Date(lastMonthly.fecha).toLocaleDateString("es-AR")}</p>
                </div>
              </div>
            )}

            {(requiredFrequency === "mensual" || requiredFrequency === "semanal" || requiredFrequency === "diario_cierre") ? (
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase text-gray-500 pl-1 tracking-widest">Kilometraje Actual</label>
                <div className="relative group">
                  <input
                    name="kmActual"
                    type="number"
                    value={formData.kmActual}
                    onChange={handleInputChange}
                    className="w-full bg-gray-950 text-center border-2 border-white/5 rounded-2xl px-5 py-6 text-white focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-black text-3xl"
                    placeholder="000000"
                  />
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-pink-500 font-black text-xs uppercase tracking-widest">km</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                 <p className="text-white font-bold">Continuando reporte...</p>
              </div>
            )}
          </div>
        )}

        {/* PASO 2: FOTOS (Solo Mensual) */}
        {step === 2 && requiredFrequency === "mensual" && !confirmPreviousPhotos && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <p className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4">Inspección de Unidad</p>
            <div className="grid grid-cols-2 gap-4">
              {['frente', 'trasera', 'latIzq', 'latDer'].map((side) => (
                <label key={side} className="relative flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-800 bg-gray-950/40 rounded-[2rem] hover:border-pink-500/50 transition-all cursor-pointer overflow-hidden group">
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoCapture(side, e)} />
                  {photos[side] ? (
                     <img src={photos[side] || "/placeholder.svg"} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                     <div className="text-center">
                        <svg className="w-8 h-8 text-gray-700 mx-auto mb-2 group-hover:text-pink-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{side === 'latIzq' ? 'LAT. IZQ' : side === 'latDer' ? 'LAT. DER' : side}</span>
                     </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3: VENCIMIENTOS (Solo Mensual) */}
        {step === 3 && requiredFrequency === "mensual" && !confirmPreviousPhotos && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <p className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4">Documentación Vigente</p>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Vencimiento Seguro</label>
                <input name="seguroVencimiento" type="date" value={formData.seguroVencimiento} onChange={handleInputChange} className="w-full bg-gray-950 border-2 border-white/5 rounded-2xl px-5 py-4 text-white font-black focus:border-pink-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Vencimiento VTV</label>
                <input name="vtvVencimiento" type="date" value={formData.vtvVencimiento} onChange={handleInputChange} className="w-full bg-gray-950 border-2 border-white/5 rounded-2xl px-5 py-4 text-white font-black focus:border-pink-500 outline-none transition-all" />
              </div>
            </div>
          </div>
        )}

        {/* PASO 4: COMBUSTIBLE / NOVEDADES */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <p className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4">Combustible y Extras</p>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Nivel Tanque</label>
              <div className="relative group">
                <select 
                  name="nivelCombustible" 
                  value={formData.nivelCombustible}
                  onChange={handleInputChange}
                  required
                  className="w-full h-[60px] bg-gray-950 border-2 border-white/5 rounded-2xl px-5 py-3 text-white font-black text-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="LLENO">Lleno</option>
                  <option value="3/4">3/4</option>
                  <option value="1/2">1/2</option>
                  <option value="1/4">1/4</option>
                  <option value="RESERVA">Reserva</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-pink-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {(requiredFrequency === "diario_cierre" || requiredFrequency === "semanal" || requiredFrequency === "mensual") && (
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Lugar de Guarda</label>
                <div className="p-1 bg-gray-950 rounded-2xl border-2 border-white/5 flex">
                   <button type="button" onClick={() => handleInputChange({target: {name: 'lugarGuarda', value: 'fija'}})} className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${formData.lugarGuarda === 'fija' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}>Base / Empresa</button>
                   <button type="button" onClick={() => handleInputChange({target: {name: 'lugarGuarda', value: 'domicilio'}})} className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${formData.lugarGuarda === 'domicilio' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}>Domicilio</button>
                </div>
                {formData.lugarGuarda === "domicilio" && (
                  <input
                    name="lugarGuardaDetalle"
                    type="text"
                    required
                    value={formData.lugarGuardaDetalle}
                    onChange={handleInputChange}
                    className="w-full bg-gray-950 border-2 border-pink-500/20 rounded-2xl px-5 py-4 text-white focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all placeholder:text-gray-700 text-sm font-medium"
                    placeholder="Especificar dirección detallada..."
                  />
                )}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Recarga en surtidor</label>
              <div className="p-1 bg-gray-950 rounded-2xl border-2 border-white/5 flex">
                 <button type="button" onClick={() => handleInputChange({target: {name: 'recargaCombustible', value: 'si'}})} className={`flex-1 py-4 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${formData.recargaCombustible === 'si' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}>Hice Recarga</button>
                 <button type="button" onClick={() => handleInputChange({target: {name: 'recargaCombustible', value: 'no'}})} className={`flex-1 py-4 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${formData.recargaCombustible === 'no' ? 'bg-gray-800 text-gray-400 shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}>Sin Recarga</button>
              </div>
            </div>

            {formData.recargaCombustible === "si" && (
              <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="relative">
                    <input name="montoCombustible" type="number" value={formData.montoCombustible} onChange={handleInputChange} className="w-full bg-gray-950 border-2 border-pink-500/20 rounded-2xl px-5 py-5 text-white font-black text-center text-2xl" placeholder="0.00" />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-500 font-black">$</div>
                  </div>
                  <label className="relative flex items-center justify-center p-5 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-950/50 cursor-pointer group">
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoCapture('ticket', e)} />
                    {photos.ticket ? 
                       <span className="text-emerald-500 text-[10px] font-black uppercase flex items-center gap-2">✔ Ticket Capturado</span> : 
                       <span className="text-gray-600 text-[9px] font-black uppercase tracking-widest group-hover:text-pink-500 transition-colors">📸 Foto de Comprobante</span>}
                  </label>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Novedades o Fallas</label>
              <textarea
                  name="novedades"
                  value={formData.novedades}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full bg-gray-950 border-2 border-white/5 rounded-2xl px-5 py-4 text-white focus:border-pink-500 outline-none transition-all resize-none text-sm font-medium"
                  placeholder="Escribí aquí si notaste algo..."
              />
            </div>
          </div>
        )}

        {/* PASO 5: RESUMEN FINAL */}
        {step === 5 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <p className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4">Verificación Final</p>
            <div className="space-y-4 bg-gray-950/80 border border-white/5 p-6 rounded-3xl relative overflow-hidden">

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Patente</p>
                    <p className="text-white font-black text-lg">{vehiculo.patente.toUpperCase()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Auditoría</p>
                    <p className="text-pink-500 font-black text-lg uppercase leading-none">{requiredFrequency.split('_').join(' ')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Kilometraje</p>
                    <p className="text-white font-black">{formData.kmActual || "--"} km</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Ubicación</p>
                    <p className="text-emerald-500 font-black text-[10px] truncate">{gpsLocation || "Detectada"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Combustible</p>
                    <p className="text-blue-400 font-black text-xs">{formData.nivelCombustible}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Lugar Guarda</p>
                    <p className="text-indigo-400 font-bold text-xs uppercase">{formData.lugarGuarda} {formData.lugarGuarda === 'domicilio' && `- ${formData.lugarGuardaDetalle}`}</p>
                  </div>
               </div>
               
               <div className="pt-4 border-t border-white/5">
                  <p className="text-[9px] text-gray-400 leading-relaxed font-bold uppercase tracking-tight">
                    Al confirmar, declarás que la información y fotografías provistas son veraces y corresponden al estado actual de la unidad.
                  </p>
               </div>
            </div>
          </div>
        )}

      </div>

      {!isDiarioInicio && (
        <div className="flex gap-4">
          {step > 1 && (
            <button type="button" onClick={prevStep} disabled={loading} className="flex-1 bg-gray-950 border-2 border-white/5 text-gray-600 font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl transition-all active:scale-95">Atrás</button>
          )}
          
          {step < 5 ? (
            <button type="button" onClick={nextStep} className="group flex-[2.5] bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-2xl transition-all shadow-xl shadow-white/5 flex justify-center items-center gap-2 active:scale-95">
               <span>Siguiente</span>
               <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading} className="flex-[2.5] bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-2xl transition-all shadow-[0_20px_50px_rgba(236,72,153,0.3)] flex justify-center items-center gap-3 disabled:opacity-50 active:scale-95">
              {loading ? <div className="h-5 w-5 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : "Finalizar Reporte"}
              {!loading && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
            </button>
          )}
        </div>
      )}

    </div>
  );
}
