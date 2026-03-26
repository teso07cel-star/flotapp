import { getChoferes, addChofer } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import DriverList from "@/components/DriverList";

async function addChoferAction(formData) {
  "use server";
  const nombre = formData.get("nombre")?.toString();
  if (nombre) {
    await addChofer(nombre);
    revalidatePath("/admin/drivers");
  }
}

export default async function DriversManager() {
  const res = await getChoferes();
  const choferes = res.success ? res.data : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase text-gray-900 dark:text-white">Gestión de Choferes</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Administra los conductores de tu flota y vincula sus dispositivos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Formulario Lateral */}
         <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-2xl shadow-black/5 sticky top-8">
              <h3 className="text-lg font-bold mb-6 uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Nuevo Chofer
              </h3>
              <form action={addChoferAction} className="space-y-5">
                 <div>
                   <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-widest">Nombre Completo</label>
                   <input 
                    name="nombre" 
                    type="text" 
                    required 
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium dark:text-white" 
                    placeholder="Ej. Juan Perez" 
                   />
                 </div>
                 <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 mt-4 active:scale-[0.98]">
                   Agregar Conductor
                 </button>
                 <p className="text-[10px] uppercase font-bold text-gray-400 mt-4 text-center">
                   El conductor podrá vincular su huella una vez creado.
                 </p>
              </form>
            </div>
         </div>

         {/* Lista Lado Derecho */}
         <div className="md:col-span-2">
            <DriverList initialDrivers={choferes} />
         </div>
      </div>
    </div>
  );
}
