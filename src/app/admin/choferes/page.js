import { getAllChoferes, addChofer, deleteChofer, updateChoferPatente, resetDriverDevice } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function ChoferesPage() {
  const res = await getAllChoferes();
  const choferes = res.success ? res.data : [];

  async function addChoferAction(formData) {
    "use server";
    const data = {
      nombre: formData.get("nombre"),
      dni: formData.get("dni"),
      patenteAsignada: formData.get("patenteAsignada"),
    };
    await addChofer(data);
    revalidatePath("/admin/choferes");
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase italic text-blue-600 dark:text-blue-400">Gestión de Choferes</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">Control de Personal Estratégico</p>
        </div>
        <Link href="/admin" className="text-xs font-black text-gray-400 hover:text-blue-500 transition-colors uppercase tracking-[0.3em] flex items-center gap-3 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-2"><path d="m15 18-6-6 6-6"/></svg>
          VOLVER AL PANEL
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form action={addChoferAction} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-2xl shadow-black/5 space-y-6 sticky top-8">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4">Nuevo Chofer</h2>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nombre Completo</label>
              <input name="nombre" required className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">DNI / ID</label>
              <input name="dni" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Patente Asignada</label>
              <input name="patenteAsignada" placeholder="Opcional" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest" />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
              Registrar Chofer
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <th className="p-6 pl-8">Nombre</th>
                  <th className="p-6">DNI</th>
                  <th className="p-6">Patente</th>
                  <th className="p-6 text-right pr-8">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {choferes.length === 0 ? (
                  <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-bold uppercase text-xs">No hay choferes registrados.</td></tr>
                ) : choferes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                    <td className="p-6 pl-8">
                      <div className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{c.nombre}</div>
                      {c.deviceId && <div className="text-[8px] text-emerald-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Dispositivo Vinculado
                      </div>}
                    </td>
                    <td className="p-6 text-xs font-bold text-gray-500">{c.dni || "-"}</td>
                    <td className="p-6">
                      <div className="font-mono font-black text-sm tracking-tighter bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 inline-block uppercase italic">
                        {c.patenteAsignada || "N/A"}
                      </div>
                    </td>
                    <td className="p-6 pr-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.deviceId && (
                          <form action={async () => { "use server"; await resetDriverDevice(c.id); revalidatePath("/admin/choferes"); }}>
                            <button type="submit" className="text-[8px] font-black uppercase text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 px-2 py-1.5 rounded-lg border border-amber-200 dark:border-amber-500/20 transition-all">
                              Reset Dispositivo
                            </button>
                          </form>
                        )}
                        <form action={async () => { "use server"; await deleteChofer(c.id); revalidatePath("/admin/choferes"); }}>
                          <button type="submit" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-all border border-transparent hover:border-red-100 dark:hover:border-red-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
