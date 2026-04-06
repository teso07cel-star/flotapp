import Link from "next/link";
import { createVehiculo } from "@/lib/actions";
import { redirect } from "next/navigation";

async function createVehiculoAction(formData) {
  "use server";
  const payload = {
    patente: formData.get("patente")?.toString().toUpperCase(),
    vtvVencimiento: formData.get("vtvVencimiento") || null,
    seguroVencimiento: formData.get("seguroVencimiento") || null,
    proximoServiceKm: parseInt(formData.get("proximoServiceKm")) || null
  };

  if (!payload.patente) return; // Should be handled by required attribute

  const res = await createVehiculo(payload);
  if (res.success) {
    redirect("/admin");
  }
}

export default function NewVehicle() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-slate-700  pb-6 mb-8">
        <Link href="/admin" className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Agregar Vehículo</h1>
           <p className="text-gray-500 ">Registrar una nueva unidad en la flota.</p>
        </div>
      </div>

      <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-3xl p-6 sm:p-10 shadow-sm">
        <form action={createVehiculoAction} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Patente (Matrícula) *</label>
            <input
              name="patente"
              type="text"
              required
              className="w-full bg-slate-800/30  border border-slate-700  rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-mono uppercase"
              placeholder="Ej. AB123CD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Vencimiento VTV</label>
            <input
              name="vtvVencimiento"
              type="date"
              className="w-full bg-slate-800/30  border border-slate-700  rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Vencimiento Seguro</label>
            <input
              name="seguroVencimiento"
              type="date"
              className="w-full bg-slate-800/30  border border-slate-700  rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Próximo Service (km)</label>
            <input
              name="proximoServiceKm"
              type="number"
              className="w-full bg-slate-800/30  border border-slate-700  rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              placeholder="Ej. 150000"
            />
          </div>

          <div className="pt-4 border-t border-slate-700 ">
             <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md"
              >
                Crear Vehículo
              </button>
          </div>
        </form>
      </div>

    </div>
  );
}
