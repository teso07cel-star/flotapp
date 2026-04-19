"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/authActions";
import { AdminFaceIcon } from "@/components/FuturisticIcons";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAction = async (formData) => {
    const pwd = formData.get("password")?.toString();
    const res = await loginAdmin(formData);
    if (res && !res.success) {
      setError(res.error || "Contraseña incorrecta.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 selection:bg-blue-500/30">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-3xl opacity-50 mix-blend-screen" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full blur-3xl opacity-50 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center space-x-4 mb-8">
             <div className="w-10 h-[1px] bg-gradient-to-r from-transparent to-blue-500/50" />
             <h2 className="text-3xl font-black tracking-[-0.05em] text-white flex items-center gap-1">
                FLOT<span className="text-blue-500">APP</span>
             </h2>
             <div className="w-10 h-[1px] bg-gradient-to-l from-transparent to-blue-500/50" />
          </div>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-white mb-2 uppercase">Acceso <span className="text-blue-500">Táctico</span></h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Gestión de Flota Corporativa</p>
        </div>

        <form action={loginAdmin} suppressHydrationWarning className="glass-panel p-10 rounded-[3rem] blue-glow-border relative overflow-hidden">
          <div className="mb-8 relative z-10">
            <label htmlFor="password" className="block text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 text-center">
              Clave de Autorización
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••"
              className="block w-full px-5 py-6 bg-[#020617] border-2 border-blue-500/20 rounded-3xl text-white text-4xl text-center transition-all duration-300 focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 outline-none placeholder:text-slate-900 font-mono tracking-[0.5em]"
              autoComplete="current-password"
            />
            {error && (
              <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center justify-center gap-2 bg-red-500/10 py-3 px-4 rounded-xl border border-red-500/20 animate-bounce">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-6 text-[13px] font-black uppercase tracking-[0.4em] text-white transition-all duration-300 bg-blue-600 rounded-3xl hover:bg-blue-500 shadow-2xl active:scale-[0.97]"
          >
            Validar
          </button>
        </form>
      </div>
    </div>
  );
}
