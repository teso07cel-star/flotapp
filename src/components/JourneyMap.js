"use client";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { StrategicGearIcon } from "./FuturisticIcons";
// Leaflet CSS movido a globals.css para mayor estabilidad

// Definición de iconos tácticos b4.5
const createMarkerIcon = (color) => {
  return L.divIcon({
    className: "custom-tactical-marker",
    html: `
      <div style="
        width: 12px;
        height: 12px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px ${color};
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

export default function JourneyMap({ registros, selectedDriver: externalDriver }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [selectedDriver, setSelectedDriver] = useState(externalDriver || null);

  // Sincronizar selección externa
  useEffect(() => {
    if (externalDriver) {
      setSelectedDriver(externalDriver);
    }
  }, [externalDriver]);

  // Agrupar registros por conductor
  const driversData = registros.reduce((acc, reg) => {
    if (!reg.nombreConductor) return acc;
    if (!acc[reg.nombreConductor]) acc[reg.nombreConductor] = [];
    
    // Intentar parsear coordenadas de lugarGuarda (formato: "lat, lng")
    const coordMatch = reg.lugarGuarda?.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (coordMatch) {
      acc[reg.nombreConductor].push({
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[2]),
        fecha: new Date(reg.fecha),
        tipo: reg.tipoReporte,
        patente: reg.vehiculo?.patente || "N/A"
      });
    }
    return acc;
  }, {});

  // Ordenar registros por fecha para cada conductor
  Object.keys(driversData).forEach(driver => {
    driversData[driver].sort((a, b) => a.fecha - b.fecha);
  });

  const driversList = Object.keys(driversData);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // LIMPIEZA PREVENTIVA
    if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
    }

    // Inicializar mapa con tema oscuro
    mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [-34.6037, -58.3816], // Buenos Aires default
        zoom: 12,
        zoomControl: false,
        fadeAnimation: true
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
    }).addTo(mapInstanceRef.current);

    layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

    // Bucle de invalidación agresiva para asegurar visibilidad en contenedores dinámicos
    const invalidate = () => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    };
    
    setTimeout(invalidate, 100);
    setTimeout(invalidate, 1000);
    setTimeout(invalidate, 3000);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    if (selectedDriver && driversData[selectedDriver]) {
      const points = driversData[selectedDriver].map(p => [p.lat, p.lng]);
      
      if (points.length > 0) {
        // Dibujar polilínea tactica
        L.polyline(points, {
          color: "#3b82f6",
          weight: 4,
          opacity: 0.8,
          dashArray: "10, 10",
          lineJoin: "round"
        }).addTo(layerGroupRef.current);

        // Agregar marcadores específicos
        driversData[selectedDriver].forEach((p, index) => {
          let color = "#cbd5e1"; // Rutina
          if (p.tipo === "INICIO" || index === 0) color = "#10b981"; // Inicio
          if (p.tipo === "CIERRE" || index === points.length - 1) color = "#ef4444"; // Cierre

          L.marker([p.lat, p.lng], {
            icon: createMarkerIcon(color)
          })
          .bindPopup(`
            <div class="text-xs font-black uppercase text-slate-800">
              <p class="border-b border-slate-200 mb-1">${p.tipo || 'PARADA'}</p>
              <p class="text-[9px] text-slate-500">${p.fecha.toLocaleTimeString()}</p>
            </div>
          `)
          .addTo(layerGroupRef.current);
        });

        // Ajustar vista
        const bounds = L.latLngBounds(points);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [selectedDriver, registros]);

  return (
    <div className="space-y-6">
      {/* MAPA HUD */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div 
          ref={mapContainerRef} 
          className="relative h-[450px] w-full bg-[#020617] rounded-[2rem] border border-white/5 overflow-hidden z-[5]"
          style={{ zIndex: 5 }}
        />
        
        {/* Overlay HUD */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none select-none">
           <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">C4 Journey Traceability</p>
           </div>
        </div>
        
        {/* Placeholder táctico si falla la carga o está vacío */}
        <div className="absolute inset-0 z-[-1] bg-[#020617] flex items-center justify-center pointer-events-none">
            <StrategicGearIcon className="w-16 h-16 text-slate-900 animate-spin-slow opacity-20" />
        </div>
      </div>

      {/* SELECTOR DE CONDUCTORES (Lista abajo sugerida por usuario) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4">
        {driversList.map(driver => (
          <button
            key={driver}
            onClick={() => setSelectedDriver(driver)}
            className={`
              p-4 rounded-2xl border transition-all duration-300 text-center space-y-2
              ${selectedDriver === driver 
                ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'bg-slate-900/40 border-white/5 hover:border-white/20'}
            `}
          >
            <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-[10px] font-black
              ${selectedDriver === driver ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}
            `}>
              {driver.charAt(0)}
            </div>
            <p className={`text-[10px] font-black uppercase tracking-tighter truncate w-full
              ${selectedDriver === driver ? 'text-white' : 'text-slate-500'}
            `}>
              {driver.split(' ')[0]}
            </p>
          </button>
        ))}
      </div>

      {!selectedDriver && driversList.length > 0 && (
        <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">
           Selecciona un operador para visualizar su rastro operativo
        </p>
      )}
      
      {driversList.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
           <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">Sin señales de GPS capturadas para esta fecha</p>
        </div>
      )}
    </div>
  );
}
