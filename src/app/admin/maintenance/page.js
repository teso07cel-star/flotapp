import { getAllVehiculos } from "@/lib/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MaintenanceTrafficLight() {
  const res = await getAllVehiculos();
  const vehiculos = res.success ? res.data : [];

  const getStatus = (v) => {
    const lastKm = v.registros?.[0]?.kmActual || 0;
    
    // Reglas de Semáforo
    const serviceAlert = v.proximoServiceKm && (v.proximoServiceKm - lastKm < 1000);
    const serviceCritical = v.proximoServiceKm && (v.proximoServiceKm - lastKm < 200);
    
    const vtvAlert = v.vtvVencimiento && (new Date(v.vtvVencimiento) - new Date() < 1000 * 60 * 60 * 24 * 30);
    const vtvCritical = v.vtvVencimiento && (new Date(v.vtvVencimiento) - new Date() < 1000 * 60 * 60 * 24 * 7);
    
    const seguroAlert = v.seguroVencimiento && (new Date(v.seguroVencimiento) - new Date() < 1000 * 60 * 60 * 24 * 15);
    const seguroCritical = v.seguroVencimiento && (new Date(v.seguroVencimiento) - new Date() < 1000 * 60 * 60 * 24 * 3);

    if (serviceCritical || vtvCritical || seguroCritical) return "RED";
    if (serviceAlert || vtvAlert || seguroAlert) return "YELLOW";
    return "GREEN";
  };

  const categories = {
    RED: vehiculos.filter(v => getStatus(v) === "RED"),
    YELLOW: vehiculos.filter(v => getStatus(v) === "YELLOW"),
    GREEN: vehiculos.filter(v => getStatus(v) === "GREEN")
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white">Semáforo de Mantenimiento</h1>
          <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mt-2 opacity-80">MONITOR ESTRATÉGICO DE DISPONIBILIDAD</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CRITICAL (RED) */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-[3rem] p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse" />
            <h2 className="text-xl font-black uppercase italic tracking-widest text-red-500">Críticos ({categories.RED.length})</h2>
          </div>
          <div className="space-y-4">
            {categories.RED.length === 0 ? (
              <p className="text-[10px] font-black uppercase text-gray-700 tracking-widest text-center py-10">Sin unidades críticas</p>
            ) : categories.RED.map(v => (
              <VehicleCard key={v.id} vehiculo={v} color="red" />
            ))}
          </div>
        </div>

        {/* WARNING (YELLOW) */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[3rem] p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)]" />
            <h2 className="text-xl font-black uppercase italic tracking-widest text-amber-500">Atención ({categories.YELLOW.length})</h2>
          </div>
          <div className="space-y-4">
             {categories.YELLOW.length === 0 ? (
              <p className="text-[10px] font-black uppercase text-gray-700 tracking-widest text-center py-10">Flota estable</p>
            ) : categories.YELLOW.map(v => (
              <VehicleCard key={v.id} vehiculo={v} color="amber" />
            ))}
          </div>
        </div>

        {/* OPTIMAL (GREEN) */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem] p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
            <h2 className="text-xl font-black uppercase italic tracking-widest text-emerald-500">Óptimos ({categories.GREEN.length})</h2>
          </div>
          <div className="space-y-4">
            {categories.GREEN.map(v => (
              <VehicleCard key={v.id} vehiculo={v} color="emerald" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleCard({ vehiculo, color }) {
  const lastKm = vehiculo.registros?.[0]?.kmActual || 0;
  const colorClass = {
    red: "text-red-500 border-red-500/30 bg-red-500/5",
    amber: "text-amber-500 border-amber-500/30 bg-amber-500/5",
    emerald: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
  }[color];

  return (
    <Link href={`/admin/vehicles/${vehiculo.id}`} className={`block p-6 rounded-2xl border transition-all hover:scale-[1.02] active:scale-95 ${colorClass}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-2xl font-black tracking-widest italic leading-none">{vehiculo.patente}</h3>
        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{lastKm.toLocaleString()} KM</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
         {vehiculo.proximoServiceKm && (
           <span className="text-[7px] font-black uppercase tracking-tighter bg-black/20 px-2 py-1 rounded">Svc: {vehiculo.proximoServiceKm}</span>
         )}
         {vehiculo.vtvVencimiento && (
           <span className="text-[7px] font-black uppercase tracking-tighter bg-black/20 px-2 py-1 rounded">VTV: {new Date(vehiculo.vtvVencimiento).toLocaleDateString()}</span>
         )}
      </div>
    </Link>
  );
}
