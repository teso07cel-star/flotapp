"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import L from "leaflet";

// Generar ícono por color según cantidad de visitas
const getMarkerIcon = (visitas) => {
  let color = "blue"; // default: 1 visita
  
  if (visitas == 2) color = "orange";
  if (visitas >= 3) color = "red";

  // Usamos SVG dinámico en base64 para evitar depender de imágenes externas o paths relativos complejos.
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="40" height="40">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
    </svg>`;
  
  return L.divIcon({
    html: svgIcon,
    className: "custom-leaflet-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

export default function MapComponent({ branchesData = [] }) {
  // Center by default on Argentina
  const defaultCenter = [-38.416097, -63.616672];
  const defaultZoom = 4;
  
  const validBranches = branchesData.filter(b => b.lat != null && b.lng != null && b.nombre !== "Otros");
  
  // Si hay sucursales, usamos el centro de la primera para el inicio, 
  // pero el MapContainer usará un efecto para encuadrarlas todas si es necesario.
  const center = validBranches.length > 0 
    ? [validBranches[0].lat, validBranches[0].lng] 
    : defaultCenter;

  return (
    <div className="w-full h-[500px] rounded-[2.5rem] overflow-hidden border-2 border-slate-700/50 relative z-0 shadow-2xl shadow-black/50">
      <MapContainer 
        center={center} 
        zoom={validBranches.length > 0 ? 12 : defaultZoom} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
      >
        {/* Usamos el base map de CARTO Dark Matter para estética táctica */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {validBranches.map((branch, idx) => (
          <Marker 
            key={`${branch.id}-${idx}`} 
            position={[branch.lat, branch.lng]}
            icon={getMarkerIcon(branch.visitas || 1)}
          >
            <Popup className="tactical-popup">
              <div className="font-sans">
                <h3 className="font-black text-[12px] uppercase tracking-widest text-[#0f172a]">{branch.nombre}</h3>
                <p className="text-[10px] font-bold text-gray-500 mt-1">
                  Visitas: <span className="text-black font-black">{branch.visitas || 1}</span>
                </p>
                {branch.lugarGuarda && (
                  <p className="text-[9px] mt-1 text-blue-600 font-bold uppercase">{branch.lugarGuarda}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {validBranches.length === 0 && (
         <div className="absolute inset-0 bg-slate-900/80 z-[1000] flex items-center justify-center backdrop-blur-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-900 px-6 py-3 rounded-full border border-slate-700">Sin ubicaciones geo-etiquetadas</p>
         </div>
      )}
    </div>
  );
}
