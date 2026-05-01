"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { bindDriverToDevice, solicitarAutorizacion, checkEstadoAutorizacion } from "@/lib/actions";

export default function DriverAuthClient({ choferes }) {
  const [selectedChofer, setSelectedChofer] = useState("");
  const [role, setRole] = useState(null); // null, "strategic", "individual"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authId, setAuthId] = useState(null);
  const router = useRouter();

  // Recuperar sesión anterior si existe
  useEffect(() => {
    const saved = localStorage.getItem("flotapp_driver_session");
    if (saved) {
      const session = JSON.parse(saved);
      // Si ya tiene una sesión iniciada, redirigir al formulario
      // router.push(`/driver/form?patente=${session.patente}&choferId=${session.choferId}`);
    }
  }, []);

  const handleIdentify = async (e) => {
    e.preventDefault();
    if (!selectedChofer) return;
    setRole(null);
  };

  const startStrategic = async () => {
    const chofer = choferes.find(c => c.id === parseInt(selectedChofer));
    if (!chofer) return;

    if (!chofer.patenteAsignada) {
      setError("No tenés una patente asignada. Contactá al administrador.");
      return;
    }

    setLoading(true);
    // Persistir sesión
    localStorage.setItem("flotapp_driver_session", JSON.stringify({
      choferId: chofer.id,
      patente: chofer.patenteAsignada,
      role: "strategic"
    }));

    router.push(`/driver/form?patente=${encodeURIComponent(chofer.patenteAsignada)}&choferId=${chofer.id}`);
  };

  const startIndividual = () => {
    router.push("/driver/entry/plate"); // Una subpágina para ingresar la patente manualmente
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {!role ? (
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] block text-center">¿Quién eres?</label>
            <select 
              value={selectedChofer}
              onChange={(e) => setSelectedChofer(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 text-white font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
            >
              <option value="">Selecciona tu nombre...</option>
              {choferes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {selectedChofer && (
            <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-4 duration-300">
              <button 
                onClick={() => setRole("strategic")}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-500/20"
              >
                <div className="relative z-10">
                  <h3 className="text-white font-black uppercase italic tracking-tighter text-xl mb-1">Conductor Estratégico</h3>
                  <p className="text-blue-100 text-xs font-bold opacity-80 uppercase tracking-wide">Usar mi patente y vehículo asignado</p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
              </button>

              <button 
                onClick={() => setRole("individual")}
                className="group relative overflow-hidden bg-gray-900 border border-gray-800 p-6 rounded-3xl text-left transition-all hover:border-gray-700 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="relative z-10">
                  <h3 className="text-white font-black uppercase italic tracking-tighter text-xl mb-1">Vehículo Individual</h3>
                  <p className="text-gray-500 text-xs font-bold opacity-80 uppercase tracking-wide">Ingresar patente manualmente</p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                </div>
              </button>
            </div>
          )}
        </div>
      ) : role === "strategic" ? (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
           <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Confirmar Identidad</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Verificando patente asignada</p>
           </div>
           
           <div className="bg-gray-900 border-2 border-blue-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl shadow-blue-500/10">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Tu Patente Asignada</div>
              <div className="text-5xl font-mono font-black text-white tracking-widest bg-gray-950 py-4 rounded-2xl border border-gray-800 italic">
                 {choferes.find(c => c.id === parseInt(selectedChofer))?.patenteAsignada || "ERROR"}
              </div>
           </div>

           {error && <p className="text-red-500 text-xs font-black uppercase text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}

           <div className="flex flex-col gap-3">
              <button 
                onClick={startStrategic}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
              >
                {loading ? "Iniciando..." : "COMENZAR RUTA"}
                {!loading && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
              </button>
              <button 
                onClick={() => setRole(null)}
                className="w-full py-4 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
              >
                Volver atrás
              </button>
           </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-8 duration-500">
           {/* Formulario de Patente Individual (Mover la lógica original aquí) */}
           <div className="text-center space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Ingresa la Patente</label>
                <input 
                  type="text"
                  placeholder="AB123CD"
                  className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-6 text-white font-black text-3xl text-center tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                  onChange={(e) => setSelectedChofer(e.target.value.toUpperCase())}
                />
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => router.push(`/driver/form?patente=${encodeURIComponent(selectedChofer)}`)}
                  className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl shadow-white/10"
                >
                  Identificar Vehículo
                </button>
                <button 
                  onClick={() => setRole(null)}
                  className="w-full py-4 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                >
                  Volver atrás
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
