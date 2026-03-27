"use client";
import { useState, useEffect, useRef } from "react";
import { createRegistroDiario } from "@/lib/actions";

export default function DriverFormClient({ vehiculo, sucursales, chofer, lastLog }) {
  const hasInitialKm = Boolean(lastLog?.kmActual && lastLog.kmActual > 0);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authCode, setAuthCode] = useState("");

  const [kmActual, setKmActual] = useState(lastLog?.kmActual || "");
  const [sucursalCounts, setSucursalCounts] = useState({});
  const [novedades, setNovedades] = useState("");

  const [showCierreModal, setShowCierreModal] = useState(false);
  const [kmCierre, setKmCierre] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [transcriptMemory, setTranscriptMemory] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = "es-AR";
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          setTranscriptMemory(transcript);
          
          const digitMatches = transcript.match(/\d[\d\.\s]*/g);
          if (digitMatches) {
            const cleanNumbers = digitMatches.map(m => parseInt(m.replace(/[\.\s]/g, ''))).filter(n => !isNaN(n));
            if (cleanNumbers.length > 0) {
              const largestNumber = Math.max(...cleanNumbers);
              if (largestNumber > 1000) {
                 if (step === 1 && !hasInitialKm) setKmActual(largestNumber.toString());
                 if (showCierreModal) setKmCierre(largestNumber.toString());
              }
            }
          }

          const foundSucursales = sucursales.filter(s => transcript.includes(s.nombre.toLowerCase()));
          if (foundSucursales.length > 0 && step === 2 && !showCierreModal) {
             setSucursalCounts(prev => {
                const next = { ...prev };
                foundSucursales.forEach(s => {
                   next[s.id] = (next[s.id] || 0) + 1;
                });
                return next;
             });
          }
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Error en reconocimiento de voz:", event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [sucursales, step, showCierreModal, hasInitialKm]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setTranscriptMemory("");
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Tu navegador no soporta dictado por voz. Usa Chrome o Safari.");
      }
    }
  };

  const updateSucursal = (id, delta) => {
    setSucursalCounts(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleStartShift = () => {
    if (!hasInitialKm && !kmActual) return;
    setStep(2);
  };

  const handleGuardarVisitas = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      vehiculoId: vehiculo.id,
      choferId: chofer?.id,
      kmActual: kmActual,
      novedades: novedades,
      sucursalCounts: sucursalCounts,
      isBranchUpdateOnly: true // Omite validación de kilometraje
    };

    const res = await createRegistroDiario(data);
    if (res.success) {
      window.location.href = "/?success=true";
    } else {
      setError("Error: " + res.error);
    }
    setLoading(false);
  };

  const handleCierreTurno = async (e) => {
    e.preventDefault();
    if (!kmCierre) return;
    setLoading(true);
    setError(null);

    const data = {
      vehiculoId: vehiculo.id,
      choferId: chofer?.id,
      kmActual: kmCierre,
      novedades: "Cierre de turno",
      authCode: authCode
    };

    const res = await createRegistroDiario(data);
    if (res.success) {
      window.location.href = "/?success=true";
    } else {
      if (res.error === "MILEAGE_AUTH_REQUIRED") {
        setShowAuth(true);
        setError("El kilometraje de cierre es menor o igual al inicial. Requiere código de autorización.");
      } else {
        setError("Error: " + res.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      
      {/* IDENTIDAD VISUAL CHOFER */}
      {chofer && (
         <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Conductor Activo</p>
              <p className="text-white font-bold">{chofer.nombre}</p>
            </div>
         </div>
      )}

      {/* STEP 1: INICIO DE TURNO */}
      {step === 1 && (
        <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Inicio de Jornada</h2>
          
          {hasInitialKm ? (
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-inner">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Último Kilometraje</p>
              <p className="text-4xl font-black text-white font-mono">{lastLog.kmActual} <span className="text-sm text-gray-500">km</span></p>
              <p className="text-xs text-green-400 mt-2 font-bold flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Confirmado para hoy
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-left bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl">
               <label className="text-xs font-bold text-amber-500 uppercase tracking-widest block text-center">Ingresar Kilometraje Inicial</label>
               <p className="text-[10px] text-gray-500 text-center mb-4 uppercase tracking-widest font-bold">Este vehículo aún no tiene historial.</p>
               <input
                 value={kmActual}
                 onChange={(e) => setKmActual(e.target.value)}
                 type="number"
                 className="w-full bg-black/50 border border-gray-700 rounded-xl px-5 py-4 text-white font-black text-3xl text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-800"
                 placeholder="Ej: 154000"
               />
               <div className="flex justify-center mt-2">
                 <button onClick={toggleListen} type="button" className={`p-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-800 hover:bg-gray-700'} transition-colors`}>
                   <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                 </button>
               </div>
            </div>
          )}

          <button 
             onClick={handleStartShift}
             disabled={!hasInitialKm && !kmActual}
             className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-black tracking-widest py-5 rounded-2xl shadow-xl shadow-blue-500/25 transition-all mt-4 active:scale-95"
          >
            {hasInitialKm ? "CONFIRMAR Y CONTINUAR" : "INICIAR RECORRIDO"}
          </button>
        </div>
      )}

      {/* STEP 2: DURANTE LA JORNADA */}
      {step === 2 && (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          
          <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/20 border border-indigo-500/30 rounded-[2rem] p-6 text-center shadow-inner relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="relative z-10 flex flex-col items-center">
                <button onClick={toggleListen} type="button" className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl mb-3 ${isListening ? 'bg-red-500 shadow-red-500/50 animate-pulse scale-110' : 'bg-indigo-600 shadow-indigo-500/50 hover:bg-indigo-500 hover:scale-105'}`}>
                  {isListening ? (
                    <div className="flex gap-1">
                      <span className="w-1 h-4 bg-white rounded-full animate-bounce delay-100"></span>
                      <span className="w-1 h-6 bg-white rounded-full animate-bounce delay-200"></span>
                      <span className="w-1 h-4 bg-white rounded-full animate-bounce delay-300"></span>
                    </div>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  )}
                </button>
                <h3 className="text-white font-black tracking-widest uppercase text-xs mb-1">Dictado Automático</h3>
                <p className="text-indigo-200 text-[10px] font-medium px-4">Di las sucursales que visitaste para sumarlas.</p>
                {transcriptMemory && (
                  <div className="mt-3 w-full bg-black/40 border border-white/10 rounded-xl p-2 text-left">
                    <p className="text-white font-mono text-[10px] italic">"{transcriptMemory}"</p>
                  </div>
                )}
             </div>
          </div>

          <form onSubmit={handleGuardarVisitas} className="space-y-6">
            
            {error && !showCierreModal && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-widest flex justify-between items-center">
                Sucursales Visitadas
                <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-full">{Object.values(sucursalCounts).reduce((a, b) => a + b, 0)} visitas</span>
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {sucursales.map(s => {
                  const count = sucursalCounts[s.id] || 0;
                  const isSelected = count > 0;
                  return (
                    <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 bg-gray-950/50 hover:border-gray-700'}`}>
                      <div className="flex-1 min-w-0 pr-3">
                        <div className={`text-sm font-bold transition-colors truncate ${isSelected ? 'text-blue-400' : 'text-gray-300'}`}>{s.nombre}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         <button type="button" onClick={() => updateSucursal(s.id, -1)} disabled={count === 0} className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-black transition-all ${count > 0 ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white active:scale-95' : 'bg-gray-800 text-gray-600'}`}>-</button>
                         <span className={`font-mono font-black w-4 text-center ${count > 0 ? 'text-white' : 'text-gray-600'}`}>{count}</span>
                         <button type="button" onClick={() => updateSucursal(s.id, 1)} className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center text-lg font-black transition-all active:scale-95">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Novedades (Opcional)</label>
              <textarea
                value={novedades}
                onChange={(e) => setNovedades(e.target.value)}
                rows={2}
                className="w-full bg-gray-950/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm placeholder:text-gray-700"
                placeholder="¿Algún problema con el vehículo o la ruta?"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowCierreModal(true)}
                className="flex-[0.8] bg-gray-900 hover:bg-red-500/10 text-red-400 font-bold tracking-widest py-4 rounded-xl border border-gray-800 hover:border-red-500/30 transition-all text-xs uppercase"
              >
                Finalizar Turno
              </button>
              <button
                type="submit"
                disabled={loading || Object.keys(sucursalCounts).length === 0}
                className="flex-[1.2] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black tracking-widest py-4 rounded-xl shadow-xl shadow-blue-500/25 transition-all text-sm uppercase flex justify-center items-center"
              >
                {loading ? "..." : "Guardar Visitas"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE CIERRE DE TURNO */}
      {showCierreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-gray-900 border border-red-500/30 rounded-3xl p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500"></div>
              <h3 className="text-2xl font-black text-white text-center uppercase tracking-tighter mb-2">Cerrar Turno</h3>
              <p className="text-xs text-gray-400 text-center uppercase tracking-widest font-bold mb-8">Ingresa el kilometraje final</p>

              <form onSubmit={handleCierreTurno}>
                <div className="mb-6">
                   <input
                     value={kmCierre}
                     onChange={(e) => setKmCierre(e.target.value)}
                     type="number"
                     required
                     className="w-full bg-black/60 border border-gray-700 rounded-2xl px-5 py-5 text-white font-black text-4xl text-center focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-gray-800"
                     placeholder={kmActual || "Ej: 145020"}
                   />
                   <div className="flex justify-center mt-3">
                     <button onClick={toggleListen} type="button" className={`p-4 rounded-full shadow-lg ${isListening ? 'bg-red-500 animate-[bounce_1s_infinite]' : 'bg-gray-800 hover:bg-gray-700'} transition-all`}>
                       <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                     </button>
                   </div>
                </div>

                {showAuth && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in">
                    <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block text-center mb-2">Código de Autorización</label>
                    <input
                      type="text"
                      required
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      className="w-full bg-black/50 border border-red-500/30 rounded-xl px-4 py-3 text-white font-mono text-xl tracking-[0.5em] text-center focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      placeholder="0000"
                      maxLength={4}
                    />
                    <p className="text-[9px] text-red-400/70 font-bold uppercase text-center mt-2">
                       El km final es menor o igual al inicial
                    </p>
                  </div>
                )}
                
                {error && !showAuth && (
                  <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold text-center">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                   <button 
                     type="button"
                     onClick={() => { setShowCierreModal(false); setError(null); setShowAuth(false); }}
                     disabled={loading}
                     className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-4 rounded-xl transition-colors text-xs uppercase tracking-wider"
                   >
                     Cancelar
                   </button>
                   <button 
                     type="submit"
                     disabled={loading || !kmCierre}
                     className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 text-sm uppercase tracking-widest flex justify-center items-center"
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
