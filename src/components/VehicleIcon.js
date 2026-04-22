import React from 'react';
import Image from 'next/image';

export default function VehicleIcon({ categoria, className = "w-10 h-8" }) {
  const cat = (categoria || "").toUpperCase();
  
  if (cat.includes("MOTO")) {
    return (
      <div className={`relative ${className} overflow-visible`}>
        <img src="/icons/moto_tactic.png" alt="Moto" className="w-full h-full object-contain brightness-110 saturate-[2.5] contrast-[1.25] transition-all" />
      </div>
    );
  }
  
  if (cat.includes("PICKUP") || cat.includes("CAMIONETA")) {
    return (
      <div className={`relative ${className} overflow-visible`}>
        <img src="/icons/pickup_tactic.png" alt="Pickup" className="w-full h-full object-contain brightness-110 transition-all" />
      </div>
    );
  }
  
  // Default: Auto (Toyota Etios)
  return (
    <div className={`relative ${className} overflow-visible`}>
      <img src="/icons/etios_tactic_v2.png" alt="Auto" className="w-full h-full object-contain brightness-125 transition-all" />
    </div>
  );
}
