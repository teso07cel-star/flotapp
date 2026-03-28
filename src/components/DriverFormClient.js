"use client";
import { useState } from "react";
import { createRegistroDiario } from "@/lib/actions";

export default function DriverFormClient({ vehiculo, sucursales, lastLog, identifiedDriver, isFirstLog }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authCode, setAuthCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const data = {
      vehiculoId: vehiculo.id,
      nombreConductor: identifiedDriver || lastLog?.nombreConductor || "Conductor",
      kmActual: formData.get("kmActual"),
      novedades: formData.get("novedades"),
      sucursalIds: formData.getAll("sucursalIds").map(id => parseInt(id)),
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-6">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter leading-none">Conductor Responsable</p>
          <p className="text-white font-bold leading-tight">{identifiedDriver || lastLog?.nombreConductor || "Conductor"}</p>
        </div>
      </div>

      {isFirstLog ? (
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Kilometraje Actual</label>
          <div className="relative group">
            <input
              name="kmActual"
              type="number"
              required
              disabled={loading}
              defaultValue={lastLog?.kmActual || ""}
              className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-700 font-bold text-xl"
              placeholder="Ej. 145000"
            />
            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
              <span className="text-gray-600 font-bold uppercase tracking-widest text-xs">km</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-emerald-400 text-sm font-bold uppercase tracking-wide">Viaje posterior. No es necesario ingresar kilometraje.</p>
        </div>
      )}

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
        <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Sucursales Visitadas</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {sucursales.map(s => (
            <label
              key={s.id}
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-800 bg-gray-950/50 hover:border-gray-700 transition-all cursor-pointer group"
            >
              <input 
                type="checkbox" 
                name="sucursalIds" 
                value={s.id}
                className="w-5 h-5 rounded-md border-gray-700 bg-gray-950 text-blue-600 focus:ring-blue-500 transition-all"
              />
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{s.nombre}</div>
                <div className="text-[10px] text-gray-500 truncate">{s.direccion}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Novedades o Fallas</label>
        <textarea
          name="novedades"
          rows={3}
          disabled={loading}
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
