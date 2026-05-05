"use client";
export const dynamic = "force-dynamic";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DriverFormClient from "@/components/DriverFormClient";
import { getVehiculoByPatente, getAllSucursales } from "@/lib/actions";

function DriverFormContainer() {
  const searchParams = useSearchParams();
  const patente = searchParams.get("patente");
  const [vehiculo, setVehiculo] = useState(null);
  const [sucursales, setSucursales] = useState([]);

  useEffect(() => {
    if (patente) {
      getVehiculoByPatente(patente).then(res => {
        if (res.success) setVehiculo(res.data);
      });
    }
    getAllSucursales().then(res => {
      if (res.success) setSucursales(res.data);
    });
  }, [patente]);

  if (!vehiculo) return <div className="min-h-screen bg-[#050b18] text-white flex flex-col items-center justify-center p-10 text-center gap-6"><p className="text-2xl font-black uppercase tracking-tighter">Falta identificaci&oacute;n de unidad</p><a href="/driver/entry" className="bg-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Volver al inicio</a></div>;

  return <DriverFormClient vehiculo={vehiculo} sucursales={sucursales} identifiedDriver="CONDUCTOR" isFirstLog={false} operationalStatus={{}} proposedKm={vehiculo.kmActual || 0} />;
}

export default function DriverForm() { return <Suspense><DriverFormContainer /></Suspense>; }
