"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("flotapp_driver_name");
    document.cookie = "driver_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/driver/entry");
  };

  return (
    <button 
      onClick={handleLogout}
      className="group flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors mb-6 font-bold uppercase tracking-widest"
    >
      <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Cambiar de Operador
    </button>
  );
}
