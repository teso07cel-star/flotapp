import React from 'react';
import Image from 'next/image';

export default function VehicleIcon({ categoria, className = "w-10 h-8" }) {
  const cat = (categoria || "").toUpperCase();
  
  if (cat.includes("MOTO")) {
    return (
      <div className={`relative ${className} overflow-visible`}>
        <img src="/icons/moto.png" alt="Moto" className="w-full h-full object-contain brightness-110 contrast-125" />
      </div>
    );
  }
  
  if (cat.includes("PICKUP") || cat.includes("CAMIONETA")) {
    return (
      <div className={`relative ${className} overflow-visible`}>
        <img src="/icons/pickup.png" alt="Pickup" className="w-full h-full object-contain grayscale brightness-75 contrast-125" />
      </div>
    );
  }
  
  // Default: Auto
  return (
    <div className={`relative ${className} overflow-visible`}>
      <img src="/icons/auto.png" alt="Auto" className="w-full h-full object-contain brightness-125 contrast-125" />
    </div>
  );
}
