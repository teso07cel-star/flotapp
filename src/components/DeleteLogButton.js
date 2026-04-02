"use client";
import { useState } from "react";
import { deleteRegistroDiario } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function DeleteLogButton({ id }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000); // Reset confirm state after 3s
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteRegistroDiario(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("❌ Error: " + res.error);
        setConfirming(false);
      }
    } catch (error) {
      alert("❌ Error de comunicación");
      setConfirming(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className={`p-2 rounded-lg transition-all flex items-center justify-center relative group ${
        isDeleting ? 'bg-gray-100 text-gray-400' : 
        confirming ? 'bg-red-500 text-white animate-pulse' : 
        'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
      }`}
      title={isDeleting ? "Borrando..." : confirming ? "Click de nuevo para confirmar" : "Eliminar registro"}
    >
      {isDeleting ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
      ) : confirming ? (
        <span className="text-[10px] font-black uppercase px-2">¿BORRAR?</span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
      )}
    </button>
  );
}
