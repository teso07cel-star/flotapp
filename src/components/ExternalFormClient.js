"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitExternalLog } from "@/lib/externalActions";

export default function ExternalFormClient({ vehiculo, requiredFrequency, lastMonthly, driverName }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // States
  const [formData, setFormData] = useState({
    kmActual: "",
    vtvVencimiento: vehiculo.vtvVencimiento ? new Date(vehiculo.vtvVencimiento).toISOString().split('T')[0] : "",
    seguroVencimiento: vehiculo.seguroVencimiento ? new Date(vehiculo.seguroVencimiento).toISOString().split('T')[0] : "",
    lugarGuarda: "fija",
    lugarGuardaDetalle: "",
    recargaCombustible: "no",
    nivelCombustible: "",
    montoCombustible: "",
    motivoUso: "rutina",
    novedades: ""
  });

  const [photos, setPhotos] = useState({
    frente: null,
    trasera: null,
    latIzq: null,
    latDer: null,
    vtv: null,
    seguro: null,
    ticket: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = (name, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 to preview and send easily for now
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotos(prev => ({
        ...prev,
        [name]: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const isMonthly = requiredFrequency === "mensual";
  
  const validateStep = () => {
    if (step === 1) { // Kilometraje y Guarda
      if (!formData.kmActual) return "El kilometraje es obligatorio.";
      if (formData.lugarGuarda === "opcional" && !formData.lugarGuardaDetalle) return "Especificá el lugar de guarda.";
      return null;
    }
    if (step === 2 && isMonthly) { // Mensual: Vehículo Fotos
       const isAutoOrPickup = ["AUTO", "PICKUP"].includes(vehiculo.categoria);
       if (isAutoOrPickup) {
         if (!photos.frente || !photos.trasera || !photos.latIzq || !photos.latDer) {
           return "Faltan fotografías del vehículo.";
         }
       }
       return null;
    }
    if (step === 3 && isMonthly) { // Mensual: Fechas
       if (!formData.vtvVencimiento || !formData.seguroVencimiento) return "Las fechas de vencimiento son obligatorias.";
       return null;
    }
    if (step === 4 || (!isMonthly && step === 2)) { // Combustible
       if (!isMonthly && !formData.nivelCombustible) return "Para el cierre diario es obligatorio indicar el nivel del tanque.";
       if (formData.recargaCombustible === "si" && (!formData.montoCombustible || !photos.ticket)) {
         return "Si cargaste combustible, agregá el monto y la foto del ticket.";
       }
       return null;
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(s => s - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const payload = {
        vehiculoId: vehiculo.id,
        driver: driverName,
        requiredFrequency,
        ...formData,
        ...photos
      };

      const result = await submitExternalLog(payload);
      if (result.success) {
        router.push("/?success=true");
        router.refresh();
      } else {
        setError(result.error);
        setLoading(false);
      }
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const maxSteps = isMonthly ? 5 : 3;

  return (
    <div className="max-w-md w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Progress */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold uppercase tracking-tight text-pink-400">
          {isMonthly ? "Registro Mensual" : "Registro Diario"}
        </h2>
        <div className="text-xs font-black uppercase text-gray-500">
          Paso {step} / {maxSteps}
        </div>
      </div>
      <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-pink-600 to-purple-600 transition-all duration-300" style={{ width: `${(step/maxSteps)*100}%` }}></div>
      </div>

      <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl relative">
        {error && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg whitespace-nowrap z-50">
            {error}
          </div>
        )}

        {/* STEP 1: KM Y GUARDA (Todos los flujos) */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <h3 className="text-lg font-bold text-white mb-4">1. Datos Iniciales</h3>
            
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Kilometraje del Tablero</label>
              <div className="relative group">
                <input
                  name="kmActual"
                  type="number"
                  value={formData.kmActual}
                  onChange={handleInputChange}
                  className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all font-bold text-xl"
                  placeholder="Ej. 145000"
                />
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-pink-500 font-bold uppercase text-xs">km</div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">¿Dónde pernocta el vehículo?</label>
              <select
                name="lugarGuarda"
                value={formData.lugarGuarda}
                onChange={handleInputChange}
                className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all font-bold text-sm"
              >
                <option value="fija">Base de Operaciones / Domicilio Fijo</option>
                <option value="opcional">Domicilio Opcional Temporal</option>
              </select>
            </div>

            <div className="animate-in fade-in">
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Dirección / Referencia de Ubicación</label>
              <input
                name="lugarGuardaDetalle"
                type="text"
                value={formData.lugarGuardaDetalle}
                onChange={handleInputChange}
                className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-pink-500 font-bold"
                placeholder="Ej: Base Av. Colon / Hotel San Juan"
              />
            </div>
          </div>
        )}

        {/* STEP 2 (MENSUAL): FOTOS VEHICULO */}
        {step === 2 && isMonthly && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <h3 className="text-lg font-bold text-white mb-2 leading-tight">2. Fotografías del Unidad</h3>
            <p className="text-xs text-gray-400 mb-6">Toma las 4 fotos exigidas de este mes para auditoría.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {['frente', 'trasera', 'latIzq', 'latDer'].map((side) => {
                 const labels = { frente: "Frontal", trasera: "Trasera", latIzq: "Lateral Izquierdo", latDer: "Lateral Derecho" };
                 return (
                  <label key={side} className="relative flex flex-col items-center justify-center h-32 border border-dashed border-gray-700 bg-gray-950/30 rounded-2xl hover:bg-gray-900 transition-colors cursor-pointer overflow-hidden group">
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoCapture(side, e)} />
                    {photos[side] ? (
                       <img src={photos[side] || "/placeholder.svg"} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt={labels[side]} />
                    ) : (
                       <svg className="w-8 h-8 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest relative z-10 px-2 text-center drop-shadow-md">
                      {photos[side] ? "Cambiar Foto" : labels[side]}
                    </span>
                  </label>
                 );
              })}
            </div>
          </div>
        )}

        {/* STEP 3 (MENSUAL): MANTENIMIENTO LEGAL (FECHAS) */}
        {step === 3 && isMonthly && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <h3 className="text-lg font-bold text-white mb-2 leading-tight">3. Mantenimiento Legal</h3>
            <p className="text-xs text-gray-400 mb-6">Actualiza las fechas de vencimiento de este mes.</p>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Vencimiento Seguro Póliza</label>
              <input
                  name="seguroVencimiento"
                  type="date"
                  value={formData.seguroVencimiento}
                  onChange={handleInputChange}
                  className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-pink-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Vencimiento VTV</label>
              <input
                  name="vtvVencimiento"
                  type="date"
                  value={formData.vtvVencimiento}
                  onChange={handleInputChange}
                  className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-pink-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <label className="relative flex flex-col items-center justify-center h-24 border border-dashed border-gray-700 bg-gray-950/30 rounded-2xl hover:bg-gray-900 cursor-pointer overflow-hidden group">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoCapture('seguro', e)} />
                {photos.seguro && <img src={photos.seguro || "/placeholder.svg"} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                <span className="text-[10px] font-bold text-white uppercase relative z-10 drop-shadow-md">{photos.seguro ? "Re-tomar" : "Foto Seguro"}</span>
              </label>

              <label className="relative flex flex-col items-center justify-center h-24 border border-dashed border-gray-700 bg-gray-950/30 rounded-2xl hover:bg-gray-900 cursor-pointer overflow-hidden group">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoCapture('vtv', e)} />
                {photos.vtv && <img src={photos.vtv || "/placeholder.svg"} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                <span className="text-[10px] font-bold text-white uppercase relative z-10 drop-shadow-md">{photos.vtv ? "Re-tomar" : "Foto VTV"}</span>
              </label>
            </div>
            <p className="text-[10px] text-gray-500 italic text-center mt-2">Tomar foto de las pólizas es opcional pero altamente recomendado.</p>
          </div>
        )}

        {/* STEP 4 (COMBINED COMBUSTIBLE/NOVEDADES) */}
        {(step === 4 && isMonthly) || (step === 2 && !isMonthly) ? (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <h3 className="text-lg font-bold text-white mb-4">Combustible y Novedades</h3>
            
            {!isMonthly && (
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Nivel de Combustible Actual</label>
                <div className="grid grid-cols-4 gap-2 border border-gray-800 rounded-2xl overflow-hidden shadow-inner">
                  {[
                    { val: '1/4', label: '1/4' },
                    { val: 'Medio', label: '1/2' },
                    { val: '3/4', label: '3/4' },
                    { val: 'Lleno', label: 'Lleno' }
                  ].map(nivel => (
                    <label key={nivel.val} className={`p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${formData.nivelCombustible === nivel.val ? 'bg-pink-500/20 text-pink-400 font-black shadow-[inset_0_4px_10px_rgba(236,72,153,0.1)]' : 'bg-gray-950/50 hover:bg-gray-900 text-gray-400 font-bold border-r border-gray-800 last:border-0'}`}>
                      <input type="radio" name="nivelCombustible" value={nivel.val} checked={formData.nivelCombustible === nivel.val} onChange={handleInputChange} className="hidden" />
                      <span className="text-sm">{nivel.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">¿Recargaste Combustible?</label>
              <div className="flex gap-4">
                 <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border ${formData.recargaCombustible === 'si' ? 'bg-pink-500/20 border-pink-500 text-pink-400 font-bold' : 'bg-gray-950/50 border-gray-800 text-gray-400'} cursor-pointer transition-colors`}>
                   <input type="radio" name="recargaCombustible" value="si" checked={formData.recargaCombustible === "si"} onChange={handleInputChange} className="hidden" />
                   SÍ, RECARGUÉ
                 </label>
                 <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border ${formData.recargaCombustible === 'no' ? 'bg-gray-800 border-gray-600 text-white font-bold' : 'bg-gray-950/50 border-gray-800 text-gray-400'} cursor-pointer transition-colors`}>
                   <input type="radio" name="recargaCombustible" value="no" checked={formData.recargaCombustible === "no"} onChange={handleInputChange} className="hidden" />
                   NO
                 </label>
              </div>
            </div>

            {formData.recargaCombustible === "si" && (
              <div className="space-y-4 p-4 border border-pink-500/30 bg-pink-500/5 rounded-2xl animate-in fade-in">
                 <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Monto Recargado ($)</label>
                  <input
                    name="montoCombustible"
                    type="number"
                    value={formData.montoCombustible}
                    onChange={handleInputChange}
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-pink-500"
                    placeholder="Ej. 15000"
                  />
                </div>
                <div>
                   <label className="relative flex items-center justify-center p-4 border-2 border-dashed border-pink-500/50 rounded-2xl bg-gray-950 hover:bg-gray-900 cursor-pointer overflow-hidden group">
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoCapture('ticket', e)} />
                      {photos.ticket ? (
                        <span className="text-pink-400 font-bold text-sm z-10">✔ TICKET ADJUNTO (Click para cambiar)</span>
                      ) : (
                         <span className="text-gray-400 font-bold text-sm">📸 Tomar Foto al Ticket</span>
                      )}
                      {photos.ticket && <img src={photos.ticket || "/placeholder.svg"} className="absolute inset-0 w-full h-full object-cover opacity-20" />}
                   </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Novedades o Mensajes</label>
              <textarea
                  name="novedades"
                  value={formData.novedades}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all resize-none placeholder:text-gray-700 text-sm"
                  placeholder="Comentarios sobre el recorrido, fallos en la unidad..."
              />
            </div>
          </div>
        ) : null}

        {/* STEP FINAL */}
        {step === maxSteps && (
          <div className="space-y-6 animate-in slide-in-from-right-8 pt-4">
             <div className="text-center">
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-pink-500/50">
                   <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Todo Listo</h3>
                <p className="text-gray-400 mt-2 text-sm leading-relaxed">Estás a punto de enviar la auditoría vinculada a <strong className="text-white">{vehiculo.patente}</strong> ({vehiculo.categoria}) bajo el nombre de <strong className="text-white">{driverName}</strong>.</p>
             </div>
          </div>
        )}

      </div>

      <div className="flex gap-4">
        {step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            disabled={loading}
            className="flex-1 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl disabled:opacity-50"
          >
            Atrás
          </button>
        )}
        
        {step < maxSteps ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex-[2] bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-pink-500/25 flex justify-center items-center gap-2"
          >
            Siguiente <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-pink-500/30 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Enviar Registro"}
          </button>
        )}
      </div>

    </div>
  );
}
