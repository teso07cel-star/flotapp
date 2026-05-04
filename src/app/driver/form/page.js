"use client";
export const dynamic = "force-dynamic";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAllSucursales, saveRegistroDiario } from "@/lib/actions";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kmActual) return alert("Ingresa el KM");
    setLoading(true);
    const res = await saveRegistroDiario({ patente, kmActual, novedades, choferId });

    if (res.success) {
      // REDIRECCIÓN A NAVEGACIÓN (Waze/WhatsApp)
      router.push("/driver/navigation/" + res.id);
    } else {
      alert("Error: " + res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b18] text-white p-6 font-sans">
      <div className="max-w-md mx-auto py-10">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">{patente}</h1>
          <p className="text-blue-500 font-bold text-[10px] uppercase tracking-widest mt-2">Protocolo Operativo Activo</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-[#0a1428] border-2 border-blue-500/20 rounded-[3rem] p-10 space-y-10 shadow-2xl">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-4 text-center">Kilometraje Actual</label>
            <input 
              type="number" 
              value={kmActual}
              onChange={(e) => setKmActual(e.target.value)}
              className="w-full bg-black/40 border-2 border-blue-500/30 rounded-2xl p-6 text-4xl font-black text-center outline-none focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-4 text-center">Novedades</label>
            <textarea 
              value={novedades}
              onChange={(e) => setNovedades(e.target.value)}
              className="w-full bg-black/40 border-2 border-blue-500/10 rounded-2xl p-6 text-sm font-bold h-32 resize-none outline-none focus:border-blue-500"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-900/50 active:scale-95 transition-all">
            {loading ? "Sincronizando..." : "Confirmar Reporte"}
          </button>
        </form>
        
        <div className="text-center mt-10">
          <Link href="/driver/entry" className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors">Cambiar Operador</Link>
        </div>
      </div>
    </div>
  );
}

export default function DriverForm() { return <Suspense><DriverFormContent /></Suspense>; }
