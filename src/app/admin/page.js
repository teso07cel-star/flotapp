    export const dynamic = 'force-dynamic';
    import Link from "next/link";
    import { getAllVehiculos, getUltimosRegistros, deleteVehiculo, deleteRegistroDiario } from "@/lib/appActions";
    import { revalidatePath } from "next/cache";
    import FormattedDate from "@/components/FormattedDate";

    async function deleteVehiculoAction(formData) {
              'use server';
              const id = formData.get('id');
              if (id) {
                          await deleteVehiculo(id);
                          revalidatePath("/admin");
              }
    }

    async function deleteRegistroAction(formData) {
              'use server';
              const id = formData.get('id');
              if (id) {
                          await deleteRegistroDiario(id);
                          revalidatePath("/admin");
              }
    }
}

    export default async function AdminDashboard() {
              const vRes = await getAllVehiculos();
              const rRes = await getUltimosRegistros();
              const vehiculos = vRes.success ? vRes.data : [];
              const registros = rRes.success ? rRes.data : [];

      return (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">Panel General</h1>
                      <p className="text-gray-500 dark:text-gray-400 text-sm italic">Gestion de flota y registros.</p>
          </div>
                    <div className="flex gap-3">
                        <Link href="/admin/summary" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 text-sm">
                          RESUMEN
          </Link>
          </div>
          </div>
        
