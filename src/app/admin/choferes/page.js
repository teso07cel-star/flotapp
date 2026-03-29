import { getAllChoferes, addChofer, deleteChofer, updateChoferPatente } from "@/lib/actions";
import { revalidatePath } from "next/cache";

export default async function ChoferesAdmin() {
  const res = await getAllChoferes();
  
  if (!res.success) {
    return (
      <div className="p-10 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-3xl">
        <h2 className="text-red-600 dark:text-red-400 font-bold uppercase mb-2">Error de Conexión</h2>
        <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">{res.error}</p>
        <p className="mt-4 text-xs text-gray-500 italic text-balance">Si ves este error, es probable que la base de datos configurada en Vercel sea incorrecta o esté inaccesible.</p>
      </div>
    );
  }

  const choferes = res.data || [];

  async function addAction(formData) {
    "use server";
    const nombre = formData.get("nombre");
    await addChofer(nombre);
  }

  async function deleteAction(formData) {
    "use server";
    const id = formData.get("id");
    await deleteChofer(id);
  }

  async function assignPatenteAction(formData) {
    "use server";
    const id = formData.get("id");
    const patente = formData.get("patente");
    await updateChoferPatente(id, patente);
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">Gestión de Choferes</h1>
        <p className="text-gray-500 dark:text-gray-400">Administra la lista de conductores autorizados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-gray-900 dark:text-gray-100">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-black border-b border-gray-200 dark:border-gray-800">
                  <th className="p-5 pl-8 text-gray-900 dark:text-gray-100">Nombre</th>
                  <th className="p-5 text-gray-900 dark:text-gray-100">Patente Asignada</th>
                  <th className="p-5 text-right pr-8 text-gray-900 dark:text-gray-100">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {choferes.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="p-10 text-center text-gray-500 font-medium italic">No hay choferes registrados.</td>
                  </tr>
                ) : choferes.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                    <td className="p-5 pl-8 font-bold text-gray-900 dark:text-gray-100">{c.nombre}</td>
                    <td className="p-5">
                      <form action={assignPatenteAction} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={c.id} />
                        <input 
                          name="patente" 
                          defaultValue={c.patenteAsignada || ""} 
                          placeholder="Ninguna" 
                          className="w-24 bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-3 py-2 text-xs uppercase font-mono font-bold text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:font-sans placeholder:capitalize"
                        />
                        <button type="submit" className="text-blue-500 hover:text-blue-600 focus:outline-none transition-colors" title="Guardar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        </button>
                      </form>
                    </td>
                    <td className="p-5 pr-8 text-right">
                      <form action={deleteAction} className="inline">
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors focus:outline-none focus:underline">Eliminar</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-2xl shadow-black/5">
            <h2 className="text-xl font-bold mb-6 uppercase tracking-tight text-gray-900 dark:text-gray-100">Nuevo Chofer</h2>
            <form action={addAction} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nombre Completo</label>
                <input 
                  name="nombre" 
                  type="text" 
                  required 
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 uppercase text-xs tracking-widest">Agregar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
