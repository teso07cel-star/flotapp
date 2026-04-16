"use client";
import { useState, useEffect } from "react";

export default function FormattedDate({ date, showTime = true, showDate = true }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (!mounted) {
    // Renderizado inicial en el servidor o antes del montaje (puedes mostrar un placeholder o nada)
    return <span className="opacity-0">Cargando...</span>;
  }

  const d = new Date(date);
  
  const dateStr = d.toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = d.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <span>
      {showDate && dateStr}
      {showDate && showTime && " - "}
      {showTime && timeStr}
    </span>
  );
}
