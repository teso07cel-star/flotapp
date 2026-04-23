"use client";
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-3xl bg-slate-900/50 flex items-center justify-center border-2 border-slate-700/50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[10px] font-black tracking-widest uppercase text-blue-400 animate-pulse">Iniciando Cartografía Táctica...</p>
      </div>
    </div>
  )
});

export default MapComponent;
