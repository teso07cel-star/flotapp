
"use client";
import { useState, useEffect } from "react";
import { getAllVehiculos } from "@/lib/actions";

export default function VehicleSelector() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllVehiculos().then(res => {
            if (res.success) setVehicles(res.data.filter(v => v.activo));
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="min-h-screen bg-[#050b18] text-white flex items-center justify-center font-black">SINCRONIZANDO FLOTA...</div>;

    return (
        <div className="min-h-screen bg-[#050b18] p-6 text-white">
            <div className="max-w-md mx-auto space-y-10 pt-10">
                <div className="text-center">
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-blue-500">Unidad</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Seleccione el veh&iacute;culo a operar</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {vehicles.map(v => (
                        <button 
                            key={v.id}
                            onClick={() => window.location.href = `/driver/form?patente=${v.patente}`}
                            className="p-8 bg-gray-900 border-2 border-white/5 rounded-[2rem] flex items-center justify-between hover:border-blue-500/50 transition-all active:scale-95 group"
                        >
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{v.tipo || 'UNIDAD'}</p>
                                <p className="text-2xl font-black uppercase tracking-widest">{v.patente}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => window.location.href = '/driver/entry'}
                    className="w-full text-center text-gray-600 font-black uppercase text-[10px] tracking-widest"
                >
                    &larr; Volver a Identificaci&oacute;n
                </button>
            </div>
        </div>
    );
}
