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

  if (!vehiculo) return <div className="min-h-screen bg-[#050b18] text-white flex items-center justify-center font-black">CARGANDO...</div>;

  return <DriverFormClient vehiculo={vehiculo} sucursales={sucursales} identifiedDriver="CONDUCTOR" isFirstLog={false} operationalStatus={{}} proposedKm={vehiculo.kmActual || 0} />;
}

export default function DriverForm() { return <Suspense><DriverFormContainer /></Suspense>; }
