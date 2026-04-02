"use client";
import { useState } from "react";
import { deleteRegistroDiario } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function DeleteLogButton({ id }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!globalThis.confirm?.("¿Estás seguro de que deseas eliminar este registro de la bitácora?")) return;
    
    setIsDeleting(true);
    try {
      const res = await deleteRegistroDiario(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("❌ Error del Servidor: " + res.error);
        console.error(res.error);
      }
    } catch (error) {
      alert("❌ Error de Conexión: No se pudo conectar con el servidor.");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className={`p-2 rounded-lg transition-colors ${isDeleting ? 'bg-gray-100 text-gray-400' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
      title="Eliminar registro"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
      </svg>
    </button>
  );
}
