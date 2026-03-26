import Link from "next/link";
import { createVehiculo } from "@/lib/actions";
import { redirect } from "next/navigation";



export default async function NewVehicle({ searchParams }) {
  const params = await searchParams;
  const errorMsg = params?.error;

  async function createVehiculoAction(formData) {
    "use server";
    const payload = {
      patente: formData.get("patente")?.toString().toUpperCase(),
      vtvVencimiento: formData.get("vtvVencimiento") || null,
      seguroVencimiento: formData.get("seguroVencimiento") || null,
      proximoServiceKm: parseInt(formData.get("proximoServiceKm")) || null
    };

    if (!payload.patente) return;

    const res = await createVehiculo(payload);
    if (res.success) {
      redirect("/admin");
    } else {
      redirect(`/admin/vehicles/new?error=${encodeURIComponent(res.error)}`);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in duration-500">
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl font-medium shadow-sm">
          {errorMsg}
        </div>
      )}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
        <Link href="/admin" className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Agregar Vehículo</h1>
           <p className="text-gray-500 dark:text-gray-400">Registrar una nueva unidad en la flota.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-sm">
        <form action={createVehiculoAction} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patente (Matrícula) *</label>
            <input
              name="patente"
              type="text"
              required
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-mono uppercase"
              placeholder="Ej. AB123CD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vencimiento VTV</label>
            <input
              name="vtvVencimiento"
              type="date"
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vencimiento Seguro</label>
            <input
              name="seguroVencimiento"
              type="date"
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Próximo Service (km)</label>
            <input
              name="proximoServiceKm"
              type="number"
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              placeholder="Ej. 150000"
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
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
