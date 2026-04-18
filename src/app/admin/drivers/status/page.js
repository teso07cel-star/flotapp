export const dynamic = 'force-dynamic';
import { getDriverTraces, getArDate } from "@/lib/utils";
import DriverStatusClient from "@/components/DriverStatusClient";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function DriverStatusPage({ searchParams }) {
  const params = await searchParams;
  const dateStr = params?.date || getArDate();

  // Obtener todos los choferes activos
  const choferes = await getPrisma().chofer.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  // Para cada chofer, enriquecer con info del día
  const [sy, sm, sd] = dateStr.split("-").map(Number);
  const isoStart = new Date(sy, sm - 1, sd, 0, 0, 0, 0).toISOString();
  const isoEnd   = new Date(sy, sm - 1, sd, 23, 59, 59, 999).toISOString();

  const registrosHoy = await getPrisma().registroDiario.findMany({
    where: { fecha: { gte: isoStart, lte: isoEnd } },
    include: { sucursales: true },
    orderBy: { fecha: "desc" },
  });

  const choferesConEstado = choferes.map(c => {
    const registrosConductor = registrosHoy.filter(r => r.nombreConductor === c.nombre);
    const ultimoRegistro = registrosConductor[0];

    let estadoHoy = "INACTIVO";
    if (ultimoRegistro) {
      if (ultimoRegistro.tipoReporte === "CIERRE") estadoHoy = "CERRADO";
      else estadoHoy = "ACTIVO";
    }

    const visitasHoy = registrosConductor.reduce((sum, r) => sum + (r.sucursales?.length || 0), 0);

    return {
      ...c,
      estadoHoy,
      registrosHoy: registrosConductor.length,
      visitasHoy,
      ultimaUbicacion: ultimoRegistro?.lugarGuarda || null,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-[10px] text-slate-500 hover:text-white uppercase font-black tracking-widest transition-colors">
            ← Panel Admin
          </Link>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mt-2">
            Estado de Conductores
          </h1>
          <p className="text-slate-500 text-sm font-bold mt-1">
            {dateStr} · {choferesConEstado.filter(c => c.estadoHoy === "ACTIVO").length} activos
          </p>
        </div>

        <form method="get" className="flex gap-2">
          <input
            type="date"
            name="date"
            defaultValue={dateStr}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
          >
            Ver
          </button>
        </form>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Activos", value: choferesConEstado.filter(c => c.estadoHoy === "ACTIVO").length, color: "text-emerald-400" },
          { label: "Cerrados", value: choferesConEstado.filter(c => c.estadoHoy === "CERRADO").length, color: "text-slate-400" },
          { label: "Inactivos", value: choferesConEstado.filter(c => c.estadoHoy === "INACTIVO").length, color: "text-amber-400" },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900/40 border border-slate-700 rounded-2xl p-4 text-center">
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de conductores */}
      <DriverStatusClient choferes={choferesConEstado} dateString={dateStr} />
    </div>
  );
}
