export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { getRangeReport } from "@/lib/appActions";
import { format, startOfWeek, endOfWeek, subDays } from "date-fns";
import { es } from "date-fns/locale";
import ShareReportButton from "@/components/ShareReportButton";
import Link from "next/link";

export default async function RangeReport({ searchParams }) {
  const params = await searchParams;

  // Fechas por defecto: semana actual
  const now = new Date();
  const defaultStart = format(startOfWeek(now, { locale: es }), "yyyy-MM-dd");
  const defaultEnd   = format(endOfWeek(now,   { locale: es }), "yyyy-MM-dd");

  const startDate = params?.start || defaultStart;
  const endDate   = params?.end   || defaultEnd;

  const res = await getRangeReport(startDate, endDate);

  if (!res.success) {
    return (
      <div className="p-10 border-2 border-dashed border-red-800/40 rounded-[2rem] text-center">
        <h2 className="text-red-400 font-black uppercase mb-2">Error al cargar reporte</h2>
        <p className="text-xs text-red-400/60 font-medium">{res.error}</p>
      </div>
    );
  }

  const { registros, stats, vehicleData } = res.data;
  const branchEntries = Object.entries(stats.branchBreakdown || {}).sort((a, b) => b[1] - a[1]);

  const formatDate = (d) => format(new Date(d), "dd/MM/yy HH:mm", { locale: es });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-[10px] text-slate-500 hover:text-white uppercase font-black tracking-widest transition-colors">
            ← Panel Admin
          </Link>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mt-2">
            Reporte por Rango
          </h1>
          <p className="text-slate-500 text-sm font-bold mt-1">
            {startDate} → {endDate} · {registros.length} registros
          </p>
        </div>

        {registros.length > 0 && (
          <ShareReportButton
            reportText={`REPORTE FLOTA ${startDate} al ${endDate}\nRegistros: ${registros.length}\nVehículos: ${stats.uniqueVehicles}\nVisitas: ${stats.totalVisits}`}
          />
        )}
      </div>

      {/* Filtro de fechas */}
      <form method="get" className="flex flex-wrap gap-3 items-end bg-slate-900/40 border border-slate-700 p-4 rounded-2xl">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Fecha Inicio</label>
          <input
            type="date"
            name="start"
            defaultValue={startDate}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Fecha Fin</label>
          <input
            type="date"
            name="end"
            defaultValue={endDate}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
        >
          Aplicar
        </button>
        {/* Accesos rápidos */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Últimos 7 días", start: format(subDays(now, 6), "yyyy-MM-dd"), end: format(now, "yyyy-MM-dd") },
            { label: "Últimos 30 días", start: format(subDays(now, 29), "yyyy-MM-dd"), end: format(now, "yyyy-MM-dd") },
          ].map(opt => (
            <a
              key={opt.label}
              href={`?start=${opt.start}&end=${opt.end}`}
              className="text-[9px] font-black uppercase text-slate-400 hover:text-emerald-400 transition-colors border border-slate-700 hover:border-emerald-600 px-3 py-2 rounded-xl"
            >
              {opt.label}
            </a>
          ))}
        </div>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Registros",  value: registros.length,           color: "text-blue-400" },
          { label: "Vehículos",  value: stats.uniqueVehicles || 0,  color: "text-emerald-400" },
          { label: "Visitas",    value: stats.totalVisits || 0,      color: "text-violet-400" },
          { label: "KM teóricos",value: `${(stats.totalKm || 0).toLocaleString()}`, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/40 border border-slate-700 rounded-2xl p-4 text-center">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {registros.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest border-2 border-dashed border-slate-800 rounded-[2rem]">
          No hay registros en el período seleccionado.
        </div>
      ) : (
        <>
          {/* Sucursales más visitadas */}
          {branchEntries.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-700 rounded-[2rem] p-6 space-y-4">
              <h2 className="text-sm font-black text-slate-300 uppercase tracking-widest">Sucursales más visitadas</h2>
              <div className="space-y-2">
                {branchEntries.slice(0, 10).map(([nombre, count]) => (
                  <div key={nombre} className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, (count / branchEntries[0][1]) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-black text-white w-28 truncate">{nombre}</span>
                    <span className="text-[11px] font-black text-emerald-400 w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de registros */}
          <div className="overflow-x-auto rounded-[2rem] border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/60">
                  {["Fecha", "Unidad", "Conductor", "Tipo", "KM", "Sucursales", "Novedades"].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-[9px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registros.map(r => (
                  <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4 text-[11px] font-bold text-slate-300 whitespace-nowrap">{formatDate(r.fecha)}</td>
                    <td className="py-3 px-4 text-[11px] font-black text-white">{r.vehiculo?.patente || "S/D"}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-300">{r.nombreConductor || "-"}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        r.tipoReporte === "CIERRE" ? "bg-red-900/40 text-red-400" :
                        r.tipoReporte === "APERTURA" ? "bg-emerald-900/40 text-emerald-400" :
                        "bg-blue-900/40 text-blue-400"
                      }`}>
                        {r.tipoReporte || "S/D"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] font-mono text-slate-300">{r.kmActual?.toLocaleString() || "-"}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      {r.sucursales?.length > 0 ? r.sucursales.map(s => s.nombre).join(", ") : "-"}
                    </td>
                    <td className="py-3 px-4 text-[10px] text-amber-400 max-w-[160px] truncate" title={r.novedades || ""}>
                      {r.novedades || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
