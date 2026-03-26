"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/actions";

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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mb-6 shadow-xl shadow-blue-500/20 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Acceso Administrativo</h1>
          <p className="text-gray-400">Ingresa la clave para gestionar la flota</p>
        </div>

        <form action={loginAdmin} suppressHydrationWarning className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="mb-8">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-3">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="block w-full px-5 py-4 bg-gray-900/50 border border-gray-700/50 rounded-2xl text-white text-xl text-center transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-700 font-bold"
              autoComplete="current-password"
            />
            {error && (
              <p className="mt-4 text-sm text-red-400 flex items-center justify-center gap-2 bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 text-base font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl hover:from-blue-500 hover:to-indigo-500 transform active:scale-[0.98]"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
