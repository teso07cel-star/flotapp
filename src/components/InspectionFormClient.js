"use client";
import { useState } from "react";
import { createInspeccionMensual } from "@/lib/actions";

export default function InspectionFormClient({ vehiculo, chofer }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [fotos, setFotos] = useState({
     frente: "",
     trasera: "",
     lateralIzq: "",
     lateralDer: "",
     vtv: "",
     seguro: ""
  });

  const [ubicaciones, setUbicaciones] = useState({
     fijo: "",
     resguardo: ""
  });

  const handlePhotoUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotos(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormComplete = Object.values(fotos).every(f => f !== "") && ubicaciones.fijo !== "" && ubicaciones.resguardo !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createInspeccionMensual({
       vehiculoId: vehiculo.id,
       choferId: chofer?.id,
       ...fotos,
       lugarGuardaFijo: ubicaciones.fijo,
       lugarGuardaResguardo: ubicaciones.resguardo
    });

    if (res.success) {
      window.location.href = `/driver/form?v=${vehiculo.id}`;
    } else {
      setError("Error: " + res.error);
    }
    setLoading(false);
  };

  const PhotoField = ({ id, label, description }) => (
    <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 transition-all hover:border-gray-700">
       <label className="text-sm font-bold text-gray-300 uppercase tracking-wider block mb-1">{label}</label>
       <p className="text-[10px] text-gray-500 mb-3">{description}</p>
       
       {!fotos[id] ? (
         <div className="relative">
           <input
             type="file"
             accept="image/*"
             capture="environment"
             onChange={(e) => handlePhotoUpload(id, e)}
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
           />
           <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-700 rounded-xl bg-gray-950/50 group hover:border-blue-500 hover:bg-blue-500/5 transition-all">
             <span className="text-3xl mb-2 group-hover:scale-110 transition-transform text-gray-600 group-hover:text-blue-500">📷</span>
             <span className="text-xs font-bold text-gray-500 group-hover:text-blue-400">Tomar foto</span>
           </div>
         </div>
       ) : (
         <div className="relative rounded-xl overflow-hidden group">
           <img src={fotos[id]} alt={label} className="w-full h-32 object-cover opacity-80" />
           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoUpload(id, e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20 shadow-xl">
                 Cambiar
              </span>
           </div>
           <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 blur-0">
             <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
           </div>
         </div>
       )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white border-b border-gray-800 pb-2">1. Exterior del Vehículo</h2>
        <div className="grid grid-cols-2 gap-3">
          <PhotoField id="frente" label="Frente" description="Que se vea la patente" />
          <PhotoField id="trasera" label="Traser" description="Ángulo completo" />
          <PhotoField id="lateralIzq" label="Lateral Izq." description="Puertas y estado" />
          <PhotoField id="lateralDer" label="Lateral Der." description="Sin cortes" />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-black text-white border-b border-gray-800 pb-2">2. Documentación Legajo Mensual</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PhotoField id="vtv" label="VTV Vigente" description="Frente de la oblea o papel" />
          <PhotoField id="seguro" label="Póliza de Seguro" description="Comprobante del mes en curso" />
        </div>
      </div>

      <div className="space-y-4 pt-4">
         <h2 className="text-lg font-black text-white border-b border-gray-800 pb-2">3. Declaración de Guarda</h2>
         <p className="text-xs text-gray-400 mb-4">Informá dónde "duerme" el vehículo habitualmente para nuestro registro de seguridad.</p>
         
         <div className="space-y-3">
            <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Dirección Fija Principal</label>
            <input 
              type="text" 
              required
              value={ubicaciones.fijo}
              onChange={(e) => setUbicaciones(prev => ({ ...prev, fijo: e.target.value }))}
              placeholder="Ej. Av. Siempreviva 742, Garín" 
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" 
            />
         </div>
         <div className="space-y-3 mt-4">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Opción B / De Resguardo</label>
            <input 
              type="text" 
              required
              value={ubicaciones.resguardo}
              onChange={(e) => setUbicaciones(prev => ({ ...prev, resguardo: e.target.value }))}
              placeholder="Ej. Cochera Padre: San Martín 123" 
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium" 
            />
         </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !isFormComplete}
        className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black tracking-widest py-6 px-6 rounded-2xl transition-all shadow-xl shadow-amber-500/25 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex justify-center items-center gap-3 group mt-8"
      >
        {loading ? (
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            ENVIAR INSPECCIÓN
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </>
        )}
      </button>

    </form>
  );
}
