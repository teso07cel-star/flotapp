"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function VehicleSelectorClient({ vehiculos }) {
  const [patente, setPatente] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Recordar la última patente usada en este celular
    const lastPatente = localStorage.getItem("flotapp_last_patente");
    if (lastPatente) {
      setPatente(lastPatente);
    }

    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = "es-AR";
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          
          // Limpiamos todo menos letras y números
          const cleanText = transcript.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          
          // Buscar coincidencia exacta o contenida dentro del dictado
          let match = vehiculos.find(v => cleanText.includes(v.patente));
          
          if (match) {
             setPatente(match.patente);
             submitPatente(match.patente);
          } else {
             setError(`Escuché "${transcript}", pero no coincide con ninguna patente guardada.`);
          }
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, [vehiculos]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else if (recognitionRef.current) {
      setError("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const submitPatente = (finalPatente) => {
    setLoading(true);
    // Validar si existe realmente en caso de tipeo manual
    const upperPatente = finalPatente.trim().toUpperCase();
    const exists = vehiculos.find(v => v.patente === upperPatente);
    
    if (!exists) {
      setError("La patente no existe en el sistema.");
      setLoading(false);
      return;
    }

    localStorage.setItem("flotapp_last_patente", exists.patente);
    router.push(`/driver/form?v=${exists.id}`); // Enviamos el ID en vez de patente por seguridad
  };

  return (
    <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-900 mb-6 shadow-xl border border-gray-800 text-white">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">Vehículo a Cargo</h1>
        <p className="text-gray-400 font-medium">Dicta la patente con la que vas a salir ahora.</p>
      </div>

      {/* Micrófono */}
      <div className="flex justify-center mb-8">
        <button 
          onClick={toggleListen}
          type="button"
          className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center transition-all duration-300 shadow-2xl
            ${isListening 
              ? 'bg-red-500 shadow-red-500/50 animate-pulse scale-110' 
              : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/30 hover:scale-105'}`
          }
        >
          {isListening ? (
             <div className="flex gap-1.5 h-10 items-center">
               <span className="w-2 h-full bg-white rounded-full animate-[bounce_1s_infinite_100ms]"></span>
               <span className="w-2 h-2/3 bg-white rounded-full animate-[bounce_1s_infinite_200ms]"></span>
               <span className="w-2 h-full bg-white rounded-full animate-[bounce_1s_infinite_300ms]"></span>
             </div>
          ) : (
            <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          )}
        </button>
      </div>

      <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="mb-6">
          <div className="text-center mb-4"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">O escribe manual</span></div>
          <div className="relative group">
            <input
              value={patente}
              onChange={(e) => setPatente(e.target.value)}
              type="text"
              placeholder="Ej. AF668JR"
              className="block w-full px-5 py-4 bg-gray-950 border border-gray-800 rounded-2xl text-white text-3xl text-center tracking-widest uppercase transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-800 font-black"
              autoComplete="off"
            />
          </div>
          {error && (
            <p className="mt-4 text-xs text-red-400 flex items-center justify-center gap-2 bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20 text-center">
              ⚠️ {error}
            </p>
          )}
        </div>

        <button
          onClick={() => submitPatente(patente)}
          disabled={loading || !patente}
          className="w-full h-16 bg-white hover:bg-gray-100 text-gray-900 font-black text-lg tracking-widest uppercase rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center group"
        >
          {loading ? "Buscando..." : (
            <span className="flex items-center gap-2">
              Siguiente
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
