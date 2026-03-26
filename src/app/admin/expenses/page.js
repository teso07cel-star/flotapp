import Link from "next/link";
import { getMonthlySummary, deleteGasto } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

async function deleteGastoAction(formData) {
  "use server";
  const id = formData.get("id");
  await deleteGasto(id);
  const { redirect } = await import("next/navigation");
  redirect("/admin/expenses");
}

export default async function GlobalExpenses() {
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  
  let summary = [];
  let allGastos = [];
  let totalMensual = 0;

  try {
    const res = await getMonthlySummary(month, year);
    summary = res.success ? res.data : [];

    allGastos = (await prisma.gasto.findMany({
      include: { vehiculo: true }
    })) || [];
    
    totalMensual = allGastos.reduce((sum, g) => {
      if (!g.fecha) return sum;
      const d = new Date(g.fecha);
      if (d.getMonth() === month && d.getFullYear() === year) return sum + (g.monto || 0);
      return sum;
    }, 0);
  } catch (error) {
    console.error("Error in GlobalExpenses page:", error);
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">Gestión Global de Gastos</h1>
          <p className="text-gray-500 dark:text-gray-400">Control total de egresos por mantenimiento y operación.</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-6 py-4 rounded-3xl shadow-sm">
           <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Total del Mes</div>
           <div className="text-2xl font-black text-blue-600 dark:text-blue-400">${(totalMensual || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    <th className="p-6 pl-10">Fecha</th>
                    <th className="p-6">Vehículo</th>
                    <th className="p-6">Tipo</th>
                    <th className="p-6 text-right">Monto</th>
                    <th className="p-6 text-right pr-10">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-sans">
                  {allGastos.length === 0 ? (
                    <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">No hay gastos registrados.</td></tr>
                  ) : allGastos.map((g) => (
                    <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                      <td className="p-6 pl-10 text-xs font-bold text-gray-500" suppressHydrationWarning>{new Date(g.fecha).toLocaleDateString()}</td>
                      <td className="p-6">
                        <div className="font-mono font-black text-sm tracking-widest uppercase bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">{g.vehiculo?.patente || "???"}</div>
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                          {g.tipo}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1 font-medium truncate max-w-[200px]">{g.descripcion}</div>
                      </td>
                      <td className="p-6 text-right font-black text-lg tracking-tight">
                        ${(g.monto || 0).toLocaleString()}
                      </td>
                      <td className="p-6 pr-10 text-right">
                         <form action={deleteGastoAction}>
                           <input type="hidden" name="id" value={g.id} />
                           <button type="submit" className="text-gray-300 hover:text-red-500 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                           </button>
                         </form>
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
