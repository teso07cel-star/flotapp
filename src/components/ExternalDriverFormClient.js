"use client";
import { useState } from "react";
import { createRegistroDiario } from "@/lib/actions";

export default function ExternalDriverFormClient({ vehiculo, chofer, lastLog, debeTicket }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determinación de Kilometraje Semanal
  const [step, setStep] = useState(1);
  const [isFirstLogOfWeek, setIsFirstLogOfWeek] = useState(false);
  const [kmSemanal, setKmSemanal] = useState("");

  useEffect(() => {
    let required = true;
    if (lastLog?.fecha) {
      const now = new Date();
      const logDate = new Date(lastLog.fecha);
      const day = now.getDay() || 7; // Convertir Domingo (0) a 7
      
      const mondayOfThisWeek = new Date(now);
      mondayOfThisWeek.setDate(now.getDate() - day + 1);
      mondayOfThisWeek.setHours(0,0,0,0);

      if (logDate >= mondayOfThisWeek) {
         required = false;
      }
    }
    setIsFirstLogOfWeek(required);
    setStep(required ? 1 : 2);
  }, [lastLog]);

  const [nivelCombustible, setNivelCombustible] = useState("");
  const [fotoTicketCombustible, setFotoTicketCombustible] = useState("");
  const [montoCombustible, setMontoCombustible] = useState("");

  const [showCierreModal, setShowCierreModal] = useState(false);
  const [lugarGuarda, setLugarGuarda] = useState("");
  const [motivoUso, setMotivoUso] = useState("");

  const niveles = ["Vacio", "1/4", "Medio", "3/4", "Lleno"];
  const isBajoCombustible = ["Vacio", "1/4", "Medio"].includes(nivelCombustible);
  const requiereTicketObligatorio = debeTicket;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoTicketCombustible(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartWeek = () => {
    if (!kmSemanal) return;
    setStep(2);
  };

  const handleReporteRutinario = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (debeTicket && !fotoTicketCombustible) {
      setError("Debes subir el ticket del combustible pendiente del último viaje.");
      setLoading(false);
      return;
    }

    const data = {
      vehiculoId: vehiculo.id,
      choferId: chofer?.id,
      kmActual: isFirstLogOfWeek ? parseInt(kmSemanal) : (lastLog?.kmActual || 0),
      novedades: "Reporte de Combustible", 
      sucursalCounts: {},
      esExterno: true,
      nivelCombustible,
      montoCombustible,
      fotoTicketCombustible,
      isBranchUpdateOnly: true // evita comprobaciones de km estricto
    };

    const res = await createRegistroDiario(data);
    if (res.success) {
      window.location.href = "/?success=true";
    } else {
      setError("Error: " + res.error);
    }
    setLoading(false);
  };

  const handleFinalizarJornada = async (e) => {
    e.preventDefault();
    if (!lugarGuarda) return;
    setLoading(true);
    setError(null);

    const data = {
      vehiculoId: vehiculo.id,
      choferId: chofer?.id,
      kmActual: isFirstLogOfWeek && step === 2 ? parseInt(kmSemanal) : (lastLog?.kmActual || 0),
      novedades: motivoUso || "Cierre de jornada", 
      sucursalCounts: {},
      esExterno: true,
      lugarGuarda: lugarGuarda,
      isBranchUpdateOnly: true // evita comprobaciones estrictas de km interno
    };

    const res = await createRegistroDiario(data);
    if (res.success) {
      window.location.href = "/?success=true";
    } else {
      setError("Error: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* IDENTIDAD VISUAL FLETERO */}
      {chofer && (
         <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Fletero / Externo</p>
              <p className="text-white font-bold">{chofer.nombre}</p>
            </div>
         </div>
      )}

      {/* STEP 1: KILOMETRAJE SEMANAL */}
      {step === 1 && (
        <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Control Semanal</h2>
          <p className="text-gray-400 text-sm">Este es tu primer reporte de la semana. Por favor ingresa el kilometraje actual.</p>
          
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl">
             <input
               value={kmSemanal}
               onChange={(e) => setKmSemanal(e.target.value)}
               type="number"
               required
               className="w-full bg-black/50 border border-gray-700 rounded-xl px-5 py-4 text-white font-black text-3xl text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-800"
               placeholder="Ej: 145000"
             />
          </div>

          <button 
             onClick={handleStartWeek}
             disabled={!kmSemanal}
             className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-black tracking-widest py-5 rounded-2xl shadow-xl shadow-blue-500/25 transition-all mt-4 active:scale-95"
          >
            CONTINUAR
          </button>
        </div>
      )}

      {/* STEP 2: REPORTE RUTINARIO Y CIERRE */}
      {step === 2 && (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          {debeTicket && (
             <div className="bg-red-500/20 border border-red-500 p-4 rounded-xl mb-6">
                <h3 className="text-red-400 font-bold uppercase text-sm mb-1">¡Atención! Ticket Pendiente</h3>
                <p className="text-red-300 text-xs">En tu último viaje registraste poco combustible. Debes subir el ticket de carga para continuar.</p>
             </div>
          )}

          <form onSubmit={handleReporteRutinario} className="space-y-8">
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Nivel de Combustible</label>
              <div className="grid grid-cols-5 gap-2">
                {niveles.map(nivel => (
                   <button
                     type="button"
                     key={nivel}
                     onClick={() => setNivelCombustible(nivel)}
                     className={`py-3 px-1 rounded-xl text-xs font-bold transition-all border ${
                       nivelCombustible === nivel 
                         ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105" 
                         : "bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800"
                     }`}
                   >
                     {nivel}
                   </button>
                ))}
              </div>
              {isBajoCombustible && !debeTicket && (
                <p className="text-amber-400 text-xs mt-2 font-bold flex items-center gap-1">
                  ⚠️ ¡Recuerda subir el ticket si cargas combustible!
                </p>
              )}
            </div>

            {(debeTicket || fotoTicketCombustible || montoCombustible) && (
              <div className="space-y-4 bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
                 <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Ticket de Combustible</label>
                 <input
                   type="file"
                   accept="image/*"
                   capture="environment"
                   onChange={handlePhotoUpload}
                   className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                 />
                 {fotoTicketCombustible && (
                    <div className="mt-4">
                      <span className="text-xs text-gray-500 mb-1 block">Previsualización:</span>
                      <img src={fotoTicketCombustible} alt="Ticket" className="w-full h-32 object-cover rounded-xl border border-gray-700" />
                    </div>
                 )}
                 <div className="relative mt-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <input
                      type="number"
                      value={montoCombustible}
                      onChange={(e) => setMontoCombustible(e.target.value)}
                      placeholder="Monto gastado"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-8 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
              </div>
            )}

            {!debeTicket && !fotoTicketCombustible && !montoCombustible && (
               <button type="button" onClick={() => setMontoCombustible("0")} className="text-xs text-blue-400 underline font-bold">
                 + Cargar ticket de combustible ahora
               </button>
            )}

            {error && !showCierreModal && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowCierreModal(true)}
                className="flex-[0.9] bg-gray-900 hover:bg-purple-500/10 text-purple-400 font-bold tracking-widest py-4 rounded-xl border border-gray-800 hover:border-purple-500/30 transition-all text-[10px] uppercase flex flex-col justify-center items-center"
              >
                <span>Finalizar</span>
                <span>Jornada</span>
              </button>
              <button
                type="submit"
                disabled={loading || !nivelCombustible || (debeTicket && !fotoTicketCombustible)}
                className="flex-[1.1] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black tracking-widest py-4 rounded-xl shadow-xl shadow-blue-500/25 transition-all text-sm uppercase"
              >
                {loading ? "..." : "Guardar Reporte"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE CIERRE DE JORNADA (FLETEROS) */}
      {showCierreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-gray-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-500"></div>
              <h3 className="text-2xl font-black text-white text-center uppercase tracking-tighter mb-2">Cierre Diario</h3>
              <p className="text-xs text-gray-400 text-center mb-6">Completa estos datos para finalizar tu jornada.</p>

              <form onSubmit={handleFinalizarJornada}>
                
                <div className="space-y-4 mb-6">
                  {/* Lugar de Guarda */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">¿Dónde quedó el vehículo?</label>
                    <div className="grid grid-cols-2 gap-2">
                       {["Fijo", "Resguardo"].map((lugar) => (
                         <label key={lugar} className={`flex text-center justify-center py-3 rounded-xl border cursor-pointer font-bold text-xs uppercase transition-all ${
                           lugarGuarda === lugar ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-gray-800 bg-gray-950 text-gray-500 hover:bg-gray-900'
                         }`}>
                            <input type="radio" className="hidden" name="lugar" checked={lugarGuarda === lugar} onChange={() => setLugarGuarda(lugar)} />
                            {lugar}
                         </label>
                       ))}
                    </div>
                  </div>

                  {/* Descripción / Motivo */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Descripción de actividad</label>
                    <textarea
                      value={motivoUso}
                      onChange={(e) => setMotivoUso(e.target.value)}
                      required
                      rows={2}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-700 resize-none"
                      placeholder="Ej: Visitas a sucursales"
                    />
                  </div>
                </div>

                {error && showCierreModal && (
                  <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold text-center">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                   <button 
                     type="button"
                     onClick={() => { setShowCierreModal(false); setError(null); }}
                     className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-4 rounded-xl transition-colors text-xs uppercase"
                   >
                     Volver
                   </button>
                   <button 
                     type="submit"
                     disabled={loading || !lugarGuarda || !motivoUso}
                     className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 text-sm uppercase flex justify-center items-center"
                   >
                     {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Confirmar"}
                   </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
