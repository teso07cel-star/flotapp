import React from 'react';

export const HiluxIcon = ({ className }) => (
  <div className={`relative overflow-hidden bg-transparent rounded-[inherit] ${className}`}>
    <img src="/icons/pickup.png" alt="Hilux" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700" />
  </div>
);

export const EnduroIcon = ({ className }) => (
  <div className={`relative overflow-hidden bg-transparent rounded-[inherit] ${className}`}>
    <img src="/icons/moto.png" alt="Enduro" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700" />
  </div>
);

export const ToyotaSedanIcon = ({ className }) => (
  <div className={`relative overflow-hidden bg-transparent rounded-[inherit] ${className}`}>
    <img src="/icons/auto.png" alt="Etios" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700" />
  </div>
);

export const LuxurySedanIcon = ({ className }) => (
  <div className={`relative overflow-hidden bg-transparent rounded-[inherit] ${className}`}>
    <img src="/icons/auto.png" alt="Luxury Sedan" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 scale-x-[-1]" />
    <div className="absolute inset-0 bg-slate-500/10 mix-blend-overlay pointer-events-none rounded-[inherit]" />
  </div>
);

export const AdminFaceIcon = ({ className = "w-14 h-14" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
  </svg>
);

export const DollarBillsIcon = ({ className = "w-14 h-14" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const StrategicGearIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

