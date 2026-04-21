import { getConfigLogistica, updateConfigLogistica } from "@/lib/appActions";
import Link from "next/link";

export default async function NotificationSettingsPage() {
  const res = await getConfigLogistica();
  const config = res.success ? res.data : {};

  async function handleSubmit(formData) {
    "use server";
    const data = {
      WHATSAPP_NORTE: formData.get("norte"),
      WHATSAPP_SANTELMO: formData.get("santelmo")
    };
    await updateConfigLogistica(data);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">Ajustes de Notificación</h1>
        <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Volver</Link>
      </div>

      <div className="bg-[#0f172a] border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-8">
        <p className="text-sm text-slate-400 leading-relaxed">
          Configura los números de WhatsApp que recibirán los avisos de arribo. 
          Ingresa el número con código de país (ej: <span className="text-blue-400 font-mono">54911...</span>)
        </p>

        <form action={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Responsable Zona Norte</label>
            <input 
              name="norte"
              type="text"
              defaultValue={config.WHATSAPP_NORTE || ""}
              placeholder="Ej: 5491100000000"
              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-6 font-mono text-white outline-none focus:border-green-500 transition-all shadow-inner"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Responsable San Telmo / Oeste</label>
            <input 
              name="santelmo"
              type="text"
              defaultValue={config.WHATSAPP_SANTELMO || ""}
              placeholder="Ej: 5491100000000"
              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-6 font-mono text-white outline-none focus:border-green-500 transition-all shadow-inner"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-8 bg-green-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(22,163,74,0.2)] active:scale-95 transition-all text-sm"
          >
            Guardar Configuración
          </button>
        </form>
      </div>

      <div className="text-center p-6 border-2 border-dashed border-white/5 rounded-3xl">
         <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Protocolo de Flota v8.5 Active</p>
      </div>
    </div>
  );
}
