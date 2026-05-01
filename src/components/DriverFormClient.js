"use client";
import { useState, useEffect } from "react";
import { createRegistroDiario } from "@/lib/actions";


export default function DriverFormClient({ vehiculo, sucursales, lastLog, choferId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [selectedSucursales, setSelectedSucursales] = useState([]);
  const [formData, setFormData] = useState({
    nombreConductor: "",
    kmActual: "",
    novedades: ""
  });

  // Load persistence and session data
  useEffect(() => {
    const saved = localStorage.getItem(`flotapp_form_${vehiculo.id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData(prev => ({ ...prev, ...parsed.formData }));
      setSelectedSucursales(parsed.selectedSucursales || []);
    }

    const session = localStorage.getItem("flotapp_driver_session");
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.choferId && !formData.nombreConductor) {
         // Podríamos buscar el nombre, pero por ahora si hay sesión es porque el driver se identificó
         // El DriverAuthClient guarda el nombre si queremos, o simplemente usamos choferId en el submit
      }
    }
  }, [vehiculo.id]);

  // Save persistence on change
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`flotapp_form_${vehiculo.id}`, JSON.stringify({
        formData,
        selectedSucursales
      }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, selectedSucursales, vehiculo.id]);

  const toggleSucursal = (id) => {
    setSelectedSucursales(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      vehiculoId: vehiculo.id,
      nombreConductor: formData.nombreConductor,
      kmActual: formData.kmActual,
      novedades: formData.novedades,
      sucursalIds: selectedSucursales,
      choferId: choferId,
      authCode: authCode
    };

    const res = await createRegistroDiario(data);

    if (res.success) {
      localStorage.removeItem(`flotapp_form_${vehiculo.id}`);
      localStorage.removeItem("flotapp_driver_session");
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Nombre del Conductor</label>
        <input
          name="nombreConductor"
          type="text"
          required
          disabled={loading}
          value={formData.nombreConductor}
          onChange={handleInputChange}
          className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-700 font-medium"
          placeholder="Ej. Juan Pérez"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Kilometraje Actual</label>
        <div className="relative group">
          <input
            name="kmActual"
            type="number"
            required
            disabled={loading}
            value={formData.kmActual}
            onChange={handleInputChange}
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
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Sucursales Visitadas</label>
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{selectedSucursales.length} seleccionadas</span>
        </div>
        <div className="flex flex-row overflow-x-auto pb-4 gap-3 no-scrollbar snap-x">
          {sucursales.map(s => {
            const isSelected = selectedSucursales.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSucursal(s.id)}
                className={`flex-none w-40 p-5 rounded-3xl border-2 transition-all snap-start flex flex-col items-start gap-2 ${
                  isSelected 
                    ? "bg-blue-600 border-blue-400 text-white shadow-2xl shadow-blue-500/40 ring-4 ring-blue-500/20 translate-y-[-4px]" 
                    : "bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700 hover:bg-gray-800/50"
                }`}
              >
                <div className={`w-3 h-3 rounded-full mb-1 ${isSelected ? "bg-white shadow-[0_0_10px_white]" : "bg-gray-700"}`} />
                <span className={`text-sm font-black uppercase tracking-tight truncate w-full text-left ${isSelected ? "text-white" : "text-gray-300"}`}>{s.nombre}</span>
                {s.direccion && <span className={`text-[10px] font-bold truncate w-full text-left opacity-60 ${isSelected ? "text-blue-100" : "text-gray-600"}`}>{s.direccion}</span>}
                <input type="checkbox" name="sucursalIds" value={s.id} checked={isSelected} readOnly className="hidden" />
              </button>
            );
          })}
        </div>

      </div>


      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Novedades o Fallas</label>
        <textarea
          name="novedades"
          rows={3}
          disabled={loading}
          value={formData.novedades}
          onChange={handleInputChange}
          className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-700 font-medium"
          placeholder="¿Algún problema con el vehículo?"
        />
      </div>


      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-5 px-6 rounded-2xl transition-all shadow-xl shadow-blue-500/25 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex justify-center items-center gap-3 group"
      >
        {loading ? (
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            {showAuth ? "VERIFICAR Y ENVIAR" : "ENVIAR BITÁCORA"}
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </>
        )}
      </button>
    </form>
  );
}
