"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function VehicleSelectorClient({ vehiculos, isExternoFlow = false }) {
  const [patente, setPatente] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const [nombreExterno, setNombreExterno] = useState("");
  const [showExternoNameModal, setShowExternoNameModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isNewVehicle, setIsNewVehicle] = useState(false);

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
          const cleanText = transcript.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
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

  const submitPatente = (eOrString) => {
    if (eOrString && eOrString.preventDefault) eOrString.preventDefault();
    setLoading(true);
    
    // Si viene del dictado de voz, es un string. Si viene del form, usamos el estado.
    const patenteToUse = (typeof eOrString === 'string' ? eOrString : patente) || "";
    const upperPatente = patenteToUse.replace(/\s/g, '').toUpperCase();
    const exists = vehiculos.find(v => v.patente === upperPatente);
    
    if (!exists) {
       setPatente(upperPatente);
       setIsNewVehicle(true);
       const storedName = localStorage.getItem("flotapp_externo_nombre");
       if (storedName) {
          setNombreExterno(storedName);
       }
       setSelectedVehicle(null);
       setShowExternoNameModal(true);
       setLoading(false);
       return;
    }

    localStorage.setItem("flotapp_last_patente", exists.patente);

    if (exists.tipo === 'EXTERNO') {
        const storedName = localStorage.getItem("flotapp_externo_nombre");
        if (storedName) {
           setNombreExterno(storedName);
        }
        setSelectedVehicle(exists);
        setShowExternoNameModal(true);
        setLoading(false);
        return;
    }

    router.push(`/driver/form?v=${exists.id}`); 
  };

  const confirmarExterno = async () => {
      if (!nombreExterno.trim()) {
         setError("Debes ingresar tu nombre y apellido");
         return;
      }
      setLoading(true);
      setError("");
      localStorage.setItem("flotapp_externo_nombre", nombreExterno);
      
      let vehicleIdToUse = selectedVehicle?.id;

      try {
         // Si es un vehículo nuevo, lo creamos ahora
         if (isNewVehicle) {
            const { createVehiculoExterno } = await import("@/lib/actions");
            const res = await createVehiculoExterno(patente, "PICKUP");
            if (res.success) {
               vehicleIdToUse = res.data.id;
            } else {
               setError(res.error);
               setLoading(false);
               return;
            }
         }

         // Llamada a server action para setear cookie flotapp_externo_session
         const { setExternoSession } = await import("@/lib/actions");
         await setExternoSession(nombreExterno);
      } catch (e) {
         console.log(e);
         setError(e.message || "Error al registrar");
         setLoading(false);
         return;
      }

      router.push(`/driver/form?v=${vehicleIdToUse}`);
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

      <form onSubmit={submitPatente} className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="mb-6">
          <div className="text-center mb-4"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">O escribe manual</span></div>
          <div className="relative group">
            <input
              value={patente}
              onChange={(e) => setPatente(e.target.value.toUpperCase())}
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
          type="submit"
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
      </form>



      {/* Modal Chofer Externo */}
      {showExternoNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
           <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                 <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h3 className="text-xl font-black text-white text-center uppercase tracking-tight mb-2">Identidad Flexible</h3>
              <p className="text-sm text-gray-400 text-center mb-6">Confirma quién conduce la unidad <span className="text-white font-bold">{selectedVehicle ? selectedVehicle.patente : patente}</span></p>

              <div className="mb-6">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 text-center">Tu Nombre y Apellido</label>
                 <input 
                   type="text" 
                   value={nombreExterno}
                   onChange={(e) => setNombreExterno(e.target.value)}
                   placeholder="Ej. Juan Pérez"
                   className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold"
                 />
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={() => setShowExternoNameModal(false)}
                   className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-4 rounded-xl transition-colors"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={confirmarExterno}
                   disabled={loading || !nombreExterno.trim()}
                   className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 flex justify-center items-center"
                 >
                   {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Confirmar"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
