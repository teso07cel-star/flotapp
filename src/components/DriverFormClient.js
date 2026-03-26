"use client";
import { useState, useEffect, useRef } from "react";
import { createRegistroDiario } from "@/lib/actions";

export default function DriverFormClient({ vehiculo, sucursales, chofer, lastLog }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authCode, setAuthCode] = useState("");

  const [kmActual, setKmActual] = useState(lastLog?.kmActual || "");
  const [sucursalCounts, setSucursalCounts] = useState({});
  const [novedades, setNovedades] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [transcriptMemory, setTranscriptMemory] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = "es-AR"; // Localizado para mejor detección
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          setTranscriptMemory(transcript);
          
          // --- ANALISIS HEURÍSTICO ---
          
          // 1. Extraer Kilómetros
          // Buscamos repasar la cadena sacando caracteres no numéricos excepto si dijeron "mil"
          // Muchos teclados transforman "ciento cincuenta mil" en "150000", lo cual es perfecto.
          const digitMatches = transcript.match(/\d[\d\.\s]*/g);
          if (digitMatches) {
            // Limpiar puntos y espacios y buscar el número mayor que parezca un KM (evitar agarrar numeros como "2" de "2 sucursales")
            const cleanNumbers = digitMatches.map(m => parseInt(m.replace(/[\.\s]/g, ''))).filter(n => !isNaN(n));
            if (cleanNumbers.length > 0) {
              const largestNumber = Math.max(...cleanNumbers);
              if (largestNumber > 1000) {
                 setKmActual(largestNumber.toString());
              }
            }
          }

          // 2. Mapear Sucursales
          const foundSucursales = sucursales.filter(s => transcript.includes(s.nombre.toLowerCase()));
             
          if (foundSucursales.length > 0) {
             setSucursalCounts(prev => {
                const next = { ...prev };
                foundSucursales.forEach(s => {
                   next[s.id] = (next[s.id] || 0) + 1; // Incrementa automáticamente
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
  }, [sucursales]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      vehiculoId: vehiculo.id,
      choferId: chofer?.id,
      kmActual: kmActual,
      novedades: novedades,
      sucursalCounts: sucursalCounts,
      authCode: authCode
    };

    const res = await createRegistroDiario(data);

    if (res.success) {
      window.location.href = "/?success=true";
    } else {
      if (res.error === "MILEAGE_AUTH_REQUIRED") {
        setShowAuth(true);
        setError("El kilometraje es igual o menor al anterior. Se requiere código de autorización del administrador.");
      } else {
        setError("Error: " + res.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      
      {/* PANEL DE ASISTente INTELIGENTE */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/20 border border-indigo-500/30 rounded-[2rem] p-6 text-center shadow-inner relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         
         <div className="relative z-10 flex flex-col items-center">
            <button 
              onClick={toggleListen}
              type="button"
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl mb-4
                ${isListening 
                  ? 'bg-red-500 shadow-red-500/50 animate-pulse scale-110' 
                  : 'bg-indigo-600 shadow-indigo-500/50 hover:bg-indigo-500 hover:scale-105'}`
              }
            >
              {isListening ? (
                <div className="flex gap-1">
                  <span className="w-1.5 h-6 bg-white rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-8 bg-white rounded-full animate-bounce delay-200"></span>
                  <span className="w-1.5 h-6 bg-white rounded-full animate-bounce delay-300"></span>
                </div>
              ) : (
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              )}
            </button>
            <h3 className="text-white font-black tracking-widest uppercase text-sm mb-1">Dictado Automático</h3>
            <p className="text-indigo-200 text-xs font-medium px-4">Di los kilómetros y las sucursales que visitaste para rellenar todo al instante.</p>
            
            {transcriptMemory && (
              <div className="mt-4 w-full bg-black/40 border border-white/10 rounded-xl p-3 text-left">
                <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold mb-1">Entendí:</p>
                <p className="text-white font-mono text-xs italic">"{transcriptMemory}"</p>
              </div>
            )}
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Identidad Visual */}
        {chofer && (
           <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
              <span className="text-2xl">👤</span>
              <div>
                <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Conductor Activo</p>
                <p className="text-white font-bold">{chofer.nombre}</p>
              </div>
           </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Kilometraje Actual</label>
          <div className="relative group">
            <input
              name="kmActual"
              value={kmActual}
              onChange={(e) => setKmActual(e.target.value)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              disabled={loading}
              className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-700 font-bold text-xl"
              placeholder="Ej. 145000"
            />
            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
              <span className="text-gray-600 font-bold uppercase tracking-widest text-xs">km</span>
            </div>
          </div>
        </div>

        {showAuth && (
          <div className="space-y-3 p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <label className="text-sm font-black text-amber-500 uppercase tracking-wider">Código de Autorización</label>
            <input
              type="text"
              required
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="w-full bg-gray-950/50 border border-amber-500/30 rounded-2xl px-5 py-4 text-white font-mono text-2xl tracking-[0.5em] text-center focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              placeholder="0000"
              maxLength={4}
            />
            <p className="text-[10px] text-amber-500/70 font-bold uppercase text-center mt-2">
              Solicitá este código al administrador para continuar
            </p>
          </div>
        )}

        {error && !showAuth && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-300 uppercase tracking-wider flex justify-between items-center">
            Sucursales Visitadas
            <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-full">{Object.values(sucursalCounts).reduce((a, b) => a + b, 0)} visitas</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {sucursales.map(s => {
              const count = sucursalCounts[s.id] || 0;
              const isSelected = count > 0;
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all group
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                      : 'border-gray-800 bg-gray-950/50 hover:border-gray-700'}`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className={`text-sm font-bold transition-colors truncate ${isSelected ? 'text-blue-400' : 'text-gray-300 group-hover:text-white'}`}>
                      {s.nombre}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">{s.direccion}</div>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                     <button
                        type="button"
                        onClick={() => updateSucursal(s.id, -1)}
                        disabled={count === 0}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-lg font-black transition-all active:scale-90
                           ${count > 0 ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-gray-800 text-gray-600'}`}
                     >-</button>
                     <span className={`font-mono font-black w-4 sm:w-6 text-center text-sm sm:text-base ${count > 0 ? 'text-white' : 'text-gray-600'}`}>{count}</span>
                     <button
                        type="button"
                        onClick={() => updateSucursal(s.id, 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center text-lg font-black transition-all active:scale-90"
                     >+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Novedades o Fallas</label>
          <textarea
            value={novedades}
            onChange={(e) => setNovedades(e.target.value)}
            rows={3}
            disabled={loading}
            className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-700 font-medium"
            placeholder="¿Algún problema con el vehículo?"
          />
        </div>

        <button
          type="submit"
          disabled={loading || Object.keys(sucursalCounts).length === 0 || !kmActual}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black tracking-widest py-6 px-6 rounded-2xl transition-all shadow-xl shadow-blue-500/25 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex justify-center items-center gap-3 group mt-8"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {showAuth ? "VERIFICAR Y ENVIAR" : "GUARDAR VIAJE"}
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
