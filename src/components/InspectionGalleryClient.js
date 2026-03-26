"use client";
import { useState } from "react";

export default function InspectionGalleryClient({ inspecciones }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const getMesString = (mes) => {
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return meses[mes - 1] || mes;
  };

  const PhotoCard = ({ src, label }) => {
    if (!src) return (
      <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center opacity-50 h-40">
        <span className="text-2xl mb-2 grayscale">📷</span>
        <span className="text-xs font-bold text-gray-400 capitalize">{label.replace(/_/g, ' ')} Falta</span>
      </div>
    );

    return (
      <div 
        onClick={() => setSelectedImage(src)}
        className="relative group overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-xl transition-all aspect-video border border-amber-100 dark:border-amber-900/30"
      >
        <img src={src} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
           <span className="text-white font-black tracking-widest text-xs uppercase">{label.replace(/_/g, ' ')}</span>
        </div>
        <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
           <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
        </div>
      </div>
    );
  };

  if (!inspecciones || inspecciones.length === 0) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-3xl p-12 text-center text-amber-800 dark:text-amber-500">
         <p className="font-bold">No hay inspecciones registradas para este vehículo.</p>
         <p className="text-sm mt-2 opacity-80">El chofer deberá completarla la próxima vez que intente cargar la bitácora.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {inspecciones.map((inspeccion) => (
        <div key={inspeccion.id} className="bg-white/60 dark:bg-emerald-900/10 backdrop-blur-md rounded-3xl border border-emerald-100 dark:border-emerald-800/30 shadow-lg p-6 sm:p-8">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-800 pb-5 mb-6 gap-4">
              <div className="flex items-center gap-4">
                 <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white shadow-inner">
                   <span className="text-[10px] font-bold uppercase tracking-widest leading-none opacity-80 mb-1">{inspeccion.anio}</span>
                   <span className="text-lg font-black uppercase leading-none">{getMesString(inspeccion.mes).substring(0,3)}</span>
                 </div>
                 <div>
                   <h2 className="text-xl font-black text-gray-900 dark:text-white capitalize">{getMesString(inspeccion.mes)} {inspeccion.anio}</h2>
                   <p className="text-xs text-gray-500 font-bold mt-1">Conductor: <span className="text-emerald-600 dark:text-emerald-400">{inspeccion.chofer?.nombre || inspeccion.nombreConductor || "No registrado"}</span></p>
                   <p className="text-xs text-gray-500 mt-1">Fecha de carga: {new Date(inspeccion.fecha).toLocaleDateString()}</p>
                 </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 w-full sm:w-auto mt-2 sm:mt-0">
                 <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest border-b border-gray-200 dark:border-gray-800 pb-1">Lugares de Guarda (Declarados)</p>
                 <div className="grid grid-cols-1 gap-1 pt-1">
                   <p className="text-xs font-bold text-gray-700 dark:text-gray-300"><span className="text-blue-500 mr-1">Fijo:</span> {inspeccion.lugarGuardaFijo || 'N/A'}</p>
                   <p className="text-xs font-bold text-gray-700 dark:text-gray-300"><span className="text-amber-500 mr-1">Opción B:</span> {inspeccion.lugarGuardaResguardo || 'N/A'}</p>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-500 mb-4 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                   Registro Fotográfico Exterior
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <PhotoCard src={inspeccion.fotoFrente} label="Frente" />
                   <PhotoCard src={inspeccion.fotoTrasera} label="Trasera" />
                   <PhotoCard src={inspeccion.fotoLateralIzq} label="Lateral_Izq" />
                   <PhotoCard src={inspeccion.fotoLateralDer} label="Lateral_Der" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-amber-800 dark:text-amber-500 mb-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                   Documentación Mensual
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <PhotoCard src={inspeccion.fotoVTV} label="VTV_Vigente" />
                   <PhotoCard src={inspeccion.fotoSeguro} label="Póliza_Seguro" />
                </div>
              </div>
           </div>
        </div>
      ))}

      {/* Modal Visor de Imagen */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-10 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
           <button 
             className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-colors backdrop-blur-md"
             onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
           >
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
           <img 
             src={selectedImage} 
             alt="Vista Ampliada" 
             className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/10" 
             onClick={(e) => e.stopPropagation()} // Permite descargar o hacer click derecho sin cerrar
           />
        </div>
      )}
    </div>
  );
}
