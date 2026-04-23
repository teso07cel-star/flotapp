"use client";
import { useState, useTransition } from "react";
import { deleteRegistroDiario } from "@/lib/appActions";

export default function DeleteLogButton({ id }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!id) {
        alert("ID de registro no encontrado.");
        return;
    }

    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000); // 4 seconds to confirm
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteRegistroDiario(id);
        if (res?.success) {
          // El router.refresh() ocurre automáticamente con revalidatePath en la acción
          setConfirming(false);
        } else {
          alert("Error: " + (res?.error || "Desconocido"));
          setConfirming(false);
        }
      } catch (err) {
        alert("Error de red: " + err.message);
        setConfirming(false);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
        isPending ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
        confirming ? "bg-red-600 text-white shadow-lg shadow-red-500/40 ring-4 ring-red-500/20 scale-110" :
        "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
      }`}
      title={confirming ? "Pulsa otra vez para BORRAR" : "Eliminar registro"}
    >
      {isPending ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
      ) : confirming ? (
        <span className="text-[9px] font-black tracking-tighter px-1 animate-pulse">¿BORRAR?</span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      )}
    </button>
  );
}
