export const dynamic = 'force-dynamic';
import Link from "next/link";
import { getAllVehiculos, getUltimosRegistros, deleteVehiculo, deleteRegistroDiario } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import FormattedDate from "@/components/FormattedDate";

async function deleteVehiculoAction(formData) {
    "use server";
    const id = formData.get("id");
    await deleteVehiculo(id);
    const { redirect } = await import("next/navigation");
    redirect("/admin");
}

async function deleteRegistroAction(formData) {
    "use server";
    const id = formData.get("id");
    await deleteRegistroDiario(id);
    const { redirect } = await import("next/navigation");
    redirect("/admin");
}

async function resolverNovedadAction(formData) {
    "use server";
    const id = formData.get("id");
    const resolucion = formData.get("resolucion");
    const { resolverNovedad } = await import("@/lib/actions");
    await resolverNovedad(id, resolucion);
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin");
}
export default async function AdminDashboard() {
    const [vRes, rRes] = await Promise.all([
          getAllVehiculos(),
          getUltimosRegistros(10)
        ]);

  const vehiculos = vRes.success ? vRes.data : [];
    const registros = rRes.success ? rRes.data : [];

  return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">Panel General</h1>
            <p className="text-gray-500 dark:text-gray-400">Resumen de la actividad de tu flota.</p>
    </div>
          <Link href="/admin/summary" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
            VER RESUMEN MENSUAL
              </Link>
              </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Vehiculos List */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold uppercase tracking-tight">Flota de Vehiculos</h2>
              <Link href="/admin/vehicles/new" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors uppercase tracking-wider">
                            + Agregar Vehiculo
              </Link>
              </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-black border-b border-gray-200 dark:border-gray-800">
                                  <th className="p-5 pl-8">Patente</th>
                      <th className="p-5">Estado</th>
                      <th className="p-5 text-right pr-8">Acciones</th>
              </tr>
              </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              
