import { getPrisma } from "@/lib/prisma";
import { updateConfigLogistica } from "@/lib/appActions";
import { revalidatePath } from "next/cache";

export default async function SettingsPage() {
  const prisma = getPrisma();
  let configMap = {};
  try {
     const config = await prisma.configLogistica.findMany();
     configMap = config.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
  } catch (error) {
     console.error("Local DB fetch failed for ConfigLogistica:", error);
  }

  const phoneNorte = configMap["PHONE_NORTE"] || "5491111111111";
  const phoneSanTelmo = configMap["PHONE_SANTELMO"] || "5491122222222";

  async function saveConfig(formData) {
    "use server";
    const norte = formData.get("PHONE_NORTE");
    const santelmo = formData.get("PHONE_SANTELMO");
    
    await updateConfigLogistica({
      PHONE_NORTE: norte,
      PHONE_SANTELMO: santelmo
    });
    
    revalidatePath("/admin/settings");
    revalidatePath("/driver/success");
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"></div>
        
        <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/30">
               <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            </div>
            <div>
               <h1 className="text-3xl font-black text-white uppercase tracking-tight">Configuración del Panel</h1>
               <p className="text-sm font-bold text-amber-400 uppercase tracking-widest">Enrutamiento de Comunicaciones</p>
            </div>
        </div>

        <form action={saveConfig} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
             {/* WhatsApp NORTE */}
             <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-all group">
                 <label className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5 opacity-80" alt="WA" />
                    Destino: Base Norte
                 </label>
                 <input 
                   type="text" 
                   name="PHONE_NORTE" 
                   defaultValue={phoneNorte}
                   placeholder="Ej: 5491100000000"
                   className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                   required
                 />
                 <p className="text-[9px] text-slate-500 mt-3 font-bold uppercase">Formato Internacional sin el '+' (Ej: 549...)</p>
             </div>

             {/* WhatsApp SAN TELMO */}
             <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-all group">
                 <label className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5 opacity-80" alt="WA" />
                    Destino: Base San Telmo
                 </label>
                 <input 
                   type="text" 
                   name="PHONE_SANTELMO" 
                   defaultValue={phoneSanTelmo}
                   placeholder="Ej: 5491100000000"
                   className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                   required
                 />
                 <p className="text-[9px] text-slate-500 mt-3 font-bold uppercase">Formato Internacional sin el '+' (Ej: 549...)</p>
             </div>
             
          </div>
          
          <div className="pt-6 border-t border-slate-700/50 flex justify-end">
             <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-95">
                Guardar Configuración Táctica
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
