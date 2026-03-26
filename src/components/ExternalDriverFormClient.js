"use client";
import { useState } from "react";
import { createRegistroDiario } from "@/lib/actions";

export default function ExternalDriverFormClient({ vehiculo, chofer, lastLog, debeTicket }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [nivelCombustible, setNivelCombustible] = useState("");
  const [lugarGuarda, setLugarGuarda] = useState("");
  const [fotoTicketCombustible, setFotoTicketCombustible] = useState("");
  const [montoCombustible, setMontoCombustible] = useState("");

  const niveles = ["Vacio", "1/4", "Medio", "3/4", "Lleno"];
  const isBajoCombustible = ["Vacio", "1/4", "Medio"].includes(nivelCombustible);
  const requiereTicketObligatorio = debeTicket || (isBajoCombustible && fotoTicketCombustible); // If they want to upload it now

  // Lógica local para previsualizar foto en Base64 (idealmente usarías Vercel Blob aquí)
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

  const handleSubmit = async (e) => {
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
      kmActual: lastLog?.kmActual || 0, // Externos no llevan km diario riguroso salvo que suban foto, lo simplificamos copiando el anterior o pedirlo.
      novedades: "Uso Externo", 
      sucursalCounts: {}, // Empty for external
      esExterno: true,
      nivelCombustible,
      lugarGuarda,
      montoCombustible,
      fotoTicketCombustible
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
      {debeTicket && (
         <div className="bg-red-500/20 border border-red-500 p-4 rounded-xl mb-6">
            <h3 className="text-red-400 font-bold uppercase text-sm mb-1">¡Atención! Ticket Pendiente</h3>
            <p className="text-red-300 text-xs">En tu último viaje registraste medio tanque o menos. Debes subir el ticket de carga de combustible antes de continuar.</p>
         </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Nivel de Combustible */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Nivel de Combustible Actual</label>
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
              ⚠️ ¡Recuerda cargar combustible pronto!
            </p>
          )}
        </div>

        {/* Carga de Combustible (Opcional o Obligatorio si debeTicket) */}
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

        {/* Confirmación Guarda */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Lugar de Guarda (ESTA NOCHE)</label>
          <div className="grid grid-cols-3 gap-3">
            {["Fijo", "Resguardo", "Otro"].map(lugar => (
              <label key={lugar} className={`flex flex-col items-center justify-center p-4 rounded-2xl border cursor-pointer transition-all ${
                lugarGuarda === lugar ? 'border-green-500 bg-green-500/10' : 'border-gray-800 bg-gray-900/50 hover:bg-gray-800'
              }`}>
                 <input type="radio" className="hidden" name="lugar" checked={lugarGuarda === lugar} onChange={() => setLugarGuarda(lugar)} />
                 <span className={`font-bold ${lugarGuarda === lugar ? 'text-green-400' : 'text-gray-400'}`}>{lugar}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !nivelCombustible || !lugarGuarda || (debeTicket && !fotoTicketCombustible)}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black tracking-widest py-6 px-6 rounded-2xl transition-all shadow-xl shadow-blue-500/25 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex justify-center items-center gap-3 group mt-8"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              GUARDAR REPORTE
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
