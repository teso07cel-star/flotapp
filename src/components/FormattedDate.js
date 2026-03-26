"use client";
import { useState, useEffect } from "react";

export default function FormattedDate({ date, showTime = true, showDate = true }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Renderizado inicial en el servidor o antes del montaje (puedes mostrar un placeholder o nada)
    return <span className="opacity-0">Cargando...</span>;
  }

  const d = new Date(date);
  
  const dateStr = d.toLocaleDateString();
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <span>
      {showDate && dateStr}
      {showDate && showTime && " - "}
      {showTime && timeStr}
    </span>
  );
}
