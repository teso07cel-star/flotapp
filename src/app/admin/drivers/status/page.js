export const dynamic = 'force-dynamic';
import { getDriverTraces } from "@/lib/actions";
import DriverStatusClient from "@/components/DriverStatusClient";

export default async function DriverStatusPage({ searchParams }) {
  const params = await searchParams;
  const dateStr = params.date || new Date().toISOString().split('T')[0];
  
  const res = await getDriverTraces(dateStr);
  const traces = res.success ? res.data : {};

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase italic text-blue-500">Estado <span className="text-slate-400">Chofer</span></h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Monitoreo Satelital de Coordenadas Operativas</p>
        </div>
      </div>

      <DriverStatusClient initialTraces={traces} />
    </div>
  );
}
