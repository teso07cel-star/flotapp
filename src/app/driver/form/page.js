"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAllSucursales, createRegistroDiario } from "@/lib/actions";
import Link from "next/link";

function DriverFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patente = searchParams.get("patente") || "PGX770";
  const choferId = searchParams.get("choferId");

  const [sucursales, setSucursales] = useState([]);
  const [selectedSucursales, setSelectedSucursales] = useState([]);
  const [kmActual, setKmActual] = useState("");
  const [novedades, setNovedades] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllSucursales().then(res => {
      if (res.success) setSucursales(res.data);
    });
  }, []);

  const toggleSucursal = (id) => {
    setSelectedSucursales(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kmActual) return alert("Ingresa el KM actual");
    
    setLoading(true);
    const res = await createRegistroDiario({
      patente,
      choferId: parseInt(choferId),
      kmActual: parseInt(kmActual),
      novedades,
      sucursales: selectedSucursales
    });

    if (res.success) {
      router.push("/?success=true");
    } else {
      alert("Error: " + res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b18] text-white flex flex-col items-center p-4 selection:bg-blue-500/30 font-sans overflow-x-hidden">
      <div className="w-full max-w-sm flex flex-col items-center py-10">
        
        <div className="w-full bg-[#0a1428] border-2 border-blue-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden mb-12">
           <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
           
           <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-blue-600/40">
                 PROT-FLOT
              </div>
              <div className="text-right">
                 <h4 className="text-blue-500 font-black text-[10px] uppercase tracking-widest leading-none">Ruta Activa</h4>
                 <p className="text-white font-black text-xs uppercase tracking-tighter italic">Confirmación</p>
              </div>
           </div>

           <div className="flex flex-col items-center mb-8">
              <h1 className="text-5xl font-black tracking-[0.1em] italic uppercase text-white leading-none">{patente}</h1>
              <p className="text-gray-500 font-bold text-[9px] uppercase tracking-[0.4em] mt-2">CHOFER_ID: {choferId || "OFFLINE"}</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest text-center">Kilometraje Actual</label>
                <input 
                  type="number" 
                  value={kmActual}
                  onChange={(e) => setKmActual(e.target.value)}
                  placeholder="000.000"
                  required
                  className="w-full bg-black/40 border border-blue-500/20 rounded-2xl px-6 py-4 text-white font-black text-3xl text-center focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest text-center">Ruta / Sucursales</label>
                <div className="flex flex-wrap gap-2 justify-center max-h-60 overflow-y-auto p-1">
                   {sucursales.map(s => (
                     <button
                       key={s.id}
                       type="button"
                       onClick={() => toggleSucursal(s.id)}
                       className={`px-4 py-3 rounded-xl border-2 transition-all text-[9px] font-black uppercase tracking-widest ${
                         selectedSucursales.includes(s.id) 
                         ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105" 
                         : "bg-black/40 border-white/5 text-gray-500"
                       }`}
                     >
                        {s.nombre}
                     </button>
                   ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-95"
              >
                {loading ? "Sincronizando..." : "Confirmar Reporte"}
              </button>
           </form>
        </div>

        <Link href="/driver/entry" className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors">
          Cambiar de Operador
        </Link>
      </div>
    </div>
  );
}

export default function DriverForm() {
  return (
    <Suspense>
      <DriverFormContent />
    </Suspense>
  );
}
