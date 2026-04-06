import { getAllSucursales, addSucursal } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import BranchList from "@/components/BranchList";

async function addSucursalAction(formData) {
  "use server";
  const nombre = formData.get("nombre")?.toString();
  const direccion = formData.get("direccion")?.toString();
  if (nombre) {
    await addSucursal(nombre, direccion);
    revalidatePath("/admin/branches");
  }
}

export default async function BranchesManager() {
  const res = await getAllSucursales();
  const sucursales = res.success ? res.data : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase text-slate-100 dark:text-white">Gestión de Sucursales</h1>
          <p className="text-gray-500  font-medium">Administra los destinos visitables por tu flota.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1">
            <div className="bg-slate-900/40 bg-[#0f172a] border border-slate-700  rounded-[2rem] p-8 shadow-2xl shadow-black/5 sticky top-8">
              <h3 className="text-lg font-bold mb-6 uppercase tracking-wider text-slate-200 ">Nueva Sucursal</h3>
              <form action={addSucursalAction} className="space-y-5">
                 <div>
                   <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-widest">Nombre</label>
                   <input 
                    name="nombre" 
                    type="text" 
                    required 
                    className="w-full bg-slate-800/30  border border-slate-700  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium dark:text-white" 
                    placeholder="Ej. Base CABA" 
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-widest">Dirección (Opcional)</label>
                   <input 
                    name="direccion" 
                    type="text" 
                    className="w-full bg-slate-800/30  border border-slate-700  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium dark:text-white" 
                    placeholder="Av. Siempre Viva 123" 
                   />
                 </div>
                 <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 mt-4 active:scale-[0.98]">
                   Agregar Sucursal
                 </button>
              </form>
            </div>
         </div>

         <div className="md:col-span-2">
            <BranchList initialSucursales={sucursales} />
         </div>
      </div>
    </div>
  );
}
