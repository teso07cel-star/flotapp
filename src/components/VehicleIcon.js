import React from 'react';
import Image from 'next/image';

export default function VehicleIcon({ categoria, className = "w-6 h-6" }) {
  const cat = (categoria || "").toUpperCase();
  
  if (cat.includes("MOTO")) {
    return (
      <div className={`relative ${className}`}>
        <Image src="/icons/moto.png" alt="Moto" fill sizes="100%" className="object-contain mix-blend-multiply dark:mix-blend-screen dark:invert" />
      </div>
    );
  }
  
  if (cat.includes("PICKUP") || cat.includes("CAMIONETA")) {
    return (
      <div className={`relative ${className}`}>
        <Image src="/icons/pickup.png" alt="Pickup" fill sizes="100%" className="object-contain mix-blend-multiply dark:mix-blend-screen dark:invert" />
      </div>
    );
  }
  
  // Default: Auto
  return (
    <div className={`relative ${className}`}>
      <Image src="/icons/auto.png" alt="Auto" fill sizes="100%" className="object-contain mix-blend-multiply dark:mix-blend-screen dark:invert" />
    </div>
  );
}
